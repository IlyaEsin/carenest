using CareNest.Api;
using CareNest.Identity;
using CareNest.SharedKernel.Web;
using NodaTime;
using NodaTime.Serialization.SystemTextJson;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi(options => options.AddSchemaTransformer(NodaTimeSchemaTransformer.TransformAsync));
builder.Services.ConfigureHttpJsonOptions(options => options.SerializerOptions.ConfigureForNodaTime(DateTimeZoneProviders.Tzdb));
builder.Services.AddSingleton<IClock>(SystemClock.Instance);
builder.Services.AddCors();
builder.AddIdentityModule();

var app = builder.Build();

var frontend = app.Configuration.GetSection(FrontendOptions.Section).Get<FrontendOptions>() ?? new FrontendOptions();

app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseCors(policy => policy.WithOrigins(frontend.Origins).AllowCredentials().AllowAnyHeader().AllowAnyMethod());
app.UseAuthentication();
app.UseAuthorization();

app.MapOpenApi();
app.MapDefaultEndpoints();
app.MapIdentityEndpoints();

app.Run();

public partial class Program;
