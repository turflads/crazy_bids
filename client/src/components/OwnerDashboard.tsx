import { useState, useEffect } from "react";
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
import { Search, Trophy, Users, Gavel, User } from "lucide-react";
import PlayerCard from "./PlayerCard";
import TeamLogo from "./TeamLogo";

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
  gradeQuotas?: Record<string, number>;
}

export default function OwnerDashboard({
  allPlayers,
  soldPlayers,
  unsoldPlayers,
  allTeamsData,
  currentPlayer,
  currentBid,
  isAuctionActive,
  gradeQuotas = { A: 3, B: 4, C: 5 },
}: OwnerDashboardProps) {
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [prevPlayerId, setPrevPlayerId] = useState(currentPlayer?.id);
  const [prevSoldStatus, setPrevSoldStatus] = useState(currentPlayer?.status === 'sold');

  const gradeColorMap: Record<string, string> = {
    A: 'bg-grade-a',
    B: 'bg-grade-b',
    C: 'bg-grade-c',
  };
  const gradeColor = currentPlayer ? (gradeColorMap[currentPlayer.grade] || 'bg-primary') : 'bg-primary';

  // Detect when a NEW player appears and trigger reveal animation
  useEffect(() => {
    if (currentPlayer && currentPlayer.id !== prevPlayerId) {
      setIsRevealing(true);
      setTimeout(() => setIsRevealing(false), 600);
      setPrevPlayerId(currentPlayer.id);
      setPrevSoldStatus(false); // Reset sold status for new player
    }
  }, [currentPlayer?.id, prevPlayerId]);

  // Detect when player becomes sold and trigger flip animation
  useEffect(() => {
    const isSold = currentPlayer?.status === 'sold' || !!currentPlayer?.soldPrice;
    if (currentPlayer && !prevSoldStatus && isSold) {
      setIsFlipping(true);
      setTimeout(() => setIsFlipping(false), 600);
    }
    setPrevSoldStatus(isSold);
  }, [currentPlayer?.status, currentPlayer?.soldPrice, prevSoldStatus, currentPlayer]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-6">Auction Overview - All Teams</h2>
      </div>

      {currentPlayer && isAuctionActive && (
        <Card 
          className={`border-primary/50 bg-primary/5 ${isRevealing ? 'player-card-reveal' : ''} ${isFlipping ? 'player-card-flip' : ''}`}
          data-testid="card-current-auction"
        >
          <style>{`
            @keyframes revealPlayer {
              from {
                opacity: 0;
                transform: translateY(30px) scale(0.9);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
            
            @keyframes flipCard {
              0% {
                transform: rotateY(0deg);
              }
              50% {
                transform: rotateY(180deg);
              }
              100% {
                transform: rotateY(360deg);
              }
            }
            
            .player-card-reveal {
              animation: revealPlayer 0.6s ease-out;
              transform-style: preserve-3d;
            }
            
            .player-card-flip {
              animation: flipCard 0.6s ease-in-out;
              transform-style: preserve-3d;
            }
          `}</style>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Gavel className="w-5 h-5 text-primary" />
              Current Auction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              {/* Player Image */}
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted relative">
                  {currentPlayer.image ? (
                    <img 
                      src={currentPlayer.image} 
                      alt={`${currentPlayer.firstName} ${currentPlayer.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <Badge className={`absolute top-2 right-2 ${gradeColor} text-white`}>
                    Grade {currentPlayer.grade}
                  </Badge>
                </div>
              </div>

              {/* Player Info and Stats */}
              <div className="flex-1 space-y-3 min-w-0">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold break-words" data-testid="text-current-player-name">
                    {currentPlayer.firstName} {currentPlayer.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Base Price: ₹{currentPlayer.basePrice?.toLocaleString()}
                  </p>
                </div>

                {/* Player Statistics */}
                {(currentPlayer.battingStyle || currentPlayer.bowlingStyle || currentPlayer.runs !== undefined || currentPlayer.wickets !== undefined) && (
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground">Player Stats</p>
                    
                    {/* Batting/Bowling Styles */}
                    {(currentPlayer.battingStyle || currentPlayer.bowlingStyle) && (
                      <div className="flex gap-4">
                        {currentPlayer.battingStyle && (
                          <p className="text-xs" data-testid="text-batting-current">
                            <span className="text-muted-foreground">Bat:</span>{' '}
                            <span className="font-medium">{currentPlayer.battingStyle}</span>
                          </p>
                        )}
                        {currentPlayer.bowlingStyle && (
                          <p className="text-xs" data-testid="text-bowling-current">
                            <span className="text-muted-foreground">Bowl:</span>{' '}
                            <span className="font-medium">{currentPlayer.bowlingStyle}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Performance Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {currentPlayer.runs !== undefined && (
                        <div className="bg-muted/50 rounded p-2">
                          <p className="text-xs text-muted-foreground">Runs</p>
                          <p className="font-mono font-semibold text-sm" data-testid="text-runs-current">
                            {currentPlayer.runs.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {currentPlayer.wickets !== undefined && (
                        <div className="bg-muted/50 rounded p-2">
                          <p className="text-xs text-muted-foreground">Wickets</p>
                          <p className="font-mono font-semibold text-sm" data-testid="text-wickets-current">
                            {currentPlayer.wickets}
                          </p>
                        </div>
                      )}
                      {currentPlayer.strikeRate !== undefined && (
                        <div className="bg-muted/50 rounded p-2">
                          <p className="text-xs text-muted-foreground">S/R</p>
                          <p className="font-mono font-semibold text-sm" data-testid="text-sr-current">
                            {currentPlayer.strikeRate.toFixed(1)}
                          </p>
                        </div>
                      )}
                      {currentPlayer.bowlingAverage !== undefined && (
                        <div className="bg-muted/50 rounded p-2">
                          <p className="text-xs text-muted-foreground">Economy</p>
                          <p className="font-mono font-semibold text-sm" data-testid="text-economy-current">
                            {currentPlayer.bowlingAverage.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Current Bid Info */}
              <div className="text-center sm:text-right flex-shrink-0">
                <p className="text-sm text-muted-foreground mb-1">Current Bid</p>
                <p className="text-2xl sm:text-3xl font-bold font-mono text-primary break-all" data-testid="text-current-bid">
                  ₹{currentBid?.toLocaleString()}
                </p>
                {currentPlayer.lastBidTeam && (
                  <div className="flex items-center justify-center sm:justify-end gap-2 mt-2">
                    <TeamLogo 
                      logo={allTeamsData.find(t => t.team === currentPlayer.lastBidTeam)?.logo}
                      flag={allTeamsData.find(t => t.team === currentPlayer.lastBidTeam)?.flag}
                      name={currentPlayer.lastBidTeam}
                      className="w-6 h-6 flex-shrink-0"
                    />
                    <p className="text-sm text-muted-foreground truncate" data-testid="text-last-bid-team">
                      {currentPlayer.lastBidTeam}
                    </p>
                  </div>
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
                <CardTitle className="text-base flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <TeamLogo 
                      logo={team.logo} 
                      flag={team.flag} 
                      name={team.team}
                      className="w-8 h-8 flex-shrink-0"
                    />
                    <span className="text-sm truncate">{team.team}</span>
                  </div>
                  <Badge variant="outline" className="gap-1 flex-shrink-0">
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
                    A: {team.gradeCount.A || 0}/{gradeQuotas.A || 3}
                  </Badge>
                  <Badge className="bg-grade-b text-white text-xs">
                    B: {team.gradeCount.B || 0}/{gradeQuotas.B || 4}
                  </Badge>
                  <Badge className="bg-grade-c text-white text-xs">
                    C: {team.gradeCount.C || 0}/{gradeQuotas.C || 5}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl">
          <TabsTrigger value="all" data-testid="tab-all-players" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">All Players</span>
            <span className="sm:hidden">All</span> ({allPlayers.length})
          </TabsTrigger>
          <TabsTrigger value="sold" data-testid="tab-sold" className="text-xs sm:text-sm">
            Sold ({soldPlayers.length})
          </TabsTrigger>
          <TabsTrigger value="unsold" data-testid="tab-unsold" className="text-xs sm:text-sm">
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
                <PlayerCard key={player.id} player={player} showStats={false} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sold" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {soldPlayers.map((player: any) => (
                <PlayerCard key={player.id} player={player} showStats={false} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="unsold" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {unsoldPlayers.map((player: any) => (
                <PlayerCard key={player.id} player={player} showStats={false} />
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
                  <TeamLogo 
                    logo={selectedTeam.logo} 
                    flag={selectedTeam.flag} 
                    name={selectedTeam.team}
                    className="w-10 h-10"
                  />
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
                      <PlayerCard key={player.id} player={player} showStats={false} />
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
