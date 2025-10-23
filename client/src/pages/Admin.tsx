import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import NavBar from "@/components/NavBar";
import AdminDashboard from "@/components/AdminDashboard";
import CelebrationPopup from "@/components/CelebrationPopup";
import { getAuctionState, initializeAuctionState, clearAuctionState } from "@/lib/auctionState";
import { initializeTeams, updateTeamAfterPurchase, clearTeamState, getTeamState } from "@/lib/teamState";
import { saveAuctionStateWithBroadcast } from "@/lib/webSocketState";
import { loadPlayersFromExcel } from "@/lib/playerLoader";
import { loadAuctionConfig, type Team } from "@/lib/auctionConfig";
import { calculateMaxBidSync } from "@/lib/maxBidCalculator";

export default function Admin() {
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
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [gradeIncrements, setGradeIncrements] = useState<Record<string, number>>({});
  const [gradeQuotas, setGradeQuotas] = useState<Record<string, number>>({});
  const [gradeBasePrices, setGradeBasePrices] = useState<Record<string, number>>({});

  // Initialize auction state
  const [players, setPlayers] = useState<any[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentBid, setCurrentBid] = useState(0);
  const [isAuctionActive, setIsAuctionActive] = useState(false);
  const [bidHistory, setBidHistory] = useState<Array<{team: string, amount: number}>>([]);
  const [hasBids, setHasBids] = useState(false);

  // Load configuration and players
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingPlayers(true);
      
      const config = await loadAuctionConfig();
      setTeams(config.teams);
      setGradeIncrements(config.gradeIncrements);
      setGradeQuotas(config.gradeQuotas);
      setGradeBasePrices(config.gradeBasePrices);
      
      const loadedPlayers = await loadPlayersFromExcel();
      
      if (loadedPlayers.length > 0) {
        const existingState = getAuctionState();
        
        if (existingState && existingState.players.length > 0) {
          // Restore complete auction state from localStorage
          setPlayers(existingState.players);
          setCurrentPlayerIndex(existingState.currentPlayerIndex);
          setCurrentBid(existingState.currentBid);
          setIsAuctionActive(existingState.isAuctionActive);
          setBidHistory(existingState.bidHistory || []);
          setHasBids(existingState.hasBids || false);
        } else {
          // Initialize fresh auction state
          const auctionState = initializeAuctionState(loadedPlayers);
          setPlayers(auctionState.players);
          setCurrentPlayerIndex(auctionState.currentPlayerIndex);
          setCurrentBid(auctionState.currentBid);
          setIsAuctionActive(auctionState.isAuctionActive);
          setBidHistory(auctionState.bidHistory);
          setHasBids(auctionState.hasBids);
        }
      }
      
      setIsLoadingPlayers(false);
    };
    
    loadData();
  }, []);

  // Initialize teams
  useEffect(() => {
    if (teams.length > 0) {
      initializeTeams(teams);
    }
  }, [teams]);

  // Refresh config periodically to sync team changes from config.json
  useEffect(() => {
    const refreshConfig = async () => {
      const config = await loadAuctionConfig(true);
      setTeams(config.teams);
      setGradeIncrements(config.gradeIncrements);
      setGradeQuotas(config.gradeQuotas);
      setGradeBasePrices(config.gradeBasePrices);
    };
    
    const interval = setInterval(refreshConfig, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Save auction state whenever it changes and broadcast via WebSocket
  useEffect(() => {
    if (players.length > 0) {
      saveAuctionStateWithBroadcast({
        currentPlayerIndex,
        currentBid,
        isAuctionActive,
        players,
        lastBidTeam: '',
        bidHistory,
        hasBids,
      });
    }
  }, [currentPlayerIndex, currentBid, isAuctionActive, players, bidHistory, hasBids]);

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

  if (isLoadingPlayers) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Loading players...</p>
        </div>
      </div>
    );
  }

  // Get team data with max bid calculations
  const teamState = getTeamState();
  const currentPlayer = players[currentPlayerIndex];
  const teamData = teams.map(team => {
    const state = teamState[team.name] || {
      name: team.name,
      flag: team.flag,
      totalPurse: team.totalPurse,
      usedPurse: 0,
      players: [],
      gradeCount: { A: 0, B: 0, C: 0 },
    };
    
    const maxBid = currentPlayer ? calculateMaxBidSync(
      {
        totalPurse: state.totalPurse,
        usedPurse: state.usedPurse,
        gradeCount: state.gradeCount,
        quotas: gradeQuotas,
      },
      currentPlayer.grade,
      gradeBasePrices,
      gradeQuotas
    ) : 0;

    return {
      name: team.name,
      flag: team.flag,
      logo: team.logo,
      playersCount: state.players.length,
      purseUsed: state.usedPurse,
      purseRemaining: state.totalPurse - state.usedPurse,
      totalPurse: state.totalPurse,
      gradeCount: state.gradeCount,
      players: state.players,
      maxBid,
    };
  });

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
        gradeQuotas={gradeQuotas}
        gradeBasePrices={gradeBasePrices}
        isAuctionActive={isAuctionActive}
        hasBids={hasBids}
        teamData={teamData}
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
          const currentPlayer = players[currentPlayerIndex];
          
          // Validate bid
          const teamStateData = teamState[team];
          if (!teamStateData) {
            alert(`Team "${team}" not found!`);
            return;
          }

          // Check if team has already fulfilled their grade quota (BEFORE other checks)
          const currentGradeCount = teamStateData.gradeCount[currentPlayer.grade] || 0;
          const requiredGradeCount = gradeQuotas[currentPlayer.grade] || 0;
          
          if (requiredGradeCount > 0 && currentGradeCount >= requiredGradeCount) {
            alert(`${team} has already fulfilled their Grade ${currentPlayer.grade} quota (${currentGradeCount}/${requiredGradeCount})!`);
            return;
          }

          // Get team's current data
          const remainingPurse = teamStateData.totalPurse - teamStateData.usedPurse;
          
          // Check if team has enough purse
          if (amount > remainingPurse) {
            alert(`${team} doesn't have enough purse!\nBid: ₹${amount.toLocaleString()}\nRemaining Purse: ₹${remainingPurse.toLocaleString()}`);
            return;
          }

          // Calculate max bid for this team
          const maxBid = calculateMaxBidSync(
            {
              totalPurse: teamStateData.totalPurse,
              usedPurse: teamStateData.usedPurse,
              gradeCount: teamStateData.gradeCount,
              quotas: gradeQuotas,
            },
            currentPlayer.grade,
            gradeBasePrices,
            gradeQuotas
          );

          // Check if bid exceeds max allowed (considering reserve for remaining quotas)
          if (amount > maxBid) {
            alert(`${team} cannot bid this amount!\nMax Bid: ₹${maxBid.toLocaleString()}\nThis ensures you can fill all remaining grade quota requirements.`);
            return;
          }
          
          // Store current state in history
          if (hasBids) {
            setBidHistory([...bidHistory, {
              team: currentPlayer.lastBidTeam || '',
              amount: currentBid
            }]);
          }

          setCurrentBid(amount);
          setHasBids(true);
          const updatedPlayers = [...players];
          updatedPlayers[currentPlayerIndex] = {
            ...updatedPlayers[currentPlayerIndex],
            lastBidTeam: team,
            lastBidAmount: amount,
          };
          setPlayers(updatedPlayers);
          console.log(`${team} bid ₹${amount}`);
        }}
        onCancelBid={() => {
          if (bidHistory.length === 0) {
            // No bids to cancel, reset to base price
            const currentPlayer = players[currentPlayerIndex];
            setCurrentBid(currentPlayer.basePrice);
            setHasBids(false);
            const updatedPlayers = [...players];
            updatedPlayers[currentPlayerIndex] = {
              ...updatedPlayers[currentPlayerIndex],
              lastBidTeam: undefined,
              lastBidAmount: undefined,
            };
            setPlayers(updatedPlayers);
            console.log('Bid cancelled - reset to base price');
            return;
          }

          // Restore previous bid from history
          const previousBid = bidHistory[bidHistory.length - 1];
          setBidHistory(bidHistory.slice(0, -1));
          setCurrentBid(previousBid.amount);
          
          if (bidHistory.length === 1) {
            setHasBids(false);
          }
          
          const updatedPlayers = [...players];
          updatedPlayers[currentPlayerIndex] = {
            ...updatedPlayers[currentPlayerIndex],
            lastBidTeam: previousBid.team || undefined,
            lastBidAmount: previousBid.amount,
          };
          setPlayers(updatedPlayers);
          console.log('Bid cancelled - restored previous bid');
        }}
        onSold={() => {
          const currentPlayer = players[currentPlayerIndex];
          const soldTeam = currentPlayer.lastBidTeam || 'Unknown';
          const soldPrice = currentBid;
          
          // Update player status
          const updatedPlayers = [...players];
          updatedPlayers[currentPlayerIndex] = {
            ...currentPlayer,
            status: 'sold',
            team: soldTeam,
            soldPrice: soldPrice,
          };
          
          // Calculate next index before state updates
          const nextIndex = Math.min(currentPlayerIndex + 1, updatedPlayers.length - 1);
          
          // Update all state together to ensure consistency
          setPlayers(updatedPlayers);
          setCurrentPlayerIndex(nextIndex);
          setCurrentBid(updatedPlayers[nextIndex]?.basePrice || 0);
          setBidHistory([]);
          setHasBids(false);
          
          // Update team state
          updateTeamAfterPurchase(soldTeam, currentPlayer, soldPrice);
          
          // Find team data
          const team = teams.find(t => t.name === soldTeam);
          
          // Show celebration popup
          setCelebrationData({
            open: true,
            playerName: `${currentPlayer.firstName} ${currentPlayer.lastName}`,
            teamName: soldTeam,
            teamFlag: team?.flag || '🏆',
            teamLogo: team?.logo,
            soldPrice: soldPrice,
            grade: currentPlayer.grade,
          });
          
          // Auto-dismiss after 5 seconds
          setTimeout(() => {
            setCelebrationData(null);
          }, 5000);
          
          console.log('Player sold to', soldTeam, 'for ₹', soldPrice);
        }}
        onUnsold={() => {
          const currentPlayer = players[currentPlayerIndex];
          
          // Re-queue the unsold player at the end with cleared bid data
          const updatedPlayers = [...players];
          const unsoldPlayer = {
            ...currentPlayer,
            status: 'unsold' as const,
            lastBidTeam: undefined,
            lastBidAmount: undefined,
            soldPrice: undefined,
          };
          
          // Remove from current position
          updatedPlayers.splice(currentPlayerIndex, 1);
          
          // Add to the end
          updatedPlayers.push(unsoldPlayer);
          
          setPlayers(updatedPlayers);
          
          console.log('Player unsold and re-queued at the end');
          
          // Adjust index if we removed the last player
          const newIndex = currentPlayerIndex >= updatedPlayers.length 
            ? Math.max(0, updatedPlayers.length - 1)
            : currentPlayerIndex;
          
          setCurrentPlayerIndex(newIndex);
          setCurrentBid(updatedPlayers[newIndex]?.basePrice || 0);
          setBidHistory([]);
          setHasBids(false);
        }}
        onResetAuction={async () => {
          clearTeamState();
          clearAuctionState();
          initializeTeams(teams);
          
          const loadedPlayers = await loadPlayersFromExcel();
          const auctionState = initializeAuctionState(loadedPlayers);
          setPlayers(auctionState.players);
          setCurrentPlayerIndex(auctionState.currentPlayerIndex);
          setCurrentBid(auctionState.currentBid);
          setIsAuctionActive(false);
          setBidHistory([]);
          setHasBids(false);
        }}
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
