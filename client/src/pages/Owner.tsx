import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import NavBar from "@/components/NavBar";
import OwnerDashboard from "@/components/OwnerDashboard";
import { useAuctionSync } from "@/hooks/useAuctionSync";

export default function Owner() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  
  // Use synced auction and team state
  const { auctionState, teamState } = useAuctionSync();
  
  const allPlayers = auctionState?.players || [];
  const soldPlayers = allPlayers.filter((p: any) => p.status === 'sold');
  const unsoldPlayers = allPlayers.filter((p: any) => p.status === 'unsold');
  
  // Convert team state to array for display
  const allTeamsData = Object.values(teamState).map((team: any) => ({
    team: team.name,
    flag: team.flag,
    playersCount: team.players.length,
    purseUsed: team.usedPurse,
    purseRemaining: team.totalPurse - team.usedPurse,
    totalPurse: team.totalPurse,
    gradeCount: team.gradeCount,
    players: team.players,
  }));

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.role !== "owner") {
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
        userRole={user.role as 'owner'}
        username={user.username}
        onLogout={handleLogout}
      />
      <OwnerDashboard
        allPlayers={allPlayers}
        soldPlayers={soldPlayers}
        unsoldPlayers={unsoldPlayers}
        allTeamsData={allTeamsData}
      />
    </div>
  );
}
