namespace CareNest.SharedKernel.Consultants;

public interface IConsultantScopedDbContext
{
    Guid? CurrentConsultantId { get; }
}
