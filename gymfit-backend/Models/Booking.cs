namespace gymfit_backend.Models
{
    // Model pentru o programare la o clasă de sport
    public class Booking
    {
        public int Id { get; set; } // Id-ul unic al programării
        public int UserId { get; set; } // Id-ul utilizatorului care face programarea
        public User? User { get; set; } // Referință către utilizator
        public int ClassId { get; set; } // Id-ul clasei la care se face programarea
        public Class? Class { get; set; } // Referință către clasa de sport
        public DateTime CreatedAt { get; set; } = DateTime.Now; // Data creării programării
    }
} 