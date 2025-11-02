import * as XLSX from "xlsx";
import { loadAuctionConfig } from "./auctionConfig";
import { resolvePlayerImage, type ImageSource } from "./playerImageResolver";

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
  PHONE_COLUMN: "phone", // Player phone number

  // Optional stat columns - THESE ARE CONFIGURED TO MATCH YOUR EXCEL FILE
  BATTING_STYLE_COLUMN: "Role", // Batting style
  // BOWLING_STYLE_COLUMN: 'Bowling -',     // Bowling style
  RUNS_COLUMN: "MZPL RUNS", // Total runs scored
  WICKETS_COLUMN: "MZPL WKTS", // Total wickets taken
  // STRIKE_RATE_COLUMN: 'SR',              // Strike rate
  // BOWLING_AVG_COLUMN: 'Economy',         // Bowling economy
  // CRICHEROES_LINK_COLUMN: 'Cricheroes Link', // CricHeroes profile URL
};

// ============================================================================
// END OF CONFIGURATION - DO NOT MODIFY CODE BELOW THIS LINE
// ============================================================================

// Fisher-Yates shuffle algorithm for randomizing array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Check if players are sorted by grade (all same grades are consecutive)
function isGradeSorted(players: PlayerData[]): boolean {
  const seenGrades = new Set<string>();
  let currentGrade = players[0]?.grade;
  
  for (const player of players) {
    if (player.grade !== currentGrade) {
      // Grade changed - check if we've seen this grade before
      if (seenGrades.has(player.grade)) {
        return false; // This grade appeared earlier, so not sorted
      }
      seenGrades.add(currentGrade);
      currentGrade = player.grade;
    }
  }
  
  return true;
}

// Shuffle players within their grade groups while maintaining grade order
function shuffleWithinGrades(players: PlayerData[]): PlayerData[] {
  // Group players by grade while preserving original order of grades
  const gradeOrder: string[] = [];
  const gradeGroups: { [grade: string]: PlayerData[] } = {};
  
  players.forEach(player => {
    if (!gradeGroups[player.grade]) {
      gradeGroups[player.grade] = [];
      gradeOrder.push(player.grade);
    }
    gradeGroups[player.grade].push(player);
  });
  
  // Shuffle each grade group independently
  Object.keys(gradeGroups).forEach(grade => {
    gradeGroups[grade] = shuffleArray(gradeGroups[grade]);
  });
  
  // Reconstruct array maintaining grade order but with shuffled players within each grade
  const result: PlayerData[] = [];
  gradeOrder.forEach(grade => {
    result.push(...gradeGroups[grade]);
  });
  
  return result;
}

export interface PlayerData {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  basePrice: number;
  status: "unsold" | "sold";
  image?: string; // Backward compatibility - use imageUrl instead
  imageOriginal?: string; // Original value from Excel (path or link)
  imageUrl?: string; // Resolved render-ready URL
  imageSource?: ImageSource; // Source type: local, gdrive, remote, unknown
  phoneNumber?: string; // Player phone number
  // Player statistics
  battingStyle?: string; // e.g., "Right-hand bat"
  // bowlingStyle?: string;  // e.g., "Right-arm medium"
  runs?: number; // Total runs scored
  wickets?: number; // Total wickets taken
  // strikeRate?: number;    // Batting strike rate
  // bowlingAverage?: number; // Bowling average
  // cricherosLink?: string; // Link to CricHeroes profile
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
      const phone = row[EXCEL_COLUMNS.PHONE_COLUMN] || "";

      // Read stats using configured column names (will be undefined if column is empty or doesn't exist)
      const battingStyle = EXCEL_COLUMNS.BATTING_STYLE_COLUMN
        ? row[EXCEL_COLUMNS.BATTING_STYLE_COLUMN]
        : undefined;
      // const bowlingStyle = EXCEL_COLUMNS.BOWLING_STYLE_COLUMN ? row[EXCEL_COLUMNS.BOWLING_STYLE_COLUMN] : undefined;
      const runs = EXCEL_COLUMNS.RUNS_COLUMN
        ? row[EXCEL_COLUMNS.RUNS_COLUMN]
        : undefined;
      const wickets = EXCEL_COLUMNS.WICKETS_COLUMN
        ? row[EXCEL_COLUMNS.WICKETS_COLUMN]
        : undefined;
      // const strikeRate = EXCEL_COLUMNS.STRIKE_RATE_COLUMN ? row[EXCEL_COLUMNS.STRIKE_RATE_COLUMN] : undefined;
      // const bowlingAverage = EXCEL_COLUMNS.BOWLING_AVG_COLUMN ? row[EXCEL_COLUMNS.BOWLING_AVG_COLUMN] : undefined;
      // const cricherosLink = EXCEL_COLUMNS.CRICHEROES_LINK_COLUMN ? row[EXCEL_COLUMNS.CRICHEROES_LINK_COLUMN] : undefined;

      // Resolve player image (supports local paths and Google Drive links)
      const resolvedImage = resolvePlayerImage(photo);

      // Log warning if Google Drive link couldn't be parsed
      if (resolvedImage.sourceKind === "gdrive" && !resolvedImage.resolvedUrl) {
        console.warn(
          `[Excel Import] Could not parse Google Drive link for player "${name}": ${photo}`,
        );
      }

      return {
        id: (index + 1).toString(),
        firstName,
        lastName,
        grade,
        basePrice: config.gradeBasePrices[grade] || 1000000,
        status: "unsold" as const,
        image: resolvedImage.resolvedUrl || undefined, // Backward compatibility
        imageOriginal: resolvedImage.originalValue || undefined,
        imageUrl: resolvedImage.resolvedUrl || undefined,
        imageSource: resolvedImage.sourceKind,
        phoneNumber: phone ? String(phone) : undefined,
        // Stats fields - will be undefined if columns don't exist or are empty
        battingStyle: battingStyle ? String(battingStyle) : undefined,
        // bowlingStyle: bowlingStyle ? String(bowlingStyle) : undefined,
        runs: runs ? Number(runs) : undefined,
        wickets: wickets ? Number(wickets) : undefined,
        // strikeRate: strikeRate ? Number(strikeRate) : undefined,
        // bowlingAverage: bowlingAverage ? Number(bowlingAverage) : undefined,
        // cricherosLink: cricherosLink ? String(cricherosLink) : undefined,
      };
    });

    // Smart randomization based on Excel organization:
    // - If grade-sorted: shuffle within each grade group only
    // - If not grade-sorted: shuffle all players together
    const isGradeOrganized = isGradeSorted(players);
    const shuffledPlayers = isGradeOrganized 
      ? shuffleWithinGrades(players)
      : shuffleArray(players);
    
    console.log(`[Excel Import] Players are ${isGradeOrganized ? 'grade-organized' : 'randomly organized'}`);
    console.log(`[Excel Import] Applying ${isGradeOrganized ? 'within-grade' : 'full'} randomization`);
    
    // Re-assign sequential IDs after shuffling
    return shuffledPlayers.map((player, index) => ({
      ...player,
      id: (index + 1).toString()
    }));
  } catch (error) {
    console.error("Error loading players from Excel:", error);
    return [];
  }
}
