import { useState } from 'react';
import AdminDashboard from '../AdminDashboard';

export default function AdminDashboardExample() {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentBid, setCurrentBid] = useState(2000000);

  const mockPlayers = [
    { id: '1', firstName: 'Virat', lastName: 'Kohli', grade: 'A', basePrice: 2000000, status: 'unsold' },
    { id: '2', firstName: 'Rohit', lastName: 'Sharma', grade: 'A', basePrice: 2000000, status: 'unsold' },
    { id: '3', firstName: 'MS', lastName: 'Dhoni', grade: 'B', basePrice: 1500000, status: 'unsold' },
    { id: '4', firstName: 'Jasprit', lastName: 'Bumrah', grade: 'A', basePrice: 2000000, status: 'unsold' },
  ];

  const teams = [
    { name: 'Mumbai Indians', flag: '🔵' },
    { name: 'Chennai Super Kings', flag: '🟡' },
    { name: 'Royal Challengers', flag: '🔴' },
    { name: 'Delhi Capitals', flag: '🔷' },
  ];

  const gradeIncrements = {
    A: 500000,
    B: 300000,
    C: 200000,
  };

  return (
    <AdminDashboard
      players={mockPlayers}
      currentPlayerIndex={currentPlayerIndex}
      currentBid={currentBid}
      teams={teams}
      gradeIncrements={gradeIncrements}
      isAuctionActive={true}
      onNextPlayer={() => setCurrentPlayerIndex(Math.min(currentPlayerIndex + 1, mockPlayers.length - 1))}
      onPrevPlayer={() => setCurrentPlayerIndex(Math.max(currentPlayerIndex - 1, 0))}
      onStartAuction={() => console.log('Auction started')}
      onPauseAuction={() => console.log('Auction paused')}
      onBid={(team, amount) => {
        console.log(`${team} bid ₹${amount}`);
        setCurrentBid(amount);
      }}
      onSold={() => console.log('Player sold')}
      onUnsold={() => console.log('Player unsold')}
      onUploadPlayers={(file) => console.log('File uploaded:', file.name)}
    />
  );
}
