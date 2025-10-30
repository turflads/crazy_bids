import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import NavBar from "@/components/NavBar";
import ViewerDashboard from "@/components/ViewerDashboard";
import CelebrationPopup from "@/components/CelebrationPopup";
import { useAuctionSync } from "@/hooks/useAuctionSync";

export default function Viewer() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [celebrationData, setCelebrationData] = useState<{
    open: boolean;
    playerName: string;
    teamName: string;
    teamFlag: string;
    teamLogo?: string;
    soldPrice: number;
    grade: string;
  } | null>(null);
  
  // Use synced auction and team state
  const { auctionState, teamState } = useAuctionSync();
  
  // Track previous players to detect new sales
  const previousPlayersRef = useRef<any[]>([]);
  
  const allPlayers = auctionState?.players || [];
  const currentPlayerIndex = auctionState?.currentPlayerIndex || 0;
  const currentPlayer = allPlayers[currentPlayerIndex];

  const currentAuction = currentPlayer && auctionState?.isAuctionActive ? {
    player: currentPlayer,
    currentBid: auctionState.currentBid || currentPlayer.basePrice,
    leadingTeam: currentPlayer.lastBidTeam || 'No bids yet',
    isAuctionActive: auctionState.isAuctionActive,
  } : undefined;

  const recentSales = allPlayers.filter((p: any) => p.status === 'sold').slice(-3).reverse();

  const teamStandings = Object.values(teamState).map((team: any) => ({
    team: team.name,
    flag: team.flag,
    logo: team.logo,
    playersCount: team.players.length,
    purseUsed: team.usedPurse,
    purseRemaining: team.totalPurse - team.usedPurse,
    totalPurse: team.totalPurse,
    gradeCount: team.gradeCount,
    players: team.players,
  }));

  // Detect new sales and show celebration
  useEffect(() => {
    if (!allPlayers.length) return;
    
    // Find newly sold players
    const previousPlayers = previousPlayersRef.current;
    if (previousPlayers.length > 0) {
      for (const player of allPlayers) {
        const prevPlayer = previousPlayers.find((p: any) => p.id === player.id);
        
        // If player was unsold before and is now sold, show celebration
        if (prevPlayer && prevPlayer.status === 'unsold' && player.status === 'sold') {
          const soldTeam = player.team;
          const teamData = Object.values(teamState).find((t: any) => t.name === soldTeam);
          
          setCelebrationData({
            open: true,
            playerName: `${player.firstName} ${player.lastName}`,
            teamName: soldTeam,
            teamFlag: teamData?.flag || '🏆',
            teamLogo: teamData?.logo,
            soldPrice: player.soldPrice,
            grade: player.grade,
          });
          
          // Auto-dismiss after 5 seconds
          setTimeout(() => {
            setCelebrationData(null);
          }, 5000);
          
          break; // Only show one celebration at a time
        }
      }
    }
    
    // Update reference
    previousPlayersRef.current = allPlayers;
  }, [allPlayers, teamState]);

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
        username={user.username}
      />
      {celebrationData && (
        <CelebrationPopup
          open={celebrationData.open}
          onOpenChange={(open) => {
            if (!open) {
              setCelebrationData(null);
            }
          }}
          playerName={celebrationData.playerName}
          teamName={celebrationData.teamName}
          teamFlag={celebrationData.teamFlag}
          teamLogo={celebrationData.teamLogo}
          soldPrice={celebrationData.soldPrice}
          grade={celebrationData.grade}
        />
      )}
    </div>
  );
}
