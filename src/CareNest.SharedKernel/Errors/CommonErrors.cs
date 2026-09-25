namespace CareNest.SharedKernel.Errors;

public static class CommonErrors
{
    public const string ValidationFailed = "validation_failed";

    public static IReadOnlyList<string> Codes { get; } = [ValidationFailed];
}
