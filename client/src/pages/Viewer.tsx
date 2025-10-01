import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import NavBar from "@/components/NavBar";
import ViewerDashboard from "@/components/ViewerDashboard";

export default function Viewer() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  
  //todo: remove mock functionality
  const allPlayers = [
    { id: '1', firstName: 'Virat', lastName: 'Kohli', grade: 'A', basePrice: 2000000, status: 'sold' as const, soldPrice: 3500000, team: 'Mumbai Indians' },
    { id: '2', firstName: 'Rohit', lastName: 'Sharma', grade: 'A', basePrice: 2000000, status: 'sold' as const, soldPrice: 3000000, team: 'Chennai Super Kings' },
    { id: '3', firstName: 'MS', lastName: 'Dhoni', grade: 'B', basePrice: 1500000, status: 'unsold' as const },
    { id: '4', firstName: 'Jasprit', lastName: 'Bumrah', grade: 'A', basePrice: 2000000, status: 'unsold' as const },
    { id: '5', firstName: 'Ravindra', lastName: 'Jadeja', grade: 'B', basePrice: 1500000, status: 'unsold' as const },
    { id: '6', firstName: 'Hardik', lastName: 'Pandya', grade: 'B', basePrice: 1500000, status: 'sold' as const, soldPrice: 2000000, team: 'Mumbai Indians' },
  ];

  const currentAuction = {
    player: allPlayers[2],
    currentBid: 1800000,
    leadingTeam: 'Royal Challengers',
  };

  const recentSales = allPlayers.filter(p => p.status === 'sold').slice(0, 3);

  const teamStandings = [
    { team: 'Mumbai Indians', playersCount: 2, purseUsed: 5500000, purseRemaining: 94500000 },
    { team: 'Chennai Super Kings', playersCount: 1, purseUsed: 3000000, purseRemaining: 97000000 },
    { team: 'Royal Challengers', playersCount: 0, purseUsed: 0, purseRemaining: 100000000 },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.role !== "viewer") {
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
        userRole={user.role as 'viewer'}
        username={user.username}
        onLogout={handleLogout}
      />
      <ViewerDashboard
        currentAuction={currentAuction}
        recentSales={recentSales}
        allPlayers={allPlayers}
        teamStandings={teamStandings}
      />
    </div>
  );
}
