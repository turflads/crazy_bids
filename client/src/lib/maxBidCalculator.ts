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
    const unsoldPlayers = allPlayers.filter(player => player.status === 'unsold');
    const sumOfRemainingBasePrices = unsoldPlayers
      .reduce((sum, player) => sum + player.basePrice, 0);
    
    console.log('[MAX BID DEBUG] Total Players:', allPlayers.length);
    console.log('[MAX BID DEBUG] Unsold Players:', unsoldPlayers.length);
    console.log('[MAX BID DEBUG] Sum of Remaining Base Prices:', sumOfRemainingBasePrices);
    console.log('[MAX BID DEBUG] Team Total Purse:', team.totalPurse);
    console.log('[MAX BID DEBUG] Team Used Purse:', team.usedPurse);
    
    // Max bid = Total Purse - Sum of remaining unsold base prices
    let maxBid = team.totalPurse - sumOfRemainingBasePrices;
    
    console.log('[MAX BID DEBUG] Calculated Max Bid (before cap):', maxBid);
    
    // Apply grade-specific max bid cap if configured
    // Formula: MIN(totalPurse - sumOfRemaining, gradeMaxBidCap)
    if (gradeMaxBidCaps && gradeMaxBidCaps[currentPlayerGrade]) {
      const gradeCap = gradeMaxBidCaps[currentPlayerGrade];
      console.log('[MAX BID DEBUG] Grade Cap for', currentPlayerGrade, ':', gradeCap);
      maxBid = Math.min(maxBid, gradeCap);
      console.log('[MAX BID DEBUG] Final Max Bid (after cap):', maxBid);
    }
    
    return Math.max(0, maxBid);
  }
  
  // Fallback: Old quota-based calculation (kept for backward compatibility)
  console.log('[MAX BID FALLBACK] Using quota-based calculation (no players array)');
  const remainingPurse = team.totalPurse - team.usedPurse;
  console.log('[MAX BID FALLBACK] Remaining Purse:', remainingPurse);
  
  // Calculate remaining slots needed for each grade
  const remainingSlots: Record<string, number> = {};
  Object.keys(gradeQuotas).forEach(grade => {
    const required = gradeQuotas[grade] || 0;
    const current = team.gradeCount[grade] || 0;
    remainingSlots[grade] = Math.max(0, required - current);
  });
  
  console.log('[MAX BID FALLBACK] Remaining Slots:', remainingSlots);
  
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
  
  console.log('[MAX BID FALLBACK] Reserve for All Grades:', reserveForAllGrades);
  
  let maxBid = remainingPurse - reserveForAllGrades;
  console.log('[MAX BID FALLBACK] Calculated Max Bid (before cap):', maxBid);
  
  // Apply grade-specific max bid cap if configured
  if (gradeMaxBidCaps && gradeMaxBidCaps[currentPlayerGrade]) {
    const gradeCap = gradeMaxBidCaps[currentPlayerGrade];
    maxBid = Math.min(maxBid, gradeCap);
  }
  
  return Math.max(0, maxBid);
}
