namespace gymfit_backend.Models
{
    // Model pentru trainer (antrenor)
    public class Trainer
    {
        public int Id { get; set; } // Id-ul unic al trainerului
        public string Name { get; set; } = string.Empty; // Numele trainerului
        public string Specialization { get; set; } = string.Empty; // Specializarea trainerului
    }
}