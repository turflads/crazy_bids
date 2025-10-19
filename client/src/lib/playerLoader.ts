import * as XLSX from 'xlsx';
import { loadAuctionConfig } from './auctionConfig';

export interface PlayerData {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  basePrice: number;
  status: 'unsold' | 'sold';
  image?: string;
  // Player statistics
  battingStyle?: string;  // e.g., "Right-hand bat"
  bowlingStyle?: string;  // e.g., "Right-arm medium"
  runs?: number;          // Total runs scored
  wickets?: number;       // Total wickets taken
  strikeRate?: number;    // Batting strike rate
  bowlingAverage?: number; // Bowling average
  cricherosLink?: string; // Link to CricHeroes profile
}

export async function loadPlayersFromExcel(): Promise<PlayerData[]> {
  try {
    const config = await loadAuctionConfig();
    const response = await fetch('/players.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(firstSheet) as any[];

    const players: PlayerData[] = data.map((row, index) => {
      const name = row.name || row.Name || '';
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      const grade = (row.grade || row.Grade || 'C').toString().toUpperCase();
      const photo = row.photo || row.Photo || '';

      // ==========================================
      // SOLUTION A: READ STATS FROM EXCEL COLUMNS
      // ==========================================
      // Excel column names for stats (case-insensitive):
      // - bat, Bat, or batting_style
      // - bowl, Bowl, or bowling_style  
      // - runs, Runs
      // - wickets, Wickets
      // - strike_rate, strikeRate, or SR
      // - bowling_avg, bowlingAvg, or bowling_average
      // - cricheroes_link, cricherosLink, or profile_link
      
      const battingStyle = row.bat || row.Bat || row.batting_style || row.battingStyle;
      const bowlingStyle = row.bowl || row.Bowl || row.bowling_style || row.bowlingStyle;
      const runs = row.runs || row.Runs;
      const wickets = row.wickets || row.Wickets;
      const strikeRate = row.strike_rate || row.strikeRate || row.SR || row.sr;
      const bowlingAverage = row.bowling_avg || row.bowlingAvg || row.bowling_average || row.bowlingAverage;
      const cricherosLink = row.cricheroes_link || row.cricherosLink || row.profile_link || row.profileLink;

      return {
        id: (index + 1).toString(),
        firstName,
        lastName,
        grade,
        basePrice: config.gradeBasePrices[grade] || 1000000,
        status: 'unsold' as const,
        image: photo ? `/player_images/${photo}` : undefined,
        // Stats fields - will be undefined if columns don't exist
        battingStyle: battingStyle ? String(battingStyle) : undefined,
        bowlingStyle: bowlingStyle ? String(bowlingStyle) : undefined,
        runs: runs ? Number(runs) : undefined,
        wickets: wickets ? Number(wickets) : undefined,
        strikeRate: strikeRate ? Number(strikeRate) : undefined,
        bowlingAverage: bowlingAverage ? Number(bowlingAverage) : undefined,
        cricherosLink: cricherosLink ? String(cricherosLink) : undefined,
      };

      // ==========================================
      // SOLUTION B: ONLY CRICHEROES LINK
      // ==========================================
      // If you only want to store CricHeroes link and show a button,
      // comment out all the stats fields above EXCEPT cricherosLink
      // The PlayerCard will show a "View Stats" button instead
    });

    return players;
  } catch (error) {
    console.error('Error loading players from Excel:', error);
    return [];
  }
}
