using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using TrickyTrayAPI.Services;

namespace TrickyTrayAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/cart")]
    public class CartController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly IOrderGiftService _orderGiftService;

        public CartController(
            IOrderService orderService,
            IOrderGiftService orderGiftService)
        {
            _orderService = orderService;
            _orderGiftService = orderGiftService;
        }

        private int GetBuyerId()
        {
            var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                   ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(sub, out var buyerId))
                throw new UnauthorizedAccessException("Invalid buyer id");

            return buyerId;
        }


        [HttpGet("active")]
        public async Task<IActionResult> GetActiveCart()
        {
            var buyerId = GetBuyerId();
            var cart = await _orderService.GetActiveOrderViewAsync(buyerId);
            return Ok(cart);
        }

        [HttpPost("active/add/{giftId:int}")]
        public async Task<IActionResult> AddToActiveCart(int giftId)
        {
            var buyerId = GetBuyerId();

            var draft = await _orderService.GetOrCreateDraftAsync(buyerId);

            var success = await _orderGiftService.AddGiftAsync(draft.Id, giftId);
            if (!success)
                return BadRequest("Cannot add gift to cart");

            var updated = await _orderService.GetOrderViewAsync(draft.Id);
            return Ok(updated);
        }

        [HttpDelete("active/remove/{giftId:int}")]
        public async Task<IActionResult> RemoveFromActiveCart(int giftId)
        {
            var buyerId = GetBuyerId();
            var draft = await _orderService.GetOrCreateDraftAsync(buyerId);

            var success = await _orderGiftService.RemoveGiftAsync(draft.Id, giftId);
            if (!success)
                return BadRequest("Cannot remove gift");

            var updated = await _orderService.GetOrderViewAsync(draft.Id);
            return Ok(updated);
        }

        [HttpPost("active/confirm")]
        public async Task<IActionResult> ConfirmActiveCart()
        {
            try
            {
                var buyerId = GetBuyerId();
                var draft = await _orderService.GetOrCreateDraftAsync(buyerId);

                var success = await _orderService.ConfirmOrderAsync(draft.Id);
                if (!success) return BadRequest("Cannot confirm order.");

                return Ok(new { success = true });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);

            }
        }

    }
}
