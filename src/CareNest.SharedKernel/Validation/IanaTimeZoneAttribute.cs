using System.ComponentModel.DataAnnotations;
using CareNest.SharedKernel.Time;

namespace CareNest.SharedKernel.Validation;

[AttributeUsage(AttributeTargets.Property)]
public sealed class IanaTimeZoneAttribute : ValidationAttribute
{
    public override bool IsValid(object? value) => value is null || (value is string id && TimeZones.IsValid(id));
}
