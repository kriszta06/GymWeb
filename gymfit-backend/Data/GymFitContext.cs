using Microsoft.EntityFrameworkCore;
using gymfit_backend.Models;

namespace gymfit_backend.Data
{
    public class GymFitContext : DbContext
    {
        public GymFitContext(DbContextOptions<GymFitContext> options) : base(options) {}

        public DbSet<User> Users { get; set; }
        public DbSet<Trainer> Trainers { get; set; }
        public DbSet<Class> Classes { get; set; }
        public DbSet<Booking> Bookings { get; set; }
    }
}