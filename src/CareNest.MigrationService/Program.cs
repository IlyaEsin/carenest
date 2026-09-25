using CareNest.Identity;
using CareNest.MigrationService;

var builder = Host.CreateApplicationBuilder(args);

builder.AddServiceDefaults();
builder.AddIdentityPersistence();
builder.Services.AddHostedService<MigrationWorker>();

builder.Build().Run();
