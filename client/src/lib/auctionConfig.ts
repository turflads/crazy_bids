export interface Team {
  name: string;
  flag: string;
  totalPurse: number;
}

export interface AuctionConfig {
  gradeBasePrices: Record<string, number>;
  gradeIncrements: Record<string, number>;
  teams: Team[];
  gradeQuotas: Record<string, number>;
}

let cachedConfig: AuctionConfig | null = null;

export async function loadAuctionConfig(): Promise<AuctionConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const response = await fetch('/config.json');
    const config = await response.json();
    cachedConfig = config;
    return config;
  } catch (error) {
    console.error('Error loading auction config:', error);
    return {
      gradeBasePrices: {
        A: 2000000,
        B: 1500000,
        C: 1000000,
      },
      gradeIncrements: {
        A: 500000,
        B: 300000,
        C: 200000,
      },
      teams: [
        { name: 'Mumbai Indians', flag: '🔵', totalPurse: 100000000 },
        { name: 'Chennai Super Kings', flag: '🟡', totalPurse: 100000000 },
        { name: 'Royal Challengers', flag: '🔴', totalPurse: 100000000 },
        { name: 'Delhi Capitals', flag: '🔷', totalPurse: 100000000 },
      ],
      gradeQuotas: {
        A: 3,
        B: 4,
        C: 5,
      },
    };
  }
}
