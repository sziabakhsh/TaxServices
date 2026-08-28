namespace TaxServices.Domain.Cases
{
    public enum CaseStatus
    {
        Draft = 1,
        Open = 2,
        InProgress = 3,
        WaitingForClient = 4,
        Completed = 5,
        Cancelled = 6
    }
}