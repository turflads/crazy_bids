import OwnerDashboard from '../OwnerDashboard';

export default function OwnerDashboardExample() {
  const mockPlayers = [
    { id: '1', firstName: 'Virat', lastName: 'Kohli', grade: 'A', basePrice: 2000000, status: 'sold', soldPrice: 3500000, team: 'Mumbai Indians' },
    { id: '2', firstName: 'Rohit', lastName: 'Sharma', grade: 'A', basePrice: 2000000, status: 'sold', soldPrice: 3000000, team: 'Chennai Super Kings' },
    { id: '3', firstName: 'MS', lastName: 'Dhoni', grade: 'B', basePrice: 1500000, status: 'unsold' },
    { id: '4', firstName: 'Jasprit', lastName: 'Bumrah', grade: 'A', basePrice: 2000000, status: 'unsold' },
  ];

  const gradeQuotas = [
    { grade: 'A', required: 4, current: 1, color: 'bg-grade-a' },
    { grade: 'B', required: 3, current: 0, color: 'bg-grade-b' },
    { grade: 'C', required: 4, current: 0, color: 'bg-grade-c' },
  ];

  const myTeamPlayers = mockPlayers.filter(p => p.team === 'Mumbai Indians');
  const soldPlayers = mockPlayers.filter(p => p.status === 'sold');
  const unsoldPlayers = mockPlayers.filter(p => p.status === 'unsold');

  return (
    <OwnerDashboard
      teamName="Mumbai Indians"
      totalPurse={100000000}
      usedPurse={3500000}
      gradeQuotas={gradeQuotas}
      allPlayers={mockPlayers}
      myTeamPlayers={myTeamPlayers}
      soldPlayers={soldPlayers}
      unsoldPlayers={unsoldPlayers}
    />
  );
}
