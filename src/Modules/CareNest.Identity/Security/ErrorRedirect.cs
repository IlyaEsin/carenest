using CareNest.SharedKernel.Errors;
using Microsoft.AspNetCore.WebUtilities;

namespace CareNest.Identity.Security;

internal static class ErrorRedirect
{
    public static string For(string returnUrl, ApiError error) => QueryHelpers.AddQueryString(returnUrl, "error", error.Code);
}
