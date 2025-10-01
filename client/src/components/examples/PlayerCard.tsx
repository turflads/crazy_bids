import PlayerCard from '../PlayerCard';

export default function PlayerCardExample() {
  const mockPlayer = {
    id: '1',
    firstName: 'Virat',
    lastName: 'Kohli',
    grade: 'A',
    basePrice: 2000000,
    cricherosLink: 'https://cricheroes.com',
    status: 'unsold' as const,
  };

  return (
    <div className="p-8 max-w-sm">
      <PlayerCard 
        player={mockPlayer}
        onViewDetails={() => console.log('View details clicked')}
      />
    </div>
  );
}
