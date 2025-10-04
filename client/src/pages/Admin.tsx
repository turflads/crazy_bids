import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import NavBar from "@/components/NavBar";
import AdminDashboard from "@/components/AdminDashboard";
import CelebrationPopup from "@/components/CelebrationPopup";
import { getAuctionState, saveAuctionState, initializeAuctionState } from "@/lib/auctionState";
import { initializeTeams, updateTeamAfterPurchase } from "@/lib/teamState";

export default function Admin() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [celebrationData, setCelebrationData] = useState<{
    open: boolean;
    playerName: string;
    teamName: string;
    teamFlag: string;
    soldPrice: number;
    grade: string;
  } | null>(null);
  
  //todo: remove mock functionality
  const initialPlayers = [
    { id: '1', firstName: 'Virat', lastName: 'Kohli', grade: 'A', basePrice: 2000000, status: 'unsold' as const },
    { id: '2', firstName: 'Rohit', lastName: 'Sharma', grade: 'A', basePrice: 2000000, status: 'unsold' as const },
    { id: '3', firstName: 'MS', lastName: 'Dhoni', grade: 'B', basePrice: 1500000, status: 'unsold' as const },
    { id: '4', firstName: 'Jasprit', lastName: 'Bumrah', grade: 'A', basePrice: 2000000, status: 'unsold' as const },
    { id: '5', firstName: 'Ravindra', lastName: 'Jadeja', grade: 'B', basePrice: 1500000, status: 'unsold' as const },
    { id: '6', firstName: 'Hardik', lastName: 'Pandya', grade: 'B', basePrice: 1500000, status: 'unsold' as const },
  ];
  
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

  // Initialize auction state from localStorage or create new
  const auctionState = initializeAuctionState(initialPlayers);
  const [players, setPlayers] = useState(auctionState.players);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(auctionState.currentPlayerIndex);
  const [currentBid, setCurrentBid] = useState(auctionState.currentBid);
  const [isAuctionActive, setIsAuctionActive] = useState(auctionState.isAuctionActive);

  // Initialize teams
  useEffect(() => {
    initializeTeams(teams);
  }, []);

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
          const updatedPlayers = [...players];
          updatedPlayers[currentPlayerIndex] = {
            ...updatedPlayers[currentPlayerIndex],
            lastBidTeam: team,
            lastBidAmount: amount,
          };
          setPlayers(updatedPlayers);
          console.log(`${team} bid ₹${amount}`);
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
          
          // Find team flag
          const team = teams.find(t => t.name === soldTeam);
          
          // Show celebration popup
          setCelebrationData({
            open: true,
            playerName: `${currentPlayer.firstName} ${currentPlayer.lastName}`,
            teamName: soldTeam,
            teamFlag: team?.flag || '🏆',
            soldPrice: soldPrice,
            grade: currentPlayer.grade,
          });
          
          console.log('Player sold to', soldTeam, 'for ₹', soldPrice);
          
          // Move to next player after a short delay using updated players array
          setTimeout(() => {
            const nextIndex = Math.min(currentPlayerIndex + 1, updatedPlayers.length - 1);
            setCurrentPlayerIndex(nextIndex);
            setCurrentBid(updatedPlayers[nextIndex]?.basePrice || 0);
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
        }}
        onUploadPlayers={(file) => console.log('File uploaded:', file.name)}
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
          soldPrice={celebrationData.soldPrice}
          grade={celebrationData.grade}
        />
      )}
    </div>
  );
}
