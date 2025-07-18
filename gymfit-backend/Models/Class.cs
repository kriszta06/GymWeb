namespace gymfit_backend.Models
{
    // Model pentru o clasă de sport (ex: Pilates, Yoga)
    public class Class
    {
        public int Id { get; set; } // Id-ul unic al clasei
        public string Name { get; set; } = string.Empty; // Numele clasei
        public string Description { get; set; } = string.Empty; // Descrierea clasei
        public DateTime DateTime { get; set; } // Data și ora la care are loc clasa
        public int TrainerId { get; set; } // Id-ul trainerului care ține clasa
        public Trainer? Trainer { get; set; } // Referință către trainer
    }
} 