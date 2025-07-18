using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using gymfit_backend.Models;
using gymfit_backend.Data;
using BCrypt.Net;

namespace gymfit_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly GymFitContext _context;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IConfiguration config, GymFitContext context, ILogger<AuthController> logger)
        {
            _config = config;
            _context = context;
            _logger = logger;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginModel? model)
        {
            if (model == null) return BadRequest("Invalid request");

            var user = _context.Users.FirstOrDefault(u => u.Email == model.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(model.Password, user.PasswordHash))
                return Unauthorized("Invalid credentials");

            var token = GenerateJwtToken(user);
            return Ok(new { token, user = new { user.Id, user.Name, user.Email, user.Role, mustChangePassword = user.MustChangePassword } });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel? model)
        {
            _logger.LogInformation($"Înregistrare pentru: {model?.Email}");

            try
            {
                if (model == null) return BadRequest("Invalid request");

                var normalizedEmail = model.Email.ToLower();

                if (_context.Users.Any(u => u.Email == normalizedEmail))
                    return BadRequest("User already exists");

                var user = new User
                {
                    Name = model.Name,
                    Email = normalizedEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.Password),
                    Role = model.Role ?? "Client" // Default la Client dacă nu e specificat
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                var token = GenerateJwtToken(user);
                return Ok(new { token, user = new { user.Id, user.Name, user.Email, user.Role, mustChangePassword = user.MustChangePassword } });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Eroare înregistrare");
                return StatusCode(500, "Eroare server");
            }
        }

        // GET: api/Auth/me - Obține informațiile utilizatorului curent
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return NotFound();

            return Ok(new { user.Id, user.Name, user.Email, user.Role });
        }

        private string GenerateJwtToken(User user)
        {
            var securityKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured")));

            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), // UserId pentru autorizare
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
