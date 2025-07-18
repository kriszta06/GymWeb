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
    public class TrainersController : ControllerBase
    {
        private readonly GymFitContext _context;

        public TrainersController(GymFitContext context)
        {
            _context = context;
        }

        // GET: api/Trainers - Listare traineri (toți utilizatorii)
        [HttpGet]
        [EnableQuery] // Permite interogări OData
        public async Task<ActionResult<IEnumerable<Trainer>>> GetTrainers()
        {
            return await _context.Trainers.ToListAsync();
        }

        // GET: api/Trainers/5 - Obține un trainer specific
        [HttpGet("{id}")]
        public async Task<ActionResult<Trainer>> GetTrainer(int id)
        {
            var trainer = await _context.Trainers.FindAsync(id);

            if (trainer == null)
            {
                return NotFound();
            }

            return trainer;
        }

        // POST: api/Trainers - Adaugă un trainer nou (doar admin)
        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<Trainer>> PostTrainer(Trainer trainer)
        {
            _context.Trainers.Add(trainer);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTrainer), new { id = trainer.Id }, trainer);
        }

        // PUT: api/Trainers/5 - Actualizează un trainer (doar admin)
        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> PutTrainer(int id, Trainer trainer)
        {
            if (id != trainer.Id)
            {
                return BadRequest();
            }

            _context.Entry(trainer).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TrainerExists(id))
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

        // DELETE: api/Trainers/5 - Șterge un trainer (doar admin)
        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> DeleteTrainer(int id)
        {
            var trainer = await _context.Trainers.FindAsync(id);
            if (trainer == null)
            {
                return NotFound();
            }

            _context.Trainers.Remove(trainer);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TrainerExists(int id)
        {
            return _context.Trainers.Any(e => e.Id == id);
        }
    }
} 