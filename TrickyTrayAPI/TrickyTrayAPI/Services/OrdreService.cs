using Microsoft.Extensions.Options;
using TrickyTrayAPI.DTOs;
using TrickyTrayAPI.Messaging;
using TrickyTrayAPI.Models;
using TrickyTrayAPI.Repositories;

namespace TrickyTrayAPI.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly SystemStateService _systemStateService;
        private readonly IKafkaProducer _kafkaProducer;
        private readonly KafkaSettings _kafkaSettings;
        private readonly ILogger<OrderService> _logger;

        public OrderService(
            IOrderRepository orderRepository,
            SystemStateService systemStateService,
            IKafkaProducer kafkaProducer,
            IOptions<KafkaSettings> kafkaOptions,
            ILogger<OrderService> logger)
        {
            ArgumentNullException.ThrowIfNull(orderRepository);
            ArgumentNullException.ThrowIfNull(systemStateService);
            ArgumentNullException.ThrowIfNull(kafkaProducer);
            ArgumentNullException.ThrowIfNull(kafkaOptions);
            ArgumentNullException.ThrowIfNull(logger);

            _orderRepository = orderRepository;
            _systemStateService = systemStateService;
            _kafkaProducer = kafkaProducer;
            _kafkaSettings = kafkaOptions.Value;
            _logger = logger;
        }

        public async Task<Order> GetOrCreateDraftAsync(int buyerId)
        {
            var draft = await _orderRepository.GetActiveDraftAsync(buyerId);

            if (draft != null)
            {
                return draft;
            }

            return await _orderRepository.CreateDraftAsync(buyerId);
        }

        public async Task<OrderViewDto?> GetActiveOrderViewAsync(int buyerId)
        {
            var draft = await GetOrCreateDraftAsync(buyerId);

            return await GetOrderViewAsync(draft.Id);
        }

        public async Task<OrderViewDto?> GetOrderViewAsync(int orderId)
        {
            var order = await _orderRepository.GetOrderWithItemsAsync(orderId);

            if (order == null)
            {
                return null;
            }

            return new OrderViewDto
            {
                Id = order.Id,
                BuyerId = order.BuyerId,
                BuyerName = order.Buyer?.Name ?? string.Empty,
                OrderDate = order.OrderDate,
                Status = order.Status.ToString(),

                Items = order.OrderGifts
                    .Select(orderGift => new CartItemDto
                    {
                        GiftId = orderGift.GiftId,
                        GiftName = orderGift.Gift.Name,
                        Price = orderGift.Gift.Price,
                        Category = orderGift.Gift.Category
                    })
                    .ToList(),

                TotalPrice = order.OrderGifts.Sum(
                    orderGift => orderGift.Gift.Price)
            };
        }

        public Task<Order> CreateDraftAsync(int buyerId)
        {
            return GetOrCreateDraftAsync(buyerId);
        }

        public async Task<bool> ConfirmOrderAsync(int orderId)
        {
            var systemState = _systemStateService.GetState();

            if (systemState.Status != SystemState.SaleStatus.Active)
            {
                throw new InvalidOperationException(
                    "לא ניתן לאשר הזמנה כשהמכירה אינה פעילה.");
            }

            var confirmed =
                await _orderRepository.ConfirmOrderAsync(orderId);

            if (!confirmed)
            {
                return false;
            }

            var confirmedOrder =
                await _orderRepository.GetOrderWithItemsAsync(orderId);

            if (confirmedOrder == null)
            {
                throw new InvalidOperationException(
                    $"הזמנה מספר {orderId} אושרה, אך לא נמצאה לאחר האישור.");
            }

            if (confirmedOrder.Buyer == null)
            {
                throw new InvalidOperationException(
                    $"לא נמצאו פרטי קונה עבור הזמנה מספר {orderId}.");
            }

            var orderEvent = new OrderConfirmedEvent
            {
                OrderId = confirmedOrder.Id,
                OrderDate = confirmedOrder.OrderDate,
                Status = confirmedOrder.Status.ToString(),

                BuyerId = confirmedOrder.BuyerId,
                BuyerName = confirmedOrder.Buyer.Name,
                BuyerEmail = confirmedOrder.Buyer.Email,
                BuyerPhone = confirmedOrder.Buyer.Phone,

                ItemsCount = confirmedOrder.OrderGifts.Count,

                TotalPrice = confirmedOrder.OrderGifts.Sum(
                    orderGift => orderGift.Gift.Price),

                Items = confirmedOrder.OrderGifts
                    .Select(orderGift => new OrderConfirmedItemEvent
                    {
                        OrderGiftId = orderGift.Id,
                        GiftId = orderGift.GiftId,
                        GiftName = orderGift.Gift.Name,
                        Category = orderGift.Gift.Category,
                        Price = orderGift.Gift.Price
                    })
                    .ToList()
            };

            await _kafkaProducer.ProduceAsync(
                _kafkaSettings.Topic,
                confirmedOrder.Id.ToString(),
                orderEvent);

            _logger.LogInformation(
                "Order {OrderId} was confirmed and published to Kafka topic {Topic}.",
                confirmedOrder.Id,
                _kafkaSettings.Topic);

            return true;
        }
    }
}
