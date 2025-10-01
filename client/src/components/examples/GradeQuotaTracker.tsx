import GradeQuotaTracker from '../GradeQuotaTracker';

export default function GradeQuotaTrackerExample() {
  const mockQuotas = [
    { grade: 'A', required: 4, current: 2, color: 'bg-grade-a' },
    { grade: 'B', required: 3, current: 3, color: 'bg-grade-b' },
    { grade: 'C', required: 4, current: 1, color: 'bg-grade-c' },
  ];

  return (
    <div className="p-8">
      <GradeQuotaTracker quotas={mockQuotas} />
    </div>
  );
}
