import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean } from "drizzle-orm/pg-core";
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

export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  grade: text("grade").notNull(),
  basePrice: integer("base_price").notNull().default(0),
  imagePath: text("image_path"),
  cricheroesLink: text("cricheroes_link"),
  status: text("status").notNull().default('unsold'),
  team: text("team"),
  soldPrice: integer("sold_price"),
  lastBidTeam: text("last_bid_team"),
  lastBidAmount: integer("last_bid_amount"),
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
});

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  flag: text("flag"),
  totalPurse: integer("total_purse").notNull().default(100000000),
  usedPurse: integer("used_purse").notNull().default(0),
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
});

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;
