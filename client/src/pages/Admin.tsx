import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import NavBar from "@/components/NavBar";
import AdminDashboard from "@/components/AdminDashboard";
import CelebrationPopup from "@/components/CelebrationPopup";
import { getAuctionState, saveAuctionState, initializeAuctionState } from "@/lib/auctionState";
import { initializeTeams, updateTeamAfterPurchase, clearTeamState } from "@/lib/teamState";
import { loadPlayersFromExcel } from "@/lib/playerLoader";
import { loadAuctionConfig, type Team } from "@/lib/auctionConfig";
import { calculateMaxBidSync } from "@/lib/maxBidCalculator";
import { useAuctionSync } from "@/hooks/useAuctionSync";

export default function Admin() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [celebrationData, setCelebrationData] = useState<{
    open: boolean;
    playerName: string;
    teamName: string;
    teamLogo: string;
    soldPrice: number;
    grade: string;
  } | null>(null);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [gradeIncrements, setGradeIncrements] = useState<Record<string, number>>({});
  const [gradeQuotas, setGradeQuotas] = useState<Record<string, number>>({});
  const [gradeBasePrices, setGradeBasePrices] = useState<Record<string, number>>({});

  // Use synced team state
  const { teamState, refresh } = useAuctionSync();

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
          setPlayers(existingState.players);
          setCurrentPlayerIndex(existingState.currentPlayerIndex);
          setCurrentBid(existingState.currentBid);
          setIsAuctionActive(existingState.isAuctionActive);
        } else {
          const auctionState = initializeAuctionState(loadedPlayers);
          setPlayers(auctionState.players);
          setCurrentPlayerIndex(auctionState.currentPlayerIndex);
          setCurrentBid(auctionState.currentBid);
          setIsAuctionActive(auctionState.isAuctionActive);
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

  // Save auction state whenever it changes
  useEffect(() => {
    saveAuctionState({
      currentPlayerIndex,
      currentBid,
      isAuctionActive,
      players,
      lastBidTeam: '',
    });
  }, [currentPlayerIndex, currentBid, isAuctionActive, players]);

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
  const currentPlayer = players[currentPlayerIndex];
  const teamData = teams.map(team => {
    const state = teamState[team.name] || {
      name: team.name,
      logo: team.logo,
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
          // Store current state in history
          const currentPlayer = players[currentPlayerIndex];
          
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
          setPlayers(updatedPlayers);
          
          // Update team state
          updateTeamAfterPurchase(soldTeam, currentPlayer, soldPrice);
          
          // Immediately refresh synced state to show updated team data
          refresh();
          
          // Find team logo
          const team = teams.find(t => t.name === soldTeam);
          
          // Show celebration popup
          setCelebrationData({
            open: true,
            playerName: `${currentPlayer.firstName} ${currentPlayer.lastName}`,
            teamName: soldTeam,
            teamLogo: team?.logo || '/mumbai.png',
            soldPrice: soldPrice,
            grade: currentPlayer.grade,
          });
          
          console.log('Player sold to', soldTeam, 'for ₹', soldPrice);
          
          // Move to next player after a short delay using updated players array
          setTimeout(() => {
            const nextIndex = Math.min(currentPlayerIndex + 1, updatedPlayers.length - 1);
            setCurrentPlayerIndex(nextIndex);
            setCurrentBid(updatedPlayers[nextIndex]?.basePrice || 0);
            setBidHistory([]);
            setHasBids(false);
          }, 500);
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
          teamLogo={celebrationData.teamLogo}
          soldPrice={celebrationData.soldPrice}
          grade={celebrationData.grade}
        />
      )}
    </div>
  );
}
