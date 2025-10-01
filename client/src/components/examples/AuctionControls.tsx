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

  const teams = ['Mumbai Indians', 'Chennai Super Kings', 'Royal Challengers'];

  return (
    <div className="p-8 max-w-lg">
      <AuctionControls
        currentPlayer={mockPlayer}
        currentBid={currentBid}
        increment={500000}
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
