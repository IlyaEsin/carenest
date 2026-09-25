using System.ComponentModel.DataAnnotations;
using CareNest.Identity.Accounts;
using CareNest.SharedKernel.Localization;
using CareNest.SharedKernel.Validation;

namespace CareNest.Identity.Endpoints;

internal sealed record EmailStartRequest
{
    [Required, EmailAddress, StringLength(256)]
    public required string Email { get; init; }

    [Required, StringLength(2048)]
    public required string CallbackUrl { get; init; }

    [Required, AllowedValues(Languages.Russian, Languages.English)]
    public required string Language { get; init; }

    [Required, IanaTimeZone]
    public required string TimeZone { get; init; }

    [Required, AllowedValues(SignInModes.SignIn, SignInModes.Link)]
    public string Mode { get; init; } = SignInModes.SignIn;
}

internal sealed record EmailCompleteRequest
{
    [Required, StringLength(128)]
    public required string Token { get; init; }
}

internal sealed record MeResponse(
    Guid Id,
    string DisplayName,
    string Language,
    string TimeZone,
    IReadOnlyList<string> Roles,
    IReadOnlyList<string> SignInMethods);
