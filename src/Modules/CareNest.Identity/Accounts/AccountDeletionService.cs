using CareNest.Identity.Domain;
using CareNest.Identity.Persistence;
using CareNest.Identity.Security;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CareNest.Identity.Accounts;

// Foreign keys cascade logins, roles, invitations, client links and link tokens; email-keyed tokens have no FK and are removed here.
internal sealed class AccountDeletionService(UserManager<User> users, IdentityModuleDbContext db)
{
    public async Task DeleteAsync(User user, CancellationToken cancellationToken)
    {
        var emails = (await users.GetLoginsAsync(user))
            .Where(login => login.LoginProvider == EmailLogin.Provider)
            .Select(login => login.ProviderKey)
            .ToList();

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        await db.MagicLinkTokens.Where(token => emails.Contains(token.Email)).ExecuteDeleteAsync(cancellationToken);
        (await users.DeleteAsync(user)).ThrowIfFailed();
        await transaction.CommitAsync(cancellationToken);
    }
}
