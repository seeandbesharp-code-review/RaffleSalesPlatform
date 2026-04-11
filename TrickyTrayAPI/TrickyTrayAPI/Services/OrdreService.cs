using TrickyTrayAPI.DTOs;
using TrickyTrayAPI.Models;
using TrickyTrayAPI.Repositories;

namespace TrickyTrayAPI.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly SystemStateService _systemStateService;

        public OrderService(IOrderRepository orderRepository, SystemStateService systemStateService)
        {
            _orderRepository = orderRepository;
            _systemStateService = systemStateService;
        }

        public async Task<Order> GetOrCreateDraftAsync(int buyerId)
        {
            var draft = await _orderRepository.GetActiveDraftAsync(buyerId);
            if (draft != null) return draft;

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
            if (order == null) return null;

            return new OrderViewDto
            {
                Id = order.Id,
                BuyerId = order.BuyerId,
                BuyerName = order.Buyer.Name,
                OrderDate = order.OrderDate,
                Status = order.Status.ToString(),

                Items = order.OrderGifts.Select(og => new CartItemDto
                {
                    GiftId = og.GiftId,
                    GiftName = og.Gift.Name,
                    Price = og.Gift.Price,
                    Category = og.Gift.Category
                }).ToList(),

                TotalPrice = order.OrderGifts.Sum(og => og.Gift.Price)
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
                throw new InvalidOperationException("לא ניתן לאשר הזמנה כשהמכירה אינה פעילה.");

            return await _orderRepository.ConfirmOrderAsync(orderId);
        }

    }
}
