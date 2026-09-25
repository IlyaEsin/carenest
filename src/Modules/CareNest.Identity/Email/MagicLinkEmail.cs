using CareNest.SharedKernel.Localization;

namespace CareNest.Identity.Email;

// Server-sent emails are localised on the server in the recipient's language (spec section 6).
internal static class MagicLinkEmail
{
    public static EmailMessage Compose(string to, string language, string link) => language == Languages.Russian
        ? new EmailMessage(
            to,
            "Вход в CareNest",
            $"Чтобы войти в CareNest, откройте ссылку (она действует 15 минут):\n\n{link}\n\nЕсли вы не запрашивали вход, просто проигнорируйте это письмо.")
        : new EmailMessage(
            to,
            "Sign in to CareNest",
            $"To sign in to CareNest, open this link (valid for 15 minutes):\n\n{link}\n\nIf you did not request this, ignore this email.");
}
