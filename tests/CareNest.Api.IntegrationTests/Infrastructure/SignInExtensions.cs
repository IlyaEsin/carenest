using System.Net;
using System.Net.Http.Json;
using CareNest.Identity.Accounts;
using CareNest.Identity.Endpoints;

namespace CareNest.Api.IntegrationTests.Infrastructure;

internal static class SignInExtensions
{
    public const string EmailCallbackUrl = ApiFactory.ClientAppUrl + "/auth/email";

    public static string NewEmail(string prefix = "parent") => $"{prefix}-{Guid.NewGuid():N}@example.test";

    public static async Task SignInWithEmailAsync(this HttpClient client, ApiFactory factory, string email, string language = "en", string timeZone = "Europe/Moscow")
    {
        var start = await client.PostAsJsonAsync("/api/identity/email/start", new { email, callbackUrl = EmailCallbackUrl, language, timeZone });
        start.StatusCode.ShouldBe(HttpStatusCode.Accepted);

        var complete = await client.PostAsJsonAsync("/api/identity/email/complete", new { token = factory.Emails.LatestTokenFor(EmailLogin.Normalize(email)) });
        complete.StatusCode.ShouldBe(HttpStatusCode.NoContent);
    }

    public static async Task<HttpClient> SignedInClientAsync(this ApiFactory factory, string email)
    {
        var client = factory.CreateHttpsClient();
        await client.SignInWithEmailAsync(factory, email);
        return client;
    }

    public static async Task<MeResponse> GetMeAsync(this HttpClient client)
    {
        var response = await client.GetAsync("/api/identity/me");
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        return await response.ReadAsAsync<MeResponse>();
    }
}
