import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import NavBar from "@/components/NavBar";
import ViewerDashboard from "@/components/ViewerDashboard";
import { useAuctionSync } from "@/hooks/useAuctionSync";

export default function Viewer() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  
  // Use synced auction and team state
  const { auctionState, teamState } = useAuctionSync();
  
  const allPlayers = auctionState?.players || [];
  const currentPlayerIndex = auctionState?.currentPlayerIndex || 0;
  const currentPlayer = allPlayers[currentPlayerIndex];

  const currentAuction = currentPlayer && auctionState?.isAuctionActive ? {
    player: currentPlayer,
    currentBid: auctionState.currentBid || currentPlayer.basePrice,
    leadingTeam: currentPlayer.lastBidTeam || 'No bids yet',
  } : undefined;

  const recentSales = allPlayers.filter((p: any) => p.status === 'sold').slice(-3).reverse();

  const teamStandings = Object.values(teamState).map((team: any) => ({
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
