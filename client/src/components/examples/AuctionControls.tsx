import { useState } from 'react';
import AuctionControls from '../AuctionControls';

export default function AuctionControlsExample() {
  const [currentBid, setCurrentBid] = useState(2000000);
  
  const mockPlayer = {
    firstName: 'Virat',
    lastName: 'Kohli',
    grade: 'A',
    basePrice: 2000000,
  };

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
    <div className="p-8 max-w-lg">
      <AuctionControls
        currentPlayer={mockPlayer}
        currentBid={currentBid}
        gradeIncrements={gradeIncrements}
        teams={teams}
        onBid={(team, amount) => {
          console.log(`${team} bid ₹${amount}`);
          setCurrentBid(amount);
        }}
        onSold={() => console.log('Player sold')}
        onUnsold={() => console.log('Player unsold')}
      />
    </div>
  );
}
