using CareNest.Identity.External;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;

namespace CareNest.Identity.Tests;

public class ExternalProvidersTests
{
    [Fact]
    public void Fake_provider_refuses_to_register_in_production() =>
        Should.Throw<InvalidOperationException>(() => Register(fakeEnabled: true, Environments.Production));

    [Fact]
    public async Task Fake_provider_registers_outside_production_only_when_enabled()
    {
        (await SchemeAsync(Register(fakeEnabled: true, Environments.Development))).ShouldNotBeNull();
        (await SchemeAsync(Register(fakeEnabled: false, Environments.Development))).ShouldBeNull();
    }

    private static IServiceCollection Register(bool fakeEnabled, string environmentName)
    {
        var services = new ServiceCollection();
        services.AddDataProtection();
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["Identity:Providers:Fake:Enabled"] = fakeEnabled.ToString() })
            .Build();
        ExternalProviders.Register(services.AddAuthentication(), configuration, new TestEnvironment(environmentName));
        return services;
    }

    private static Task<AuthenticationScheme?> SchemeAsync(IServiceCollection services) =>
        services.BuildServiceProvider().GetRequiredService<IAuthenticationSchemeProvider>().GetSchemeAsync(ExternalProviders.Fake);

    private sealed class TestEnvironment(string environmentName) : IHostEnvironment
    {
        public string EnvironmentName { get; set; } = environmentName;

        public string ApplicationName { get; set; } = "CareNest.Identity.Tests";

        public string ContentRootPath { get; set; } = AppContext.BaseDirectory;

        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }
}
