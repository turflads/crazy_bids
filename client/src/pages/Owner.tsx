import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import NavBar from "@/components/NavBar";
import OwnerDashboard from "@/components/OwnerDashboard";

export default function Owner() {
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

  const gradeQuotas = [
    { grade: 'A', required: 4, current: 1, color: 'bg-grade-a' },
    { grade: 'B', required: 3, current: 1, color: 'bg-grade-b' },
    { grade: 'C', required: 4, current: 0, color: 'bg-grade-c' },
  ];

  const myTeamPlayers = allPlayers.filter(p => p.team === 'Mumbai Indians');
  const soldPlayers = allPlayers.filter(p => p.status === 'sold');
  const unsoldPlayers = allPlayers.filter(p => p.status === 'unsold');

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
        totalPurse={100000000}
        usedPurse={5500000}
        gradeQuotas={gradeQuotas}
        allPlayers={allPlayers}
        myTeamPlayers={myTeamPlayers}
        soldPlayers={soldPlayers}
        unsoldPlayers={unsoldPlayers}
      />
    </div>
  );
}
