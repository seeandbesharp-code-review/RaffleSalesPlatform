using TrickyTrayAPI.DTOs;
using TrickyTrayAPI.Models;
using TrickyTrayAPI.Repositories;

namespace TrickyTrayAPI.Services
{
    public class OrderGiftService : IOrderGiftService
    {
        private readonly IOrderGiftRepository _orderGiftRepository;
        private readonly SystemStateService _systemStateService;

        public OrderGiftService(IOrderGiftRepository orderGiftRepository, SystemStateService systemStateService)
        {
            _orderGiftRepository = orderGiftRepository;
            _systemStateService = systemStateService;
        }

        public async Task<bool> AddGiftAsync(int orderId, int giftId)

        {
            var systemState = _systemStateService.GetState();
            if (systemState.Status != SystemState.SaleStatus.Active)
            {
                throw new InvalidOperationException("Cannot add gift to cart now.");
            }
            return await _orderGiftRepository.AddGiftAsync(orderId, giftId);
        }

        public async Task<bool> RemoveGiftAsync(int orderId, int giftId)
        {
            var systemState = _systemStateService.GetState();

            if (systemState.Status != SystemState.SaleStatus.Draft &&
                systemState.Status != SystemState.SaleStatus.Active)
            {
                throw new InvalidOperationException("Cannot remove gift from cart now.");
            }

            return await _orderGiftRepository.RemoveGiftAsync(orderId, giftId);
        }


        public async Task<List<OrderGift>> GetOrdersForGiftAsync(int giftId)
        {
            return await _orderGiftRepository.GetOrdersForGiftAsync(giftId);
        }

        public async Task<List<OrderGiftDto>> GetSortedPurchasesAsync(string sortBy)
        {
            var purchases = await _orderGiftRepository.GetSortedPurchasesAsync(sortBy);

            var result = purchases
                .GroupBy(p => p.GiftId)
                .Select(group => new OrderGiftDto
                {
                    GiftId = group.Key,
                    GiftName = group.First().Gift.Name,
                    Price = group.First().Gift.Price,
                    PurchaseCount = group.Count(),
                    Purchasers = group.Select(p => new BuyerDetailDto
                    {
                        OrderId = p.OrderId,
                        FullName = p.Order?.Buyer?.Name ?? "אנונימי",
                        Date = p.Order?.OrderDate ?? DateTime.Now,
                        TicketsCount = 1
                    }).ToList()
                }).ToList();

            if (sortBy == "price")
                return result.OrderByDescending(x => x.Price).ToList();

            return result.OrderByDescending(x => x.PurchaseCount).ToList();
        }
    }
}
