import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import NavBar from "@/components/NavBar";
import OwnerDashboard from "@/components/OwnerDashboard";
import { useAuctionSync } from "@/hooks/useAuctionSync";
import { loadAuctionConfig } from "@/lib/auctionConfig";
import { calculateMaxBidSync } from "@/lib/maxBidCalculator";

export default function Owner() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [gradeQuotas, setGradeQuotas] = useState<Record<string, number>>({});
  const [gradeBasePrices, setGradeBasePrices] = useState<Record<string, number>>({});
  
  // Use synced auction and team state
  const { auctionState, teamState } = useAuctionSync();
  
  const allPlayers = auctionState?.players || [];
  const soldPlayers = allPlayers.filter((p: any) => p.status === 'sold');
  const unsoldPlayers = allPlayers.filter((p: any) => p.status === 'unsold');
  
  // Get current auction info
  const currentPlayerIndex = auctionState?.currentPlayerIndex || 0;
  const currentPlayer = allPlayers[currentPlayerIndex];
  const currentBid = auctionState?.currentBid || currentPlayer?.basePrice;
  const isAuctionActive = auctionState?.isAuctionActive;
  
  // Convert team state to array for display with max bid calculations
  const allTeamsData = Object.values(teamState).map((team: any) => {
    const maxBid = currentPlayer && Object.keys(gradeQuotas).length > 0 ? calculateMaxBidSync(
      {
        totalPurse: team.totalPurse,
        usedPurse: team.usedPurse,
        gradeCount: team.gradeCount,
        quotas: gradeQuotas,
      },
      currentPlayer.grade,
      gradeBasePrices,
      gradeQuotas
    ) : 0;

    return {
      team: team.name,
      logo: team.logo,
      playersCount: team.players.length,
      purseUsed: team.usedPurse,
      purseRemaining: team.totalPurse - team.usedPurse,
      totalPurse: team.totalPurse,
      gradeCount: team.gradeCount,
      players: team.players,
      maxBid,
    };
  });

  useEffect(() => {
    const loadConfig = async () => {
      const config = await loadAuctionConfig();
      setGradeQuotas(config.gradeQuotas);
      setGradeBasePrices(config.gradeBasePrices);
    };
    loadConfig();
  }, []);

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
        currentPlayer={currentPlayer}
        currentBid={currentBid}
        isAuctionActive={isAuctionActive}
      />
    </div>
  );
}
