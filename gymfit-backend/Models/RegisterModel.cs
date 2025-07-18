namespace gymfit_backend.Models
{
    public class RegisterModel
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? Role { get; set; } // poate fi null, default e "Client"
    }
}
