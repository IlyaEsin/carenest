using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using CareNest.Identity.Accounts;
using CareNest.SharedKernel.Localization;
using CareNest.SharedKernel.Time;
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

internal sealed record TelegramCompleteRequest
{
    [Required]
    public required Dictionary<string, JsonElement> Auth { get; init; }

    [Required, AllowedValues(SignInModes.SignIn, SignInModes.Link)]
    public string Mode { get; init; } = SignInModes.SignIn;

    [Required, AllowedValues(Languages.Russian, Languages.English)]
    public string Language { get; init; } = Languages.Default;

    [Required, IanaTimeZone]
    public string TimeZone { get; init; } = TimeZones.Default;
}

internal sealed record ProvidersResponse(IReadOnlyList<string> Providers, string? TelegramBotName);
