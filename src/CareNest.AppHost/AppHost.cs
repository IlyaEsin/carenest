var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres").WithDataVolume();
var database = postgres.AddDatabase("carenest");
var email = builder.AddMailPit("email");

builder.AddProject<Projects.CareNest_Api>("api")
    .WithReference(database)
    .WithReference(email)
    .WaitFor(database);

builder.Build().Run();
