import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Trophy, Users, Gavel } from "lucide-react";
import PlayerCard from "./PlayerCard";

interface TeamData {
  team: string;
  logo?: string;
  playersCount: number;
  purseUsed: number;
  purseRemaining: number;
  totalPurse: number;
  gradeCount: Record<string, number>;
  players: any[];
  maxBid?: number;
}

interface OwnerDashboardProps {
  allPlayers: any[];
  soldPlayers: any[];
  unsoldPlayers: any[];
  allTeamsData: TeamData[];
  currentPlayer?: any;
  currentBid?: number;
  isAuctionActive?: boolean;
}

export default function OwnerDashboard({
  allPlayers,
  soldPlayers,
  unsoldPlayers,
  allTeamsData,
  currentPlayer,
  currentBid,
  isAuctionActive,
}: OwnerDashboardProps) {
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null);

  // Extract grade letter for color mapping (handles both "A" and "GOLD - C" formats)
  const getGradeColor = (grade: string) => {
    const gradeLetter = grade.trim().toUpperCase().slice(-1);
    const colorMap: Record<string, string> = {
      A: 'bg-grade-a',
      B: 'bg-grade-b',
      C: 'bg-grade-c',
    };
    return colorMap[gradeLetter] || 'bg-primary';
  };
  const gradeColor = currentPlayer ? getGradeColor(currentPlayer.grade) : 'bg-primary';

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-6">Auction Overview - All Teams</h2>
      </div>

      {currentPlayer && isAuctionActive && (
        <Card className="border-primary/50 bg-primary/5" data-testid="card-current-auction">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Gavel className="w-5 h-5 text-primary" />
              Current Auction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className={`${gradeColor} text-white`}>
                    {currentPlayer.grade}
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold" data-testid="text-current-player-name">
                  {currentPlayer.firstName} {currentPlayer.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Base Price: ₹{currentPlayer.basePrice?.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Current Bid</p>
                <p className="text-3xl font-bold font-mono text-primary" data-testid="text-current-bid">
                  ₹{currentBid?.toLocaleString()}
                </p>
                {currentPlayer.lastBidTeam && (
                  <p className="text-sm text-muted-foreground mt-1">
                    by {currentPlayer.lastBidTeam}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Teams Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {allTeamsData.map((team) => (
            <Card 
              key={team.team} 
              data-testid={`card-team-overview-${team.team}`}
              className="cursor-pointer hover-elevate active-elevate-2"
              onClick={() => setSelectedTeam(team)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {team.logo && <img src={team.logo} alt={team.team} className="w-8 h-8 max-w-[2rem] object-contain" />}
                    <span className="text-sm">{team.team}</span>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <Users className="w-3 h-3" />
                    {team.playersCount}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Purse Status</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Used:</span>
                      <span className="font-mono font-semibold text-destructive">
                        ₹{team.purseUsed.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Left:</span>
                      <span className="font-mono font-semibold text-auction-sold">
                        ₹{team.purseRemaining.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                {team.maxBid !== undefined && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Max Bid</p>
                    <p className="font-mono font-bold text-primary" data-testid={`text-max-bid-${team.team.toLowerCase().replace(/\s+/g, '-')}`}>
                      ₹{team.maxBid.toLocaleString()}
                    </p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-grade-a text-white text-xs">
                    A: {team.gradeCount.A || 0}
                  </Badge>
                  <Badge className="bg-grade-b text-white text-xs">
                    B: {team.gradeCount.B || 0}
                  </Badge>
                  <Badge className="bg-grade-c text-white text-xs">
                    C: {team.gradeCount.C || 0}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="all" data-testid="tab-all-players">
            All Players ({allPlayers.length})
          </TabsTrigger>
          <TabsTrigger value="sold" data-testid="tab-sold">
            Sold ({soldPlayers.length})
          </TabsTrigger>
          <TabsTrigger value="unsold" data-testid="tab-unsold">
            Unsold ({unsoldPlayers.length})
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search players..."
              className="pl-10"
              data-testid="input-search-players"
            />
          </div>

          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {allPlayers.map((player: any) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sold" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {soldPlayers.map((player: any) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="unsold" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {unsoldPlayers.map((player: any) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="dialog-team-players">
          {selectedTeam && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-2xl">
                  {selectedTeam.logo && <img src={selectedTeam.logo} alt={selectedTeam.team} className="w-10 h-10 max-w-[2.5rem] object-contain" />}
                  <span>{selectedTeam.team} - Players</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Players</p>
                    <p className="text-2xl font-bold">{selectedTeam.playersCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Purse Used</p>
                    <p className="text-2xl font-bold font-mono text-destructive">
                      ₹{selectedTeam.purseUsed.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Purse Remaining</p>
                    <p className="text-2xl font-bold font-mono text-auction-sold">
                      ₹{selectedTeam.purseRemaining.toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedTeam.players.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedTeam.players.map((player: any) => (
                      <PlayerCard key={player.id} player={player} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-lg text-muted-foreground">No players purchased yet</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
