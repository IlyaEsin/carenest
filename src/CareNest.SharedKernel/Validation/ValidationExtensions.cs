using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace CareNest.SharedKernel.Validation;

public static class ValidationExtensions
{
    public static RouteHandlerBuilder WithRequestValidation<TRequest>(this RouteHandlerBuilder builder) where TRequest : class =>
        builder.AddEndpointFilter<ValidationFilter<TRequest>>().ProducesValidationProblem();
}
