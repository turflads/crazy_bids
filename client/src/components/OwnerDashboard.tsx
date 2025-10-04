import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Trophy, Users, Gavel } from "lucide-react";
import PlayerCard from "./PlayerCard";

interface TeamData {
  team: string;
  flag?: string;
  playersCount: number;
  purseUsed: number;
  purseRemaining: number;
  totalPurse: number;
  gradeCount: Record<string, number>;
  players: any[];
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
  const gradeColorMap: Record<string, string> = {
    A: 'bg-grade-a',
    B: 'bg-grade-b',
    C: 'bg-grade-c',
  };
  const gradeColor = currentPlayer ? (gradeColorMap[currentPlayer.grade] || 'bg-primary') : 'bg-primary';

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
                    Grade {currentPlayer.grade}
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
            <Card key={team.team} data-testid={`card-team-overview-${team.team}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {team.flag && <span className="text-2xl">{team.flag}</span>}
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
                <div className="flex gap-2">
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
    </div>
  );
}
