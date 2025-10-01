import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import NavBar from "@/components/NavBar";
import AdminDashboard from "@/components/AdminDashboard";

export default function Admin() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  
  //todo: remove mock functionality
  const [players] = useState([
    { id: '1', firstName: 'Virat', lastName: 'Kohli', grade: 'A', basePrice: 2000000, status: 'unsold' as const },
    { id: '2', firstName: 'Rohit', lastName: 'Sharma', grade: 'A', basePrice: 2000000, status: 'unsold' as const },
    { id: '3', firstName: 'MS', lastName: 'Dhoni', grade: 'B', basePrice: 1500000, status: 'unsold' as const },
    { id: '4', firstName: 'Jasprit', lastName: 'Bumrah', grade: 'A', basePrice: 2000000, status: 'unsold' as const },
    { id: '5', firstName: 'Ravindra', lastName: 'Jadeja', grade: 'B', basePrice: 1500000, status: 'unsold' as const },
    { id: '6', firstName: 'Hardik', lastName: 'Pandya', grade: 'B', basePrice: 1500000, status: 'unsold' as const },
  ]);
  
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentBid, setCurrentBid] = useState(2000000);
  const [isAuctionActive, setIsAuctionActive] = useState(false);
  
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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.role !== "admin") {
        setLocation("/");
        return;
      }
      setUser(userData);
    } else {
      setLocation("/");
    }
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setLocation("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <NavBar
        userRole={user.role as 'admin'}
        username={user.username}
        isAuctionLive={isAuctionActive}
        onLogout={handleLogout}
      />
      <AdminDashboard
        players={players}
        currentPlayerIndex={currentPlayerIndex}
        currentBid={currentBid}
        teams={teams}
        gradeIncrements={gradeIncrements}
        isAuctionActive={isAuctionActive}
        onNextPlayer={() => setCurrentPlayerIndex(Math.min(currentPlayerIndex + 1, players.length - 1))}
        onPrevPlayer={() => setCurrentPlayerIndex(Math.max(currentPlayerIndex - 1, 0))}
        onStartAuction={() => {
          setIsAuctionActive(true);
          console.log('Auction started');
        }}
        onPauseAuction={() => {
          setIsAuctionActive(false);
          console.log('Auction paused');
        }}
        onBid={(team, amount) => {
          setCurrentBid(amount);
          console.log(`${team} bid ₹${amount}`);
        }}
        onSold={() => {
          console.log('Player sold');
          setCurrentPlayerIndex(Math.min(currentPlayerIndex + 1, players.length - 1));
          setCurrentBid(players[currentPlayerIndex + 1]?.basePrice || 0);
        }}
        onUnsold={() => {
          console.log('Player unsold');
          setCurrentPlayerIndex(Math.min(currentPlayerIndex + 1, players.length - 1));
          setCurrentBid(players[currentPlayerIndex + 1]?.basePrice || 0);
        }}
        onUploadPlayers={(file) => console.log('File uploaded:', file.name)}
      />
    </div>
  );
}
