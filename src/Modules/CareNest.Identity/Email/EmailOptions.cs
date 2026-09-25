namespace CareNest.Identity.Email;

internal sealed class EmailOptions
{
    public const string Section = "Email";
    public const string ConnectionStringName = "email";

    public string From { get; set; } = "CareNest <no-reply@carenest.local>";

    public string Host { get; set; } = "localhost";

    public int Port { get; set; } = 1025;

    public bool UseStartTls { get; set; }

    public string? UserName { get; set; }

    public string? Password { get; set; }

    // Aspire's Mailpit resource provides "smtp://host:port"; production configures the Email section instead.
    public void ApplyConnectionString(string? connectionString)
    {
        if (Uri.TryCreate(connectionString, UriKind.Absolute, out var uri))
        {
            Host = uri.Host;
            Port = uri.Port;
        }
    }
}
