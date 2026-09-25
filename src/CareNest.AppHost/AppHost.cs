var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres").WithDataVolume();
var database = postgres.AddDatabase("carenest");
var email = builder.AddMailPit("email");

var migrations = builder.AddProject<Projects.CareNest_MigrationService>("migrations")
    .WithReference(database)
    .WaitFor(database);

builder.AddProject<Projects.CareNest_Api>("api")
    .WithReference(database)
    .WithReference(email)
    .WaitFor(database)
    .WaitForCompletion(migrations);

builder.Build().Run();
