namespace CareNest.Identity.Accounts;

// Email is stored as an external login (provider "email") so it never becomes a merge key for other providers.
internal static class EmailLogin
{
    public const string Provider = "email";

    public static string Normalize(string email) => email.Trim().ToLowerInvariant();

    public static string DisplayNameFrom(string normalizedEmail)
    {
        var at = normalizedEmail.IndexOf('@');
        return at > 0 ? normalizedEmail[..at] : normalizedEmail;
    }
}
