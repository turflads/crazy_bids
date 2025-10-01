import ViewerDashboard from '../ViewerDashboard';

export default function ViewerDashboardExample() {
  const mockPlayers = [
    { id: '1', firstName: 'Virat', lastName: 'Kohli', grade: 'A', basePrice: 2000000, status: 'sold', soldPrice: 3500000, team: 'Mumbai Indians' },
    { id: '2', firstName: 'Rohit', lastName: 'Sharma', grade: 'A', basePrice: 2000000, status: 'sold', soldPrice: 3000000, team: 'Chennai Super Kings' },
    { id: '3', firstName: 'MS', lastName: 'Dhoni', grade: 'B', basePrice: 1500000, status: 'unsold' },
    { id: '4', firstName: 'Jasprit', lastName: 'Bumrah', grade: 'A', basePrice: 2000000, status: 'unsold' },
  ];

  const currentAuction = {
    player: mockPlayers[2],
    currentBid: 1800000,
    leadingTeam: 'Royal Challengers',
  };

  const recentSales = mockPlayers.filter(p => p.status === 'sold').slice(0, 3);

  const teamStandings = [
    { team: 'Mumbai Indians', playersCount: 1, purseUsed: 3500000, purseRemaining: 96500000 },
    { team: 'Chennai Super Kings', playersCount: 1, purseUsed: 3000000, purseRemaining: 97000000 },
    { team: 'Royal Challengers', playersCount: 0, purseUsed: 0, purseRemaining: 100000000 },
  ];

  return (
    <ViewerDashboard
      currentAuction={currentAuction}
      recentSales={recentSales}
      allPlayers={mockPlayers}
      teamStandings={teamStandings}
    />
  );
}
