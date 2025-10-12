import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trophy, TrendingUp, Users } from "lucide-react";
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
}

interface ViewerDashboardProps {
  currentAuction?: {
    player: any;
    currentBid: number;
    leadingTeam: string;
  };
  recentSales: any[];
  teamStandings: TeamData[];
}

export default function ViewerDashboard({
  currentAuction,
  recentSales,
  teamStandings,
}: ViewerDashboardProps) {
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null);

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
                  className="p-3 bg-muted rounded-lg cursor-pointer hover-elevate active-elevate-2"
                  data-testid={`card-team-${team.team}`}
                  onClick={() => setSelectedTeam(team)}
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

      <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="dialog-team-players">
          {selectedTeam && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-2xl">
                  {selectedTeam.logo && <img src={selectedTeam.logo} alt={selectedTeam.team} className="w-12 h-12 object-contain" />}
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
