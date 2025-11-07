import { loadAuctionConfig } from './auctionConfig';

export interface TeamRequirements {
  totalPurse: number;
  usedPurse: number;
  gradeCount: Record<string, number>;
  quotas: Record<string, number>;
}

export interface PlayerData {
  id: string;
  status: 'unsold' | 'sold';
  basePrice: number;
  grade: string;
  [key: string]: any;
}

export async function calculateMaxBid(
  team: TeamRequirements,
  currentPlayerGrade: string,
  allPlayers: PlayerData[]
): Promise<number> {
  const config = await loadAuctionConfig();
  
  // Sum of base prices of all remaining unsold players
  const sumOfRemainingBasePrices = allPlayers
    .filter(player => player.status === 'unsold')
    .reduce((sum, player) => sum + player.basePrice, 0);
  
  // Max bid = Total Purse - Sum of remaining unsold base prices
  let maxBid = team.totalPurse - sumOfRemainingBasePrices;
  
  // Apply grade-specific max bid cap if configured
  // Formula: MIN(totalPurse - sumOfRemaining, gradeMaxBidCap)
  if (config.gradeMaxBidCaps && config.gradeMaxBidCaps[currentPlayerGrade]) {
    const gradeCap = config.gradeMaxBidCaps[currentPlayerGrade];
    maxBid = Math.min(maxBid, gradeCap);
  }
  
  return Math.max(0, maxBid);
}

export function calculateMaxBidSync(
  team: TeamRequirements,
  currentPlayerGrade: string,
  gradeBasePrices: Record<string, number>,
  gradeQuotas: Record<string, number>,
  gradeMaxBidCaps?: Record<string, number>,
  allPlayers?: PlayerData[]
): number {
  // If we have the full player roster, use the simple Excel formula approach
  if (allPlayers && allPlayers.length > 0) {
    // Sum of base prices of all remaining unsold players
    const sumOfRemainingBasePrices = allPlayers
      .filter(player => player.status === 'unsold')
      .reduce((sum, player) => sum + player.basePrice, 0);
    
    // Max bid = Total Purse - Sum of remaining unsold base prices
    let maxBid = team.totalPurse - sumOfRemainingBasePrices;
    
    // Apply grade-specific max bid cap if configured
    // Formula: MIN(totalPurse - sumOfRemaining, gradeMaxBidCap)
    if (gradeMaxBidCaps && gradeMaxBidCaps[currentPlayerGrade]) {
      const gradeCap = gradeMaxBidCaps[currentPlayerGrade];
      maxBid = Math.min(maxBid, gradeCap);
    }
    
    return Math.max(0, maxBid);
  }
  
  // Fallback: Old quota-based calculation (kept for backward compatibility)
  const remainingPurse = team.totalPurse - team.usedPurse;
  
  // Calculate remaining slots needed for each grade
  const remainingSlots: Record<string, number> = {};
  Object.keys(gradeQuotas).forEach(grade => {
    const required = gradeQuotas[grade] || 0;
    const current = team.gradeCount[grade] || 0;
    remainingSlots[grade] = Math.max(0, required - current);
  });
  
  // Calculate minimum amount needed to fill all remaining required slots
  let reserveForAllGrades = 0;
  Object.entries(remainingSlots).forEach(([grade, slotsNeeded]) => {
    if (slotsNeeded > 0) {
      const basePrice = gradeBasePrices[grade] || 1000000;
      if (grade === currentPlayerGrade) {
        reserveForAllGrades += basePrice * Math.max(0, slotsNeeded - 1);
      } else {
        reserveForAllGrades += basePrice * slotsNeeded;
      }
    }
  });
  
  let maxBid = remainingPurse - reserveForAllGrades;
  
  // Apply grade-specific max bid cap if configured
  if (gradeMaxBidCaps && gradeMaxBidCaps[currentPlayerGrade]) {
    const gradeCap = gradeMaxBidCaps[currentPlayerGrade];
    maxBid = Math.min(maxBid, gradeCap);
  }
  
  return Math.max(0, maxBid);
}
