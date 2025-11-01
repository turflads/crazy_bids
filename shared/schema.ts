import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Auction state table - stores the current auction state
export const auctionState = pgTable("auction_state", {
  id: integer("id").primaryKey().default(1), // Always use ID=1 for singleton
  currentPlayerIndex: integer("current_player_index").notNull().default(0),
  currentBid: integer("current_bid").notNull().default(0),
  isAuctionActive: integer("is_auction_active").notNull().default(0), // 0=false, 1=true
  players: jsonb("players").notNull().default([]),
  bidHistory: jsonb("bid_history").notNull().default([]),
  hasBids: integer("has_bids").notNull().default(0), // 0=false, 1=true
  lastBidTeam: text("last_bid_team").default(''),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Team state table - stores all team data
export const teamState = pgTable("team_state", {
  id: integer("id").primaryKey().default(1), // Always use ID=1 for singleton
  teams: jsonb("teams").notNull().default({}), // Object with team names as keys
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAuctionStateSchema = createInsertSchema(auctionState);
export const insertTeamStateSchema = createInsertSchema(teamState);

export type InsertAuctionState = z.infer<typeof insertAuctionStateSchema>;
export type AuctionState = typeof auctionState.$inferSelect;
export type InsertTeamState = z.infer<typeof insertTeamStateSchema>;
export type TeamState = typeof teamState.$inferSelect;
