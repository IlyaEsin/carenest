using AspNet.Security.OAuth.VkId;
using CareNest.Identity.Security;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CareNest.Identity.External;

internal static class ExternalProviders
{
    public const string Google = "Google";
    public const string Yandex = "Yandex";
    public const string VkId = "VkId";
    public const string Telegram = "Telegram";

    public const string ReturnUrlItem = "cn.returnUrl";
    public const string ModeItem = "cn.mode";
    public const string LanguageItem = "cn.language";
    public const string TimeZoneItem = "cn.timeZone";

    public static IReadOnlyList<string> OAuth { get; } = [Google, Yandex, VkId];

    private sealed record Credentials(string ClientId, string ClientSecret);

    // Only configured providers are registered: an OAuth scheme without a ClientId breaks OpenAPI generation (verified 2026-09-24).
    public static void Register(AuthenticationBuilder authentication, IConfiguration configuration)
    {
        if (Read(configuration, Google) is { } google)
        {
            authentication.AddGoogle(Google, options => Configure(options, google));
        }

        if (Read(configuration, Yandex) is { } yandex)
        {
            authentication.AddYandex(Yandex, options => Configure(options, yandex));
        }

        if (Read(configuration, VkId) is { } vk)
        {
            authentication.AddVkId(VkId, options => Configure(options, vk));
        }
    }

    private static Credentials? Read(IConfiguration configuration, string provider)
    {
        var section = configuration.GetSection($"{IdentityModuleOptions.Section}:Providers:{provider}");
        var clientId = section["ClientId"];
        var clientSecret = section["ClientSecret"];
        return string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret) ? null : new Credentials(clientId, clientSecret);
    }

    private static void Configure(OAuthOptions options, Credentials credentials)
    {
        options.ClientId = credentials.ClientId;
        options.ClientSecret = credentials.ClientSecret;
        options.SignInScheme = IdentityConstants.ExternalScheme;
        // VK ID requires PKCE; the others accept it.
        options.UsePkce = true;
        options.Events.OnRemoteFailure = context =>
        {
            var returnUrl = context.Properties?.GetString(ReturnUrlItem);
            context.Response.Redirect(returnUrl is null ? "/" : ErrorRedirect.For(returnUrl, IdentityErrors.ExternalLoginFailed));
            context.HandleResponse();
            return Task.CompletedTask;
        };
    }
}
