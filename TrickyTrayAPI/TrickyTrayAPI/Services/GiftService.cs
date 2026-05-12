using TrickyTrayAPI.DTOs;
using TrickyTrayAPI.Models;
using TrickyTrayAPI.Repositories;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace TrickyTrayAPI.Services
{
    public class GiftService : IGiftService
    {
        private readonly IGiftRepository _giftRepo;
        private readonly SystemStateService _systemStateService;
        private readonly IOrderGiftRepository _orderGiftRepository;
        private readonly IDistributedCache _cache;
        private readonly IConfiguration _configuration;
        private const string AllGiftsCacheKey = "all_gifts";

        public GiftService(IGiftRepository giftRepo, SystemStateService systemStateService, IOrderGiftRepository orderGiftRepository,
    IDistributedCache cache,
    IConfiguration configuration)
        {
            _giftRepo = giftRepo;
            _systemStateService = systemStateService;
            _orderGiftRepository = orderGiftRepository;
            _cache = cache;
            _configuration = configuration;
        }

        public async Task<IEnumerable<GiftViewDto>> GetAllAsync()
        {
            const string cacheKey = AllGiftsCacheKey;
            var cachedData = await _cache.GetStringAsync(cacheKey);

            if (!string.IsNullOrEmpty(cachedData))
            {
                var cachedGifts = JsonSerializer.Deserialize<List<GiftViewDto>>(cachedData);
                if (cachedGifts != null)
                {
                    return cachedGifts;
                }
            }

            var gifts = await _giftRepo.GetAllAsync();
            var result = gifts.Select(g => MapToViewDto(g)).ToList();

            int expirationMinutes =
                _configuration.GetValue<int>("Redis:CacheExpirationMinutes", 5);

            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow =
                    TimeSpan.FromMinutes(expirationMinutes)
            };

            var json = JsonSerializer.Serialize(result);

            await _cache.SetStringAsync(cacheKey, json, options);

            return result;
        }

        public async Task<GiftViewDto?> GetByIdAsync(int id)
        {
            var gift = await _giftRepo.GetByIdAsync(id);

            return gift != null ? MapToViewDto(gift) : null;
        }
        private GiftViewDto MapToViewDto(Gift g)
        {
            return new GiftViewDto
            {
                Id = g.Id,
                Name = g.Name,
                Price = g.Price,
                ImageUrl = g.ImageUrl,
                DonorName = g.Donor?.Name ?? "תורם אנונימי"
            };
        }

        public async Task<GiftViewDto> CreateAsync(GiftCreateDto createDto)
        {
            var systemState = _systemStateService.GetState();
            if (systemState.Status != SystemState.SaleStatus.Draft)
            {
                throw new InvalidOperationException("Cannot create gift after the sale has started.");
            }

            var gift = new Gift
            {
                Name = createDto.Name,
                Description = createDto.Description,
                Price = createDto.Price,
                ImageUrl = createDto.ImageUrl,
                Category = createDto.Category,
                DonorId = createDto.DonorId
            };


            var savedGift = await _giftRepo.CreateAsync(gift);
            await _cache.RemoveAsync(AllGiftsCacheKey);

            return MapToViewDto(savedGift);
        }

        public async Task<GiftViewDto?> UpdateAsync(int id, GiftUpdateDto updateDto)
        {
            var systemState = _systemStateService.GetState();
            if (systemState.Status != SystemState.SaleStatus.Draft)
            {
                throw new InvalidOperationException("Cannot update gift after the sale has started.");
            }
            var existingGift = await _giftRepo.GetByIdAsync(id);
            if (existingGift == null) return null;

            if (updateDto.Name != null) existingGift.Name = updateDto.Name;
            if (updateDto.Description != null) existingGift.Description = updateDto.Description;
            if (updateDto.Price != 0) existingGift.Price = updateDto.Price;
            if (updateDto.DonorId.HasValue) existingGift.DonorId = updateDto.DonorId.Value;
            if (updateDto.Category != null) existingGift.Category = updateDto.Category;
            if (updateDto.ImageUrl != null) existingGift.ImageUrl = updateDto.ImageUrl;


            var update = await _giftRepo.UpdateAsync(existingGift);
            await _cache.RemoveAsync(AllGiftsCacheKey);
            return update != null ? MapToViewDto(update) : null;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var state = _systemStateService.GetState();

            if (state.Status == SystemState.SaleStatus.Finished)
                throw new InvalidOperationException("Cannot delete gifts after sale is finished");

            if (state.Status == SystemState.SaleStatus.Active)
            {
                var orders = await _orderGiftRepository.GetOrdersForGiftAsync(id);
                if (orders.Any())
                    throw new InvalidOperationException("Cannot delete gift that already has purchases");
            }

            var deleted = await _giftRepo.DeleteAsync(id);

            if (deleted)
            {
                await _cache.RemoveAsync(AllGiftsCacheKey);
            }
            return deleted;
        }

        public async Task<List<GiftViewDto>> SearchGiftsAsync(string? name, string? donorName, int? buyersCount)
        {
            var gifts = await _giftRepo.SearchGiftsAsync(name, donorName, buyersCount);

            return gifts.Select(g => new GiftViewDto
            {
                Id = g.Id,
                Name = g.Name,
                DonorName = g.Donor?.Name ?? "תורם אנונימי",
                ImageUrl = g.ImageUrl
            }).ToList();
        }

        public async Task<List<GiftViewDto>> GetSortedGiftsAsync(string sortBy)
        {
            var gifts = await _giftRepo.GetSortedGiftsAsync(sortBy);

            return gifts.Select(g => new GiftViewDto
            {
                Id = g.Id,
                Name = g.Name,
                Price = g.Price,
                DonorName = g.Donor?.Name ?? "תורם אנונימי",
                ImageUrl = g.ImageUrl,
                Category = g.Category
            }).ToList();
        }


    }
}