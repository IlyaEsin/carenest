using CareNest.SharedKernel.Consultants;

namespace CareNest.Identity.Persistence;

internal sealed class NoCurrentConsultant : ICurrentConsultant
{
    public Guid? ConsultantId => null;
}
