// Model pentru utilizator (client sau administrator)
public class User
{
    public int Id { get; set; } // Id-ul unic al utilizatorului

    public string Name { get; set; } = string.Empty; // Numele utilizatorului

    public string Email { get; set; } = string.Empty; // Email-ul utilizatorului

    public string PasswordHash { get; set; } = string.Empty; // Hash-ul parolei

    public string Role { get; set; } = "Client"; // Rolul utilizatorului: Client sau Admin

    public bool MustChangePassword { get; set; } = false; // Trebuie să schimbe parola la prima autentificare
}
