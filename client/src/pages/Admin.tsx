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
  const [gradeMaxBidCaps, setGradeMaxBidCaps] = useState<Record<string, number>>({});

  // Helper function to find the next unsold player
  // Searches entire roster (wraps around) EXCLUDING current index
  // Returns index of next different unsold player, or null if none exist
  const findNextUnsoldPlayer = (currentIndex: number, playersList: any[]): number | null => {
    // Handle empty player list
    if (playersList.length === 0) {
      return null;
    }
    
    // Search forward from current position (skip current)
    let nextIndex = currentIndex + 1;
    while (nextIndex < playersList.length) {
      const player = playersList[nextIndex];
      // Check only status field - it's the primary indicator
      if (player.status !== 'sold') {
        return nextIndex;
      }
      nextIndex++;
    }
    
    // Wrap around: search from beginning up to (but NOT including) current
    for (let i = 0; i < currentIndex; i++) {
      const player = playersList[i];
      // Check only status field - it's the primary indicator
      if (player.status !== 'sold') {
        return i;
      }
    }
    
    // No OTHER unsold player exists (current might be unsold, but no others)
    return null;
  };

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
      setGradeMaxBidCaps(config.gradeMaxBidCaps || {});
      
      const loadedPlayers = await loadPlayersFromExcel();
      
      if (loadedPlayers.length > 0) {
        const existingState = getAuctionState();
        
        if (existingState && existingState.players.length > 0) {
          // Restore complete auction state from localStorage
          const restoredPlayers = existingState.players;
          let restoredIndex = existingState.currentPlayerIndex;
          
          // Check if current player is sold (may have been sold by Super Admin)
          // If so, find the first unsold player
          const currentPlayer = restoredPlayers[restoredIndex];
          if (currentPlayer && currentPlayer.status === 'sold') {
            // Find first unsold player
            const firstUnsoldIndex = restoredPlayers.findIndex(p => p.status !== 'sold');
            if (firstUnsoldIndex !== -1) {
              restoredIndex = firstUnsoldIndex;
            }
          }
          
          setPlayers(restoredPlayers);
          setCurrentPlayerIndex(restoredIndex);
          setCurrentBid(restoredPlayers[restoredIndex]?.basePrice || existingState.currentBid);
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

  // Push current state to server on mount to populate server-side cache
  useEffect(() => {
    const syncStateToServer = async () => {
      const currentAuctionState = getAuctionState();
      const currentTeamState = getTeamState();
      
      try {
        await Promise.all([
          fetch('/api/auction-state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentAuctionState),
          }),
          fetch('/api/team-state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentTeamState),
          }),
        ]);
      } catch (err) {
        console.error('Failed to sync state to server:', err);
      }
    };
    
    // Sync after a short delay to ensure state is initialized
    setTimeout(syncStateToServer, 1000);
  }, []);

  // Refresh config periodically to sync team changes from config.json
  useEffect(() => {
    const refreshConfig = async () => {
      const config = await loadAuctionConfig(true);
      setTeams(config.teams);
      setGradeIncrements(config.gradeIncrements);
      setGradeQuotas(config.gradeQuotas);
      setGradeBasePrices(config.gradeBasePrices);
      setGradeMaxBidCaps(config.gradeMaxBidCaps || {});
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

  // Listen for cross-tab changes (e.g., Super Admin marking players as sold)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auctionState' && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue);
          if (newState.players && Array.isArray(newState.players)) {
            setPlayers(newState.players);
            
            // Check if current player is now sold - if so, skip to next unsold
            const currentPlayer = newState.players[currentPlayerIndex];
            if (currentPlayer && currentPlayer.status === 'sold') {
              const nextUnsoldIndex = findNextUnsoldPlayer(currentPlayerIndex, newState.players);
              if (nextUnsoldIndex !== null) {
                setCurrentPlayerIndex(nextUnsoldIndex);
                setCurrentBid(newState.players[nextUnsoldIndex]?.basePrice || 0);
              }
            }
          }
        } catch (err) {
          console.error('Error handling storage change:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentPlayerIndex, players]);

  // Poll for player changes (backup for same-tab updates)
  useEffect(() => {
    const checkForPlayerUpdates = () => {
      const currentState = getAuctionState();
      if (currentState && currentState.players) {
        // Check if current player status changed to sold
        const currentPlayer = currentState.players[currentPlayerIndex];
        if (currentPlayer && currentPlayer.status === 'sold') {
          // Only update if our local state doesn't match
          if (players[currentPlayerIndex]?.status !== 'sold') {
            setPlayers(currentState.players);
            const nextUnsoldIndex = findNextUnsoldPlayer(currentPlayerIndex, currentState.players);
            if (nextUnsoldIndex !== null) {
              setCurrentPlayerIndex(nextUnsoldIndex);
              setCurrentBid(currentState.players[nextUnsoldIndex]?.basePrice || 0);
            }
          }
        }
      }
    };

    const interval = setInterval(checkForPlayerUpdates, 2000);
    return () => clearInterval(interval);
  }, [currentPlayerIndex, players]);

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
      gradeQuotas,
      gradeMaxBidCaps
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
        onNextPlayer={() => {
          const nextUnsoldIndex = findNextUnsoldPlayer(currentPlayerIndex, players);
          
          // Check if no other unsold players exist
          if (nextUnsoldIndex === null) {
            if (!isAuctionActive) {
              alert('Auction is complete. All players have been sold.');
            } else {
              alert('No more unsold players remaining.');
            }
            return;
          }
          
          const nextPlayer = players[nextUnsoldIndex];
          setCurrentPlayerIndex(nextUnsoldIndex);
          setCurrentBid(nextPlayer?.basePrice || 0);
        }}
        onPrevPlayer={() => setCurrentPlayerIndex(Math.max(currentPlayerIndex - 1, 0))}
        onStartAuction={() => {
          // When starting auction, find first unsold player
          // (in case Super Admin has pre-sold some players)
          const firstUnsoldIndex = findNextUnsoldPlayer(-1, players);
          
          // Check if no unsold players found
          if (firstUnsoldIndex === null) {
            alert('No unsold players available. Cannot start auction.');
            return;
          }
          
          const firstPlayer = players[firstUnsoldIndex];
          if (firstUnsoldIndex !== currentPlayerIndex) {
            setCurrentPlayerIndex(firstUnsoldIndex);
            setCurrentBid(firstPlayer?.basePrice || 0);
          }
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

          // Check if bid exceeds grade-specific cap (if configured)
          if (gradeMaxBidCaps[currentPlayer.grade] && amount > gradeMaxBidCaps[currentPlayer.grade]) {
            alert(`Bid exceeds Grade ${currentPlayer.grade} maximum limit!\nMax allowed for Grade ${currentPlayer.grade}: ₹${gradeMaxBidCaps[currentPlayer.grade].toLocaleString()}\nYour bid: ₹${amount.toLocaleString()}`);
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
            gradeQuotas,
            gradeMaxBidCaps
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
          
          // Find next unsold player - skip already sold players
          const nextIndex = findNextUnsoldPlayer(currentPlayerIndex, updatedPlayers);
          
          // Update player list first
          setPlayers(updatedPlayers);
          setBidHistory([]);
          setHasBids(false);
          
          // Check if no more unsold players - auction complete!
          if (nextIndex === null) {
            console.log('All players have been sold! Auction complete.');
            // End the auction
            setIsAuctionActive(false);
            // Stay on current (just sold) player
            setCurrentPlayerIndex(currentPlayerIndex);
            setCurrentBid(0);
            // Show completion alert after celebration
            setTimeout(() => {
              alert('Auction Complete! All players have been sold.');
            }, 5500);
          } else {
            // Move to next unsold player
            const nextPlayer = updatedPlayers[nextIndex];
            setCurrentPlayerIndex(nextIndex);
            setCurrentBid(nextPlayer?.basePrice || 0);
          }
          
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
          
          // Create unsold player with cleared bid data
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
          
          // ==================== UNSOLD PLAYER RE-AUCTION STRATEGY ====================
          // Choose ONE strategy based on your Excel file organization:
          // 
          // STRATEGY 1: Grade-Based Re-Auction (for sorted Excel files: A, A, A, B, B, C, C)
          //   - Unsold Grade A players come back AFTER all Grade A players finish
          //   - Then Grade B starts
          //   - Use this when Excel is sorted by grade
          //
          // STRATEGY 2: All Unsold at End (for random Excel files: A, C, B, A, B, C)
          //   - ALL unsold players come back at the END together
          //   - Use this when Excel has random/mixed grade order
          //
          // TO SWITCH: Comment out one strategy, uncomment the other
          // ===========================================================================
          
          // ---- STRATEGY 1: GRADE-BASED RE-AUCTION (Sorted Excel Files) ----
          // UNCOMMENT THIS BLOCK FOR SORTED EXCEL FILES (A, A, B, B, C, C):
          /*
          let insertIndex = currentPlayerIndex; // Default to current position (right before next grade)
          let foundMoreOfSameGrade = false;
          
          for (let i = currentPlayerIndex; i < updatedPlayers.length; i++) {
            if (updatedPlayers[i].grade === currentPlayer.grade) {
              insertIndex = i + 1; // Insert after the last same-grade player
              foundMoreOfSameGrade = true;
            }
          }
          
          // Insert the unsold player at the calculated position
          updatedPlayers.splice(insertIndex, 0, unsoldPlayer);
          
          console.log(`[GRADE-BASED] Player unsold and re-queued after Grade ${currentPlayer.grade} players at position ${insertIndex}`);
          
          // Calculate new index to continue auction
          let newIndex = currentPlayerIndex;
          
          if (foundMoreOfSameGrade) {
            // There are more players of this grade ahead, move to next player (skip the unsold one)
            // Do nothing - stay at currentPlayerIndex which now points to the next same-grade player
          } else {
            // This was the last player of this grade, unsold player is inserted right here
            // Stay on this position so the unsold player comes up immediately before next grade
            // Do nothing - currentPlayerIndex already points to the reinserted unsold player
          }
          
          // Ensure index is within bounds
          newIndex = Math.min(newIndex, updatedPlayers.length - 1);
          newIndex = Math.max(0, newIndex);
          */
          
          // ---- STRATEGY 2: ALL UNSOLD AT END (Random Excel Files) ----
          // COMMENT THIS BLOCK FOR SORTED EXCEL FILES, KEEP FOR RANDOM FILES:
          
          // Add unsold player to the end of the list
          updatedPlayers.push(unsoldPlayer);
          
          console.log(`[ALL AT END] Player unsold and re-queued at end, position ${updatedPlayers.length - 1}`);
          
          // Continue with current position (now showing next player)
          let newIndex = currentPlayerIndex;
          
          // Ensure index is within bounds
          newIndex = Math.min(newIndex, updatedPlayers.length - 1);
          newIndex = Math.max(0, newIndex);
          
          
          // ---- COMMON CODE (applies to both strategies) ----
          setPlayers(updatedPlayers);
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
