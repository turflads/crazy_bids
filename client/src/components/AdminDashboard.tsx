import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import AuctionControls from "./AuctionControls";
import PlayerCard from "./PlayerCard";
import TeamOverviewCard from "./TeamOverviewCard";

interface Team {
  name: string;
  flag?: string;
}

interface TeamData {
  name: string;
  flag?: string;
  playersCount: number;
  purseUsed: number;
  purseRemaining: number;
  totalPurse: number;
  gradeCount: Record<string, number>;
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
                  <TeamOverviewCard
                    key={team.name}
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
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
