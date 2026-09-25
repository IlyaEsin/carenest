using CareNest.Identity.Accounts;
using CareNest.Identity.Domain;
using CareNest.Identity.Email;
using CareNest.Identity.Persistence;
using CareNest.Identity.Security;
using CareNest.SharedKernel.Errors;
using CareNest.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace CareNest.Identity.Endpoints;

internal static class EmailSignInEndpoints
{
    public static readonly Duration LinkLifetime = Duration.FromMinutes(15);
    public static readonly Duration ThrottleWindow = Duration.FromMinutes(10);
    public const int MaxLinksPerWindow = 3;

    public static void MapEmailSignIn(this RouteGroupBuilder group)
    {
        group.MapPost("/email/start", StartAsync).WithRequestValidation<EmailStartRequest>();
        group.MapPost("/email/complete", CompleteAsync).WithRequestValidation<EmailCompleteRequest>();
    }

    private static async Task<Results<Accepted, ProblemHttpResult>> StartAsync(
        EmailStartRequest request,
        HttpContext http,
        ReturnUrlPolicy returnUrls,
        IdentityModuleDbContext db,
        UserManager<User> users,
        IEmailSender sender,
        IClock clock,
        CancellationToken cancellationToken)
    {
        if (!returnUrls.IsAllowed(request.CallbackUrl))
        {
            return IdentityErrors.InvalidReturnUrl.ToProblem();
        }

        SignInModes.TryParse(request.Mode, out var mode);
        var linkUserId = mode == SignInMode.Link ? http.User.GetUserId() : null;
        if (mode == SignInMode.Link && linkUserId is null)
        {
            return IdentityErrors.NotSignedIn.ToProblem();
        }

        var email = EmailLogin.Normalize(request.Email);
        var now = clock.GetCurrentInstant();
        var windowStart = now - ThrottleWindow;
        // The response is identical when throttled so the endpoint does not reveal anything about the address.
        if (await db.MagicLinkTokens.CountAsync(t => t.Email == email && t.CreatedAt > windowStart, cancellationToken) >= MaxLinksPerWindow)
        {
            return TypedResults.Accepted((string?)null);
        }

        var token = SecureTokens.Create();
        db.MagicLinkTokens.Add(new MagicLinkToken
        {
            Id = Guid.CreateVersion7(),
            TokenHash = token.Hash,
            Email = email,
            Language = request.Language,
            TimeZone = request.TimeZone,
            LinkUserId = linkUserId,
            CreatedAt = now,
            ExpiresAt = now + LinkLifetime,
        });
        await db.SaveChangesAsync(cancellationToken);

        var existing = await users.FindByLoginAsync(EmailLogin.Provider, email);
        var link = QueryHelpers.AddQueryString(request.CallbackUrl, "token", token.Value);
        await sender.SendAsync(MagicLinkEmail.Compose(email, existing?.Language ?? request.Language, link), cancellationToken);
        return TypedResults.Accepted((string?)null);
    }

    private static async Task<Results<NoContent, ProblemHttpResult>> CompleteAsync(
        EmailCompleteRequest request,
        HttpContext http,
        IdentityModuleDbContext db,
        AccountService accounts,
        SignInManager<User> signIn,
        IClock clock,
        CancellationToken cancellationToken)
    {
        var hash = SecureTokens.Hash(request.Token);
        var token = await db.MagicLinkTokens.AsNoTracking().SingleOrDefaultAsync(t => t.TokenHash == hash, cancellationToken);
        var now = clock.GetCurrentInstant();
        if (token is null)
        {
            return IdentityErrors.MagicLinkInvalid.ToProblem();
        }

        if (token.UsedAt is not null)
        {
            return IdentityErrors.MagicLinkUsed.ToProblem();
        }

        if (token.ExpiresAt <= now)
        {
            return IdentityErrors.MagicLinkExpired.ToProblem();
        }

        if (token.LinkUserId is not null && token.LinkUserId != http.User.GetUserId())
        {
            return IdentityErrors.LinkSessionMismatch.ToProblem();
        }

        // The conditional update makes the token single-use even when two requests race.
        var claimed = await db.MagicLinkTokens
            .Where(t => t.Id == token.Id && t.UsedAt == null)
            .ExecuteUpdateAsync(setters => setters.SetProperty(t => t.UsedAt, (Instant?)now), cancellationToken);
        if (claimed == 0)
        {
            return IdentityErrors.MagicLinkUsed.ToProblem();
        }

        var outcome = await accounts.ResolveAsync(
            new ExternalIdentity(EmailLogin.Provider, token.Email, EmailLogin.DisplayNameFrom(token.Email)),
            token.LinkUserId is null ? SignInMode.SignIn : SignInMode.Link,
            token.LinkUserId,
            new NewUserDefaults(token.Language, token.TimeZone),
            cancellationToken);
        if (outcome.Error is not null)
        {
            return outcome.Error.ToProblem();
        }

        await accounts.EnsureAdminRoleAsync(outcome.User!, token.Email);
        await signIn.SignInAsync(outcome.User!, isPersistent: true);
        return TypedResults.NoContent();
    }
}
