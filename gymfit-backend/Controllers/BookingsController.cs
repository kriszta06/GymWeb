using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.EntityFrameworkCore;
using gymfit_backend.Data;
using gymfit_backend.Models;
using System.Security.Claims;

namespace gymfit_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Toate operațiile necesită autentificare
    public class BookingsController : ControllerBase
    {
        private readonly GymFitContext _context;

        public BookingsController(GymFitContext context)
        {
            _context = context;
        }

        // GET: api/Bookings - Listare programări (admin vede toate, client vede doar ale sale)
        [HttpGet]
        [EnableQuery] // Permite interogări OData
        public async Task<ActionResult<IEnumerable<Booking>>> GetBookings()
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            if (userRole == "Admin")
            {
                // Admin vede toate programările
                return await _context.Bookings
                    .Include(b => b.User)
                    .Include(b => b.Class)
                    .ThenInclude(c => c.Trainer)
                    .ToListAsync();
            }
            else
            {
                // Client vede doar programările sale
                return await _context.Bookings
                    .Include(b => b.Class)
                    .ThenInclude(c => c.Trainer)
                    .Where(b => b.UserId == userId)
                    .ToListAsync();
            }
        }

        // GET: api/Bookings/5 - Obține o programare specifică
        [HttpGet("{id}")]
        public async Task<ActionResult<Booking>> GetBooking(int id)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var booking = await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Class)
                .ThenInclude(c => c.Trainer)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
            {
                return NotFound();
            }

            // Verifică dacă utilizatorul are dreptul să vadă această programare
            if (userRole != "Admin" && booking.UserId != userId)
            {
                return Forbid();
            }

            return booking;
        }

        // POST: api/Bookings - Creează o programare nouă (doar clienți)
        [HttpPost]
        public async Task<ActionResult<Booking>> PostBooking(Booking booking)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            // Doar clienții pot face programări
            if (userRole == "Admin")
            {
                return BadRequest("Administratorii nu pot face programări.");
            }

            // Setează UserId-ul din token
            booking.UserId = userId;

            // Verifică dacă clasa există
            var classItem = await _context.Classes.FindAsync(booking.ClassId);
            if (classItem == null)
            {
                return BadRequest("Clasa specificată nu există.");
            }

            // Verifică dacă utilizatorul nu are deja o programare la această clasă
            var existingBooking = await _context.Bookings
                .FirstOrDefaultAsync(b => b.UserId == userId && b.ClassId == booking.ClassId);

            if (existingBooking != null)
            {
                return BadRequest("Ai deja o programare la această clasă.");
            }

            // Setează explicit CreatedAt ca UTC
            booking.CreatedAt = DateTime.SpecifyKind(booking.CreatedAt, DateTimeKind.Utc);

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBooking), new { id = booking.Id }, booking);
        }

        // DELETE: api/Bookings/5 - Șterge o programare
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBooking(int id)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
            {
                return NotFound();
            }

            // Verifică dacă utilizatorul are dreptul să șteargă această programare
            if (userRole != "Admin" && booking.UserId != userId)
            {
                return Forbid();
            }

            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
} 