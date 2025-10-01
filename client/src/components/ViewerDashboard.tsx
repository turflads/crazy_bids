import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlayerCard from "./PlayerCard";
import { Trophy, TrendingUp } from "lucide-react";

interface ViewerDashboardProps {
  currentAuction?: {
    player: any;
    currentBid: number;
    leadingTeam: string;
  };
  recentSales: any[];
  allPlayers: any[];
  teamStandings: {
    team: string;
    playersCount: number;
    purseUsed: number;
    purseRemaining: number;
  }[];
}

export default function ViewerDashboard({
  currentAuction,
  recentSales,
  allPlayers,
  teamStandings,
}: ViewerDashboardProps) {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Auction Viewer</h2>

      {currentAuction && (
        <Card className="border-auction-live">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-auction-live text-white animate-pulse">
                LIVE AUCTION
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="max-w-sm mx-auto w-full">
                <PlayerCard player={currentAuction.player} />
              </div>
              <div className="space-y-4">
                <div className="p-6 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Current Bid</p>
                  <p className="text-4xl font-bold font-mono text-primary" data-testid="text-viewer-current-bid">
                    ₹{currentAuction.currentBid.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Leading Team</p>
                  <p className="text-xl font-semibold" data-testid="text-leading-team">
                    {currentAuction.leadingTeam}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg hover-elevate"
                  data-testid={`card-recent-sale-${sale.id}`}
                >
                  <div>
                    <p className="font-semibold">
                      {sale.firstName} {sale.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{sale.team}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold text-auction-sold">
                      ₹{sale.soldPrice?.toLocaleString()}
                    </p>
                    <Badge className="bg-grade-a text-white mt-1">Grade {sale.grade}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Team Standings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamStandings.map((team) => (
                <div
                  key={team.team}
                  className="p-3 bg-muted rounded-lg"
                  data-testid={`card-team-${team.team}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">{team.team}</p>
                    <Badge variant="outline">{team.playersCount} Players</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Purse Used</p>
                      <p className="font-mono">₹{team.purseUsed.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Remaining</p>
                      <p className="font-mono text-auction-sold">
                        ₹{team.purseRemaining.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all-players-viewer">
            All Players ({allPlayers.length})
          </TabsTrigger>
          <TabsTrigger value="sold" data-testid="tab-sold-viewer">
            Sold ({allPlayers.filter(p => p.status === 'sold').length})
          </TabsTrigger>
          <TabsTrigger value="unsold" data-testid="tab-unsold-viewer">
            Unsold ({allPlayers.filter(p => p.status === 'unsold').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {allPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sold" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {allPlayers
              .filter(p => p.status === 'sold')
              .map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="unsold" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {allPlayers
              .filter(p => p.status === 'unsold')
              .map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
