// Team state management for tracking purse and players across all teams
interface TeamData {
  name: string;
  flag?: string;
  logo?: string;
  totalPurse: number;
  usedPurse: number;
  players: any[];
  gradeCount: Record<string, number>;
}

const TEAM_STATE_KEY = 'cricket_auction_teams';

export const getTeamState = (): Record<string, TeamData> => {
  const stored = localStorage.getItem(TEAM_STATE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {};
};

export const saveTeamState = (teams: Record<string, TeamData>) => {
  localStorage.setItem(TEAM_STATE_KEY, JSON.stringify(teams));
};

// Import WebSocket broadcast wrapper - dynamic import to avoid circular dependencies
let saveTeamStateWithBroadcast: any = null;
import('./webSocketState').then(module => {
  saveTeamStateWithBroadcast = module.saveTeamStateWithBroadcast;
});

// Export the wrapper function to use in other components
export { saveTeamStateWithBroadcast };

export const initializeTeams = (
  teamNames: { name: string; flag?: string; logo?: string; totalPurse?: number }[],
  gradeQuotas?: Record<string, number>
) => {
  const existing = getTeamState();
  const teams: Record<string, TeamData> = {};
  
  // Create initial grade count from gradeQuotas (all zeros)
  const initialGradeCount: Record<string, number> = {};
  if (gradeQuotas) {
    Object.keys(gradeQuotas).forEach(grade => {
      initialGradeCount[grade] = 0;
    });
  } else {
    // Fallback to default grades
    initialGradeCount.A = 0;
    initialGradeCount.B = 0;
    initialGradeCount.C = 0;
  }
  
  teamNames.forEach(team => {
    if (existing[team.name]) {
      teams[team.name] = {
        ...existing[team.name],
        flag: team.flag,
        logo: team.logo,
        totalPurse: team.totalPurse || 100000000,
      };
    } else {
      teams[team.name] = {
        name: team.name,
        flag: team.flag,
        logo: team.logo,
        totalPurse: team.totalPurse || 100000000,
        usedPurse: 0,
        players: [],
        gradeCount: { ...initialGradeCount },
      };
    }
  });

  // Use WebSocket-aware save if available, otherwise fall back to local save
  if (saveTeamStateWithBroadcast) {
    saveTeamStateWithBroadcast(teams);
  } else {
    saveTeamState(teams);
  }
  return teams;
};

export const updateTeamAfterPurchase = (teamName: string, player: any, price: number) => {
  const teams = getTeamState();
  if (teams[teamName]) {
    teams[teamName].usedPurse += price;
    teams[teamName].players.push({ ...player, soldPrice: price });
    teams[teamName].gradeCount[player.grade] = (teams[teamName].gradeCount[player.grade] || 0) + 1;
    
    // Use WebSocket-aware save if available, otherwise fall back to local save
    if (saveTeamStateWithBroadcast) {
      saveTeamStateWithBroadcast(teams);
    } else {
      saveTeamState(teams);
    }
  }
  return teams;
};

export const clearTeamState = () => {
  localStorage.removeItem(TEAM_STATE_KEY);
};
