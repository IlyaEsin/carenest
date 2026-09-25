using System.Security.Claims;
using CareNest.Identity.Accounts;
using CareNest.Identity.Domain;
using CareNest.Identity.Security;
using CareNest.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Routing;

namespace CareNest.Identity.Endpoints;

internal static class ProfileEndpoints
{
    public static RouteGroupBuilder MapProfile(this RouteGroupBuilder group)
    {
        var me = group.MapGroup("/me").RequireAuthorization();
        me.MapGet("", GetAsync);
        me.MapPut("", UpdateAsync).WithRequestValidation<UpdateProfileRequest>();
        me.MapDelete("", DeleteAsync);
        group.MapPost("/signout", SignOutAsync);
        return me;
    }

    public static async Task<MeResponse> ToResponseAsync(User user, UserManager<User> users)
    {
        var roles = await users.GetRolesAsync(user);
        var logins = await users.GetLoginsAsync(user);
        return new MeResponse(
            user.Id,
            user.DisplayName,
            user.Language,
            user.TimeZone,
            roles.Order(StringComparer.Ordinal).ToList(),
            logins.Select(login => login.LoginProvider).Distinct().Order(StringComparer.Ordinal).ToList());
    }

    private static async Task<Results<Ok<MeResponse>, UnauthorizedHttpResult>> GetAsync(ClaimsPrincipal principal, UserManager<User> users)
    {
        // A valid cookie can outlive its user (deleted account on another device).
        var user = await users.GetUserAsync(principal);
        return user is null ? TypedResults.Unauthorized() : TypedResults.Ok(await ToResponseAsync(user, users));
    }

    private static async Task<Results<Ok<MeResponse>, UnauthorizedHttpResult>> UpdateAsync(
        UpdateProfileRequest request,
        ClaimsPrincipal principal,
        UserManager<User> users)
    {
        var user = await users.GetUserAsync(principal);
        if (user is null)
        {
            return TypedResults.Unauthorized();
        }

        user.DisplayName = request.DisplayName.Trim();
        user.Language = request.Language;
        user.TimeZone = request.TimeZone;
        (await users.UpdateAsync(user)).ThrowIfFailed();
        return TypedResults.Ok(await ToResponseAsync(user, users));
    }

    private static async Task<Results<NoContent, UnauthorizedHttpResult>> DeleteAsync(
        ClaimsPrincipal principal,
        UserManager<User> users,
        AccountDeletionService deletion,
        SignInManager<User> signIn,
        CancellationToken cancellationToken)
    {
        var user = await users.GetUserAsync(principal);
        if (user is null)
        {
            return TypedResults.Unauthorized();
        }

        await deletion.DeleteAsync(user, cancellationToken);
        await signIn.SignOutAsync();
        return TypedResults.NoContent();
    }

    private static async Task<NoContent> SignOutAsync(SignInManager<User> signIn)
    {
        await signIn.SignOutAsync();
        return TypedResults.NoContent();
    }
}
