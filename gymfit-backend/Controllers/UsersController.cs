using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.EntityFrameworkCore;
using gymfit_backend.Data;
using gymfit_backend.Models;
using BCrypt.Net;

namespace gymfit_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "AdminOnly")] // Doar admin poate gestiona utilizatorii
    public class UsersController : ControllerBase
    {
        private readonly GymFitContext _context;

        public UsersController(GymFitContext context)
        {
            _context = context;
        }

        // GET: api/Users - Listare utilizatori (doar admin)
        [HttpGet]
        [EnableQuery] // Permite interogări OData
        public async Task<ActionResult<IEnumerable<object>>> GetUsers()
        {
            // Nu returnăm PasswordHash pentru securitate
            return await _context.Users
                .Select(u => new { u.Id, u.Name, u.Email, u.Role })
                .ToListAsync();
        }

        // GET: api/Users/5 - Obține un utilizator specific (doar admin)
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetUser(int id)
        {
            var user = await _context.Users
                .Where(u => u.Id == id)
                .Select(u => new { u.Id, u.Name, u.Email, u.Role })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        // PUT: api/Users/5 - Actualizează un utilizator (doar admin)
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(int id, [FromBody] UpdateUserModel model)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Actualizează doar câmpurile permise
            user.Name = model.Name ?? user.Name;
            user.Email = model.Email ?? user.Email;
            user.Role = model.Role ?? user.Role;

            // Dacă se furnizează o parolă nouă, o hash-uim
            if (!string.IsNullOrEmpty(model.Password))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.Password);
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Users/5 - Șterge un utilizator (doar admin)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Users - Creează un utilizator nou (doar admin)
        [HttpPost]
        public async Task<IActionResult> PostUser([FromBody] RegisterModel model)
        {
            if (model == null) return BadRequest("Invalid request");

            var normalizedEmail = model.Email.ToLower();
            if (_context.Users.Any(u => u.Email == normalizedEmail))
                return BadRequest("User already exists");

            // Generează parolă random dacă nu e specificată
            string password = string.IsNullOrWhiteSpace(model.Password)
                ? GenerateRandomPassword(10)
                : model.Password;

            var user = new User
            {
                Name = model.Name,
                Email = normalizedEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Role = model.Role ?? "Client",
                MustChangePassword = string.IsNullOrWhiteSpace(model.Password) // true dacă e random
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Returnează parola generată doar pentru admin
            return Ok(new { user.Id, user.Name, user.Email, user.Role, password = string.IsNullOrWhiteSpace(model.Password) ? password : null });
        }

        // Utilitar pentru generare parolă random
        private static string GenerateRandomPassword(int length)
        {
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        // PUT: api/Users/{id}/password - Schimbă parola utilizatorului (self-service)
        [HttpPut("{id}/password")]
        [AllowAnonymous] // Poți restricționa la [Authorize] dacă vrei doar pentru user logat
        public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordModel model)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            // Verifică parola veche
            if (!BCrypt.Net.BCrypt.Verify(model.OldPassword, user.PasswordHash))
                return BadRequest("Parola veche este incorectă.");

            // Setează noua parolă și resetează flagul
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);
            user.MustChangePassword = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        public class ChangePasswordModel
        {
            public string OldPassword { get; set; } = string.Empty;
            public string NewPassword { get; set; } = string.Empty;
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.Id == id);
        }
    }

    // Model pentru actualizarea utilizatorului (fără PasswordHash)
    public class UpdateUserModel
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; } // Opțional, pentru schimbarea parolei
        public string? Role { get; set; }
    }
} 