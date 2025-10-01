import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import NavBar from "@/components/NavBar";
import OwnerDashboard from "@/components/OwnerDashboard";
import { getAuctionState } from "@/lib/auctionState";
import { getTeamState } from "@/lib/teamState";

export default function Owner() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  
  // Get live auction and team state
  const auctionState = getAuctionState();
  const teamState = getTeamState();
  
  const allPlayers = auctionState?.players || [];
  const myTeamPlayers = allPlayers.filter((p: any) => p.team === 'Mumbai Indians');
  const soldPlayers = allPlayers.filter((p: any) => p.status === 'sold');
  const unsoldPlayers = allPlayers.filter((p: any) => p.status === 'unsold');
  
  const myTeamData = teamState['Mumbai Indians'] || {
    totalPurse: 100000000,
    usedPurse: 0,
    gradeCount: { A: 0, B: 0, C: 0 },
  };

  const gradeQuotas = [
    { grade: 'A', required: 4, current: myTeamData.gradeCount.A || 0, color: 'bg-grade-a' },
    { grade: 'B', required: 3, current: myTeamData.gradeCount.B || 0, color: 'bg-grade-b' },
    { grade: 'C', required: 4, current: myTeamData.gradeCount.C || 0, color: 'bg-grade-c' },
  ];
  
  // Convert team state to array for display
  const allTeamsData = Object.values(teamState).map((team: any) => ({
    team: team.name,
    flag: team.flag,
    playersCount: team.players.length,
    purseUsed: team.usedPurse,
    purseRemaining: team.totalPurse - team.usedPurse,
    gradeCount: team.gradeCount,
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
        teamName="Mumbai Indians"
        totalPurse={myTeamData.totalPurse}
        usedPurse={myTeamData.usedPurse}
        gradeQuotas={gradeQuotas}
        allPlayers={allPlayers}
        myTeamPlayers={myTeamPlayers}
        soldPlayers={soldPlayers}
        unsoldPlayers={unsoldPlayers}
        allTeamsData={allTeamsData}
      />
    </div>
  );
}
