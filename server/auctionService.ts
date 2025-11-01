// Service layer for auction and team state database operations
import { db } from "./db";
import { auctionState, teamState } from "@shared/schema";
import { eq } from "drizzle-orm";

// Auction State Operations
export async function getAuctionStateFromDB() {
  const [state] = await db.select().from(auctionState).where(eq(auctionState.id, 1));
  
  if (!state) {
    // Return default state if no record exists
    return {
      currentPlayerIndex: 0,
      currentBid: 0,
      isAuctionActive: false,
      players: [],
      bidHistory: [],
      hasBids: false,
      lastBidTeam: '',
    };
  }
  
  // Convert integer booleans to actual booleans
  return {
    currentPlayerIndex: state.currentPlayerIndex,
    currentBid: state.currentBid,
    isAuctionActive: state.isAuctionActive === 1,
    players: state.players as any[],
    bidHistory: state.bidHistory as any[],
    hasBids: state.hasBids === 1,
    lastBidTeam: state.lastBidTeam || '',
  };
}

export async function saveAuctionStateToDB(state: {
  currentPlayerIndex: number;
  currentBid: number;
  isAuctionActive: boolean;
  players: any[];
  bidHistory: any[];
  hasBids: boolean;
  lastBidTeam?: string;
}) {
  const dbState = {
    id: 1,
    currentPlayerIndex: state.currentPlayerIndex,
    currentBid: state.currentBid,
    isAuctionActive: state.isAuctionActive ? 1 : 0,
    players: state.players,
    bidHistory: state.bidHistory,
    hasBids: state.hasBids ? 1 : 0,
    lastBidTeam: state.lastBidTeam || '',
    updatedAt: new Date(),
  };
  
  // Upsert: insert or update if exists
  await db
    .insert(auctionState)
    .values(dbState)
    .onConflictDoUpdate({
      target: auctionState.id,
      set: dbState,
    });
  
  return dbState;
}

// Team State Operations
export async function getTeamStateFromDB() {
  const [state] = await db.select().from(teamState).where(eq(teamState.id, 1));
  
  if (!state) {
    return {};
  }
  
  return state.teams as Record<string, any>;
}

export async function saveTeamStateToDB(teams: Record<string, any>) {
  const dbState = {
    id: 1,
    teams: teams,
    updatedAt: new Date(),
  };
  
  // Upsert: insert or update if exists
  await db
    .insert(teamState)
    .values(dbState)
    .onConflictDoUpdate({
      target: teamState.id,
      set: dbState,
    });
  
  return dbState;
}

// Clear all auction data (for reset)
export async function clearAuctionDataFromDB() {
  await db.delete(auctionState).where(eq(auctionState.id, 1));
  await db.delete(teamState).where(eq(teamState.id, 1));
}
