using CareNest.SharedKernel.Consultants;
using NodaTime;

namespace CareNest.Identity.Domain;

internal sealed class ClientLink : IConsultantOwned
{
    public Guid ConsultantId { get; set; }

    public Guid ParentUserId { get; set; }

    public Instant LinkedAt { get; set; }
}
