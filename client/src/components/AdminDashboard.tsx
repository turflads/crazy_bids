import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Play, Pause, RotateCcw, Users } from "lucide-react";
import AuctionControls from "./AuctionControls";
import PlayerCard from "./PlayerCard";
import TeamOverviewCard from "./TeamOverviewCard";
import TeamLogo from "./TeamLogo";

interface Team {
  name: string;
  flag?: string;
  logo?: string;
}

interface TeamData {
  name: string;
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

interface AdminDashboardProps {
  players: any[];
  currentPlayerIndex: number;
  currentBid: number;
  teams: Team[];
  gradeIncrements: Record<string, number>;
  gradeQuotas: Record<string, number>;
  gradeBasePrices: Record<string, number>;
  isAuctionActive: boolean;
  hasBids: boolean;
  teamData: TeamData[];
  onNextPlayer: () => void;
  onPrevPlayer: () => void;
  onStartAuction: () => void;
  onPauseAuction: () => void;
  onBid: (team: string, amount: number) => void;
  onSold: () => void;
  onUnsold: () => void;
  onCancelBid: () => void;
  onResetAuction: () => void;
}

export default function AdminDashboard({
  players,
  currentPlayerIndex,
  currentBid,
  teams,
  gradeIncrements,
  gradeQuotas,
  gradeBasePrices,
  isAuctionActive,
  hasBids,
  teamData,
  onNextPlayer,
  onPrevPlayer,
  onStartAuction,
  onPauseAuction,
  onBid,
  onSold,
  onUnsold,
  onCancelBid,
  onResetAuction,
}: AdminDashboardProps) {
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null);
  const currentPlayer = players[currentPlayerIndex];

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-2xl font-bold">Auction Control Panel</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Player {currentPlayerIndex + 1} of {players.length}
            </span>
            <Button onClick={onResetAuction} variant="outline" data-testid="button-reset-auction">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            {isAuctionActive ? (
              <Button onClick={onPauseAuction} variant="outline" data-testid="button-pause-auction">
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            ) : (
              <Button onClick={onStartAuction} data-testid="button-start-auction">
                <Play className="w-4 h-4 mr-2" />
                Start
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            {currentPlayer && (
              <div className="max-w-md mx-auto">
                <PlayerCard player={currentPlayer} />
              </div>
            )}
            <AuctionControls
              currentPlayer={currentPlayer}
              currentBid={currentBid}
              gradeIncrements={gradeIncrements}
              teams={teams}
              isAuctionActive={isAuctionActive}
              hasBids={hasBids}
              onBid={onBid}
              onSold={onSold}
              onUnsold={onUnsold}
              onCancelBid={onCancelBid}
            />
          </div>

          <div className="lg:col-span-2">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Team Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamData.map((team) => (
                  <div key={team.name} onClick={() => setSelectedTeam(team)} className="cursor-pointer">
                    <TeamOverviewCard
                      teamName={team.name}
                      teamFlag={team.flag}
                      playersCount={team.playersCount}
                      purseUsed={team.purseUsed}
                      purseRemaining={team.purseRemaining}
                      totalPurse={team.totalPurse}
                      gradeCount={team.gradeCount}
                      maxBid={team.maxBid}
                      requiredGrades={gradeQuotas}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="dialog-team-players-admin">
          {selectedTeam && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-2xl">
                  <TeamLogo 
                    logo={selectedTeam.logo} 
                    flag={selectedTeam.flag} 
                    name={selectedTeam.name}
                    className="w-10 h-10"
                  />
                  <span>{selectedTeam.name} - Players</span>
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
