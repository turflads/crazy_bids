import OwnerDashboard from '../OwnerDashboard';

export default function OwnerDashboardExample() {
  const mockPlayers = [
    { id: '1', firstName: 'Virat', lastName: 'Kohli', grade: 'A', basePrice: 2000000, status: 'sold', soldPrice: 3500000, team: 'Mumbai Indians' },
    { id: '2', firstName: 'Rohit', lastName: 'Sharma', grade: 'A', basePrice: 2000000, status: 'sold', soldPrice: 3000000, team: 'Chennai Super Kings' },
    { id: '3', firstName: 'MS', lastName: 'Dhoni', grade: 'B', basePrice: 1500000, status: 'unsold' },
    { id: '4', firstName: 'Jasprit', lastName: 'Bumrah', grade: 'A', basePrice: 2000000, status: 'unsold' },
  ];

  const soldPlayers = mockPlayers.filter(p => p.status === 'sold');
  const unsoldPlayers = mockPlayers.filter(p => p.status === 'unsold');

  const allTeamsData = [
    { team: 'Mumbai Indians', flag: '🔵', playersCount: 1, purseUsed: 3500000, purseRemaining: 96500000, totalPurse: 100000000, gradeCount: { A: 1, B: 0, C: 0 }, players: [] },
    { team: 'Chennai Super Kings', flag: '🟡', playersCount: 1, purseUsed: 3000000, purseRemaining: 97000000, totalPurse: 100000000, gradeCount: { A: 1, B: 0, C: 0 }, players: [] },
    { team: 'Royal Challengers', flag: '🔴', playersCount: 0, purseUsed: 0, purseRemaining: 100000000, totalPurse: 100000000, gradeCount: { A: 0, B: 0, C: 0 }, players: [] },
  ];

  const currentPlayer = mockPlayers[0];

  return (
    <OwnerDashboard
      allPlayers={mockPlayers}
      soldPlayers={soldPlayers}
      unsoldPlayers={unsoldPlayers}
      allTeamsData={allTeamsData}
      currentPlayer={currentPlayer}
      currentBid={2500000}
      isAuctionActive={true}
    />
  );
}
