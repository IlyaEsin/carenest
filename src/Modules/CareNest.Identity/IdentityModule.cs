using CareNest.Identity.Persistence;
using CareNest.SharedKernel.Consultants;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;

namespace CareNest.Identity;

public static class IdentityModule
{
    public const string ConnectionStringName = "carenest";

    public static IHostApplicationBuilder AddIdentityPersistence(this IHostApplicationBuilder builder)
    {
        builder.Services.TryAddScoped<ICurrentConsultant, NoCurrentConsultant>();
        builder.Services.AddDbContext<IdentityModuleDbContext>((services, options) =>
            options.UseNpgsql(
                services.GetRequiredService<IConfiguration>().GetConnectionString(ConnectionStringName),
                IdentityModuleDbContext.ConfigureNpgsql));
        // Retries are off so explicit transactions work without an execution strategy wrapper.
        builder.EnrichNpgsqlDbContext<IdentityModuleDbContext>(settings => settings.DisableRetry = true);
        return builder;
    }

    public static async Task MigrateIdentityDatabaseAsync(this IServiceProvider services, CancellationToken cancellationToken)
    {
        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<IdentityModuleDbContext>();
        await db.Database.MigrateAsync(cancellationToken);
    }
}
