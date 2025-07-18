using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.EntityFrameworkCore;
using gymfit_backend.Data;
using gymfit_backend.Models;

namespace gymfit_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClassesController : ControllerBase
    {
        private readonly GymFitContext _context;

        public ClassesController(GymFitContext context)
        {
            _context = context;
        }

        // GET: api/Classes - Listare clase (toți utilizatorii)
        [HttpGet]
        [EnableQuery] // Permite interogări OData
        public async Task<ActionResult<IEnumerable<Class>>> GetClasses()
        {
            return await _context.Classes
                .Include(c => c.Trainer) // Include trainerul pentru fiecare clasă
                .ToListAsync();
        }

        // GET: api/Classes/5 - Obține o clasă specifică
        [HttpGet("{id}")]
        public async Task<ActionResult<Class>> GetClass(int id)
        {
            var classItem = await _context.Classes
                .Include(c => c.Trainer)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (classItem == null)
            {
                return NotFound();
            }

            return classItem;
        }

        // POST: api/Classes - Adaugă o clasă nouă (doar admin)
        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<Class>> PostClass(Class classItem)
        {
            // Verifică dacă trainerul există
            var trainer = await _context.Trainers.FindAsync(classItem.TrainerId);
            if (trainer == null)
            {
                return BadRequest("Trainerul specificat nu există.");
            }

            // Setează explicit DateTime ca UTC pentru compatibilitate cu PostgreSQL
            classItem.DateTime = DateTime.SpecifyKind(classItem.DateTime, DateTimeKind.Utc);

            _context.Classes.Add(classItem);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetClass), new { id = classItem.Id }, classItem);
        }

        // PUT: api/Classes/5 - Actualizează o clasă (doar admin)
        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> PutClass(int id, Class classItem)
        {
            if (id != classItem.Id)
            {
                return BadRequest();
            }

            // Verifică dacă trainerul există
            var trainer = await _context.Trainers.FindAsync(classItem.TrainerId);
            if (trainer == null)
            {
                return BadRequest("Trainerul specificat nu există.");
            }

            _context.Entry(classItem).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ClassExists(id))
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

        // DELETE: api/Classes/5 - Șterge o clasă (doar admin)
        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> DeleteClass(int id)
        {
            var classItem = await _context.Classes.FindAsync(id);
            if (classItem == null)
            {
                return NotFound();
            }

            _context.Classes.Remove(classItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ClassExists(int id)
        {
            return _context.Classes.Any(e => e.Id == id);
        }
    }
} 