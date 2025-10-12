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

export const initializeTeams = (teamNames: { name: string; flag?: string; logo?: string; totalPurse?: number }[]) => {
  const existing = getTeamState();
  if (Object.keys(existing).length > 0) {
    return existing;
  }

  const teams: Record<string, TeamData> = {};
  teamNames.forEach(team => {
    teams[team.name] = {
      name: team.name,
      flag: team.flag,
      logo: team.logo,
      totalPurse: team.totalPurse || 100000000,
      usedPurse: 0,
      players: [],
      gradeCount: { A: 0, B: 0, C: 0 },
    };
  });

  saveTeamState(teams);
  return teams;
};

export const updateTeamAfterPurchase = (teamName: string, player: any, price: number) => {
  const teams = getTeamState();
  if (teams[teamName]) {
    teams[teamName].usedPurse += price;
    teams[teamName].players.push({ ...player, soldPrice: price });
    teams[teamName].gradeCount[player.grade] = (teams[teamName].gradeCount[player.grade] || 0) + 1;
    saveTeamState(teams);
  }
  return teams;
};

export const clearTeamState = () => {
  localStorage.removeItem(TEAM_STATE_KEY);
};
