namespace CareNest.SharedKernel.Web;

public sealed class FrontendOptions
{
    public const string Section = "Frontend";

    // Browser origins of the web apps; used for CORS and for validating return and callback URLs.
    public string[] Origins { get; set; } = [];

    public string ClientAppUrl { get; set; } = "";
}
