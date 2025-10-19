import * as XLSX from "xlsx";
import { loadAuctionConfig } from "./auctionConfig";

// ============================================================================
// EXCEL COLUMN CONFIGURATION - CHANGE THESE TO MATCH YOUR EXCEL FILE
// ============================================================================
// Update these column names to match your Excel file exactly.
// The system will look for these exact column names (case-sensitive).
//
// Example: If your Excel has "runs_scored" instead of "runs", change:
//   RUNS_COLUMN: 'runs_scored'
// ============================================================================

const EXCEL_COLUMNS = {
  // Required columns
  NAME_COLUMN: "name", // Player's full name
  GRADE_COLUMN: "grade", // Player grade (A, B, C)
  PHOTO_COLUMN: "photo", // Player photo filename

  // Optional stat columns (leave empty '' if you don't have this column)
  // BATTING_STYLE_COLUMN: "Matches", // e.g., "Right-hand bat"
  //  BOWLING_STYLE_COLUMN: '',          // e.g., "Right-arm medium"
  // RUNS_COLUMN: "Runs_Scored", // Total runs scored
  // WICKETS_COLUMN: "Wickets_Taken", // Total wickets taken
  // STRIKE_RATE_COLUMN: "BatAvg", // Batting strike rate
  // BOWLING_AVG_COLUMN: "Economy", // Bowling average
  CRICHEROES_LINK_COLUMN: 'CricheroesLink', // CricHeroes profile URL
};

// ============================================================================
// END OF CONFIGURATION - DO NOT MODIFY CODE BELOW THIS LINE
// ============================================================================

export interface PlayerData {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  basePrice: number;
  status: "unsold" | "sold";
  image?: string;
  // Player statistics
  // battingStyle?: number; // e.g., "Right-hand bat"
  // bowlingStyle?: string; // e.g., "Right-arm medium"
  // runs?: number; // Total runs scored
  // wickets?: number; // Total wickets taken
  // strikeRate?: number; // Batting strike rate
  // bowlingAverage?: number; // Bowling average
  cricherosLink?: string; // Link to CricHeroes profile
}

export async function loadPlayersFromExcel(): Promise<PlayerData[]> {
  try {
    const config = await loadAuctionConfig();
    const response = await fetch("/players.xlsx");
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(firstSheet) as any[];

    const players: PlayerData[] = data.map((row, index) => {
      // Read data using configured column names
      const name = row[EXCEL_COLUMNS.NAME_COLUMN] || "";
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      const grade = (row[EXCEL_COLUMNS.GRADE_COLUMN] || "C")
        .toString()
        .toUpperCase();
      const photo = row[EXCEL_COLUMNS.PHOTO_COLUMN] || "";

      // Read stats using configured column names (will be undefined if column is empty or doesn't exist)
      // const battingStyle = EXCEL_COLUMNS.BATTING_STYLE_COLUMN
      //   ? row[EXCEL_COLUMNS.BATTING_STYLE_COLUMN]
      //   : undefined;
      // // const bowlingStyle = EXCEL_COLUMNS.BOWLING_STYLE_COLUMN
      // //   ? row[EXCEL_COLUMNS.BOWLING_STYLE_COLUMN]
      // //   : undefined;
      // const runs = EXCEL_COLUMNS.RUNS_COLUMN
      //   ? row[EXCEL_COLUMNS.RUNS_COLUMN]
      //   : undefined;
      // const wickets = EXCEL_COLUMNS.WICKETS_COLUMN
      //   ? row[EXCEL_COLUMNS.WICKETS_COLUMN]
      //   : undefined;
      // const strikeRate = EXCEL_COLUMNS.STRIKE_RATE_COLUMN
      //   ? row[EXCEL_COLUMNS.STRIKE_RATE_COLUMN]
      //   : undefined;
      // const bowlingAverage = EXCEL_COLUMNS.BOWLING_AVG_COLUMN
      //   ? row[EXCEL_COLUMNS.BOWLING_AVG_COLUMN]
      //   : undefined;
      const  = EXCEL_COLUMNS.CRICHEROES_LINK_COLUMN
        ? row[EXCEL_COLUMNS.CRICHEROES_LINK_COLUMN]
        : undefined;

      return {
        id: (index + 1).toString(),
        firstName,
        lastName,
        grade,
        basePrice: config.gradeBasePrices[grade] || 1000000,
        status: "unsold" as const,
        image: photo ? `/player_images/${photo}` : undefined,
        // Stats fields - will be undefined if columns don't exist or are empty
        battingStyle: battingStyle ? Number(battingStyle) : undefined,
        // bowlingStyle: bowlingStyle ? String(bowlingStyle) : undefined,
        runs: runs ? Number(runs) : undefined,
        wickets: wickets ? Number(wickets) : undefined,
        strikeRate: strikeRate ? Number(strikeRate) : undefined,
        bowlingAverage: bowlingAverage ? Number(bowlingAverage) : undefined,
        // cricherosLink: cricherosLink ? String(cricherosLink) : undefined,
      };
    });

    return players;
  } catch (error) {
    console.error("Error loading players from Excel:", error);
    return [];
  }
}
