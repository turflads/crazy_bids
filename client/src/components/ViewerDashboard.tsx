import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PlayerCard from "./PlayerCard";
import TeamLogo from "./TeamLogo";
import ViewerChat from "./ViewerChat";
import { Trophy, TrendingUp, Users } from "lucide-react";

interface TeamData {
  team: string;
  flag?: string;
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
  allPlayers: any[];
  teamStandings: TeamData[];
  username: string;
}

export default function ViewerDashboard({
  currentAuction,
  recentSales,
  allPlayers,
  teamStandings,
  username,
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
                <PlayerCard player={currentAuction.player} animate={true} />
              </div>
              <div className="space-y-4">
                <div className="p-4 sm:p-6 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2 text-center">Current Bid</p>
                  <p className="text-3xl sm:text-4xl font-bold font-mono text-primary break-all text-center" data-testid="text-viewer-current-bid">
                    ₹{currentAuction.currentBid.toLocaleString()}
                  </p>
                  {currentAuction.leadingTeam && (
                    <div className="mt-4 pt-4 border-t border-primary/20 flex items-center justify-center gap-3">
                      <TeamLogo 
                        logo={teamStandings.find(t => t.team === currentAuction.leadingTeam)?.logo}
                        flag={teamStandings.find(t => t.team === currentAuction.leadingTeam)?.flag}
                        name={currentAuction.leadingTeam}
                        className="w-8 h-8 flex-shrink-0"
                      />
                      <p className="text-sm font-semibold text-muted-foreground" data-testid="text-leading-team">
                        {currentAuction.leadingTeam}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Sales & Team Standings */}
        <div className="lg:col-span-2 space-y-6">
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
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <TeamLogo 
                          logo={team.logo} 
                          flag={team.flag} 
                          name={team.team}
                          className="w-8 h-8 flex-shrink-0"
                        />
                        <p className="font-semibold truncate">{team.team}</p>
                      </div>
                      <Badge variant="outline" className="flex-shrink-0 text-xs">{team.playersCount} <span className="hidden sm:inline">Players</span></Badge>
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

        {/* Right Column - Live Chat */}
        <div className="lg:col-span-1">
          <ViewerChat username={username} />
        </div>
      </div>

      <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="dialog-team-players-viewer">
          {selectedTeam && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl">
                  <TeamLogo 
                    logo={selectedTeam.logo} 
                    flag={selectedTeam.flag} 
                    name={selectedTeam.team}
                    className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0"
                  />
                  <span className="truncate">{selectedTeam.team} - Players</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Players</p>
                    <p className="text-xl sm:text-2xl font-bold">{selectedTeam.playersCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Purse Used</p>
                    <p className="text-xl sm:text-2xl font-bold font-mono text-destructive break-all">
                      ₹{selectedTeam.purseUsed.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Purse Remaining</p>
                    <p className="text-xl sm:text-2xl font-bold font-mono text-auction-sold break-all">
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
