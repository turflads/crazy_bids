import { loadAuctionConfig } from './auctionConfig';

export interface TeamRequirements {
  totalPurse: number;
  usedPurse: number;
  gradeCount: Record<string, number>;
  quotas: Record<string, number>;
}

export async function calculateMaxBid(
  team: TeamRequirements,
  currentPlayerGrade: string
): Promise<number> {
  const config = await loadAuctionConfig();
  const remainingPurse = team.totalPurse - team.usedPurse;
  
  // Calculate remaining slots needed for each grade
  // Use config.gradeQuotas as the source of truth, subtract what team already has
  const remainingSlots: Record<string, number> = {};
  Object.keys(config.gradeQuotas).forEach(grade => {
    const required = config.gradeQuotas[grade] || 0;
    const current = team.gradeCount[grade] || 0;
    remainingSlots[grade] = Math.max(0, required - current);
  });
  
  // Calculate minimum amount needed to fill all remaining required slots
  // For the current grade, we need to reserve for (remainingSlots - 1) since one slot is being filled by the current bid
  let reserveForAllGrades = 0;
  Object.entries(remainingSlots).forEach(([grade, slotsNeeded]) => {
    if (slotsNeeded > 0) {
      const basePrice = config.gradeBasePrices[grade] || 1000000;
      if (grade === currentPlayerGrade) {
        // Reserve for remaining slots after this one (slotsNeeded - 1)
        reserveForAllGrades += basePrice * Math.max(0, slotsNeeded - 1);
      } else {
        // Reserve for all remaining slots of other grades
        reserveForAllGrades += basePrice * slotsNeeded;
      }
    }
  });
  
  // Max bid is remaining purse minus the reserve for all other required slots
  let maxBid = remainingPurse - reserveForAllGrades;
  
  // Apply grade-specific max bid cap if configured
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
  gradeMaxBidCaps?: Record<string, number>
): number {
  const remainingPurse = team.totalPurse - team.usedPurse;
  
  // Calculate remaining slots needed for each grade
  // Use gradeQuotas as the source of truth, subtract what team already has
  const remainingSlots: Record<string, number> = {};
  Object.keys(gradeQuotas).forEach(grade => {
    const required = gradeQuotas[grade] || 0;
    const current = team.gradeCount[grade] || 0;
    remainingSlots[grade] = Math.max(0, required - current);
  });
  
  // Calculate minimum amount needed to fill all remaining required slots
  // For the current grade, we need to reserve for (remainingSlots - 1) since one slot is being filled by the current bid
  let reserveForAllGrades = 0;
  Object.entries(remainingSlots).forEach(([grade, slotsNeeded]) => {
    if (slotsNeeded > 0) {
      const basePrice = gradeBasePrices[grade] || 1000000;
      if (grade === currentPlayerGrade) {
        // Reserve for remaining slots after this one (slotsNeeded - 1)
        reserveForAllGrades += basePrice * Math.max(0, slotsNeeded - 1);
      } else {
        // Reserve for all remaining slots of other grades
        reserveForAllGrades += basePrice * slotsNeeded;
      }
    }
  });
  
  // Max bid is remaining purse minus the reserve for all other required slots
  let maxBid = remainingPurse - reserveForAllGrades;
  
  // Apply grade-specific max bid cap if configured
  if (gradeMaxBidCaps && gradeMaxBidCaps[currentPlayerGrade]) {
    const gradeCap = gradeMaxBidCaps[currentPlayerGrade];
    maxBid = Math.min(maxBid, gradeCap);
  }
  
  return Math.max(0, maxBid);
}
