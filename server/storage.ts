import { type User, type InsertUser, type Player, type InsertPlayer, type Team, type InsertTeam } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Players
  getAllPlayers(): Promise<Player[]>;
  getPlayer(id: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: string, player: Partial<Player>): Promise<Player | undefined>;
  deletePlayers(): Promise<void>;
  bulkCreatePlayers(players: InsertPlayer[]): Promise<Player[]>;
  
  // Teams
  getAllTeams(): Promise<Team[]>;
  getTeam(id: string): Promise<Team | undefined>;
  getTeamByName(name: string): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: string, team: Partial<Team>): Promise<Team | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private players: Map<string, Player>;
  private teams: Map<string, Team>;

  constructor() {
    this.users = new Map();
    this.players = new Map();
    this.teams = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllPlayers(): Promise<Player[]> {
    return Array.from(this.players.values());
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = randomUUID();
    const player: Player = { 
      id,
      firstName: insertPlayer.firstName,
      lastName: insertPlayer.lastName,
      grade: insertPlayer.grade,
      basePrice: insertPlayer.basePrice ?? 0,
      status: insertPlayer.status ?? 'unsold',
      soldPrice: insertPlayer.soldPrice ?? null,
      lastBidTeam: insertPlayer.lastBidTeam ?? null,
      lastBidAmount: insertPlayer.lastBidAmount ?? null,
      team: insertPlayer.team ?? null,
      imagePath: insertPlayer.imagePath ?? null,
      cricheroesLink: insertPlayer.cricheroesLink ?? null,
    };
    this.players.set(id, player);
    return player;
  }

  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player | undefined> {
    const player = this.players.get(id);
    if (!player) return undefined;
    
    const updatedPlayer = { ...player, ...updates };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }

  async deletePlayers(): Promise<void> {
    this.players.clear();
  }

  async bulkCreatePlayers(insertPlayers: InsertPlayer[]): Promise<Player[]> {
    const created: Player[] = [];
    for (const insertPlayer of insertPlayers) {
      const player = await this.createPlayer(insertPlayer);
      created.push(player);
    }
    return created;
  }

  async getAllTeams(): Promise<Team[]> {
    return Array.from(this.teams.values());
  }

  async getTeam(id: string): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async getTeamByName(name: string): Promise<Team | undefined> {
    return Array.from(this.teams.values()).find(
      (team) => team.name === name,
    );
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = randomUUID();
    const team: Team = { 
      id,
      name: insertTeam.name,
      flag: insertTeam.flag ?? null,
      totalPurse: insertTeam.totalPurse ?? 100000000,
      usedPurse: insertTeam.usedPurse ?? 0,
    };
    this.teams.set(id, team);
    return team;
  }

  async updateTeam(id: string, updates: Partial<Team>): Promise<Team | undefined> {
    const team = this.teams.get(id);
    if (!team) return undefined;
    
    const updatedTeam = { ...team, ...updates };
    this.teams.set(id, updatedTeam);
    return updatedTeam;
  }
}

export const storage = new MemStorage();
