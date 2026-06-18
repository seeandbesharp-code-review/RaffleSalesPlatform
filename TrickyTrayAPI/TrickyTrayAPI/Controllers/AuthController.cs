using Microsoft.AspNetCore.Mvc;
using TrickyTrayAPI.DTOs;
using TrickyTrayAPI.Services;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequestDto login)
    {
        if (login == null)
        {
            return BadRequest(new
            {
                message = "לא התקבלו פרטי התחברות."
            });
        }

        var token = await _authService.LoginAsync(login);

        if (string.IsNullOrWhiteSpace(token))
        {
            return Unauthorized(new
            {
                message = "כתובת המייל או הסיסמה אינם נכונים."
            });
        }

        Response.Cookies.Append(
            "access_token",
            token,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddMinutes(60),
                IsEssential = true
            });

        return Ok(new
        {
            token,
            message = "Login successful"
        });
    }
}
