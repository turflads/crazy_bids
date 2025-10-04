import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import AuctionControls from "./AuctionControls";
import PlayerCard from "./PlayerCard";
import ExcelUpload from "./ExcelUpload";

interface Team {
  name: string;
  flag?: string;
}

interface AdminDashboardProps {
  players: any[];
  currentPlayerIndex: number;
  currentBid: number;
  teams: Team[];
  gradeIncrements: Record<string, number>;
  isAuctionActive: boolean;
  onNextPlayer: () => void;
  onPrevPlayer: () => void;
  onStartAuction: () => void;
  onPauseAuction: () => void;
  onBid: (team: string, amount: number) => void;
  onSold: () => void;
  onUnsold: () => void;
  onCancelBid: () => void;
  onUploadPlayers: (file: File) => void;
}

export default function AdminDashboard({
  players,
  currentPlayerIndex,
  currentBid,
  teams,
  gradeIncrements,
  isAuctionActive,
  onNextPlayer,
  onPrevPlayer,
  onStartAuction,
  onPauseAuction,
  onBid,
  onSold,
  onUnsold,
  onCancelBid,
  onUploadPlayers,
}: AdminDashboardProps) {
  const currentPlayer = players[currentPlayerIndex];
  const upcomingPlayers = players.slice(currentPlayerIndex + 1, currentPlayerIndex + 4);

  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="auction" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="auction" data-testid="tab-auction">Auction Control</TabsTrigger>
          <TabsTrigger value="upload" data-testid="tab-upload">Upload Players</TabsTrigger>
        </TabsList>

        <TabsContent value="auction" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Auction Control Panel</h2>
            {isAuctionActive ? (
              <Button onClick={onPauseAuction} variant="outline" data-testid="button-pause-auction">
                <Pause className="w-4 h-4 mr-2" />
                Pause Auction
              </Button>
            ) : (
              <Button onClick={onStartAuction} data-testid="button-start-auction">
                <Play className="w-4 h-4 mr-2" />
                Start Auction
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {currentPlayer && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={onPrevPlayer}
                      disabled={currentPlayerIndex === 0}
                      data-testid="button-prev-player"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Player {currentPlayerIndex + 1} of {players.length}
                    </span>
                    <Button
                      variant="outline"
                      onClick={onNextPlayer}
                      disabled={currentPlayerIndex === players.length - 1}
                      data-testid="button-next-player"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  <div className="max-w-sm mx-auto">
                    <PlayerCard player={currentPlayer} />
                  </div>
                </div>
              )}

              {upcomingPlayers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Upcoming Players</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {upcomingPlayers.map((player) => (
                      <PlayerCard key={player.id} player={player} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <AuctionControls
                currentPlayer={currentPlayer}
                currentBid={currentBid}
                gradeIncrements={gradeIncrements}
                teams={teams}
                onBid={onBid}
                onSold={onSold}
                onUnsold={onUnsold}
                onCancelBid={onCancelBid}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="mt-6">
          <div className="max-w-2xl mx-auto">
            <ExcelUpload onUpload={onUploadPlayers} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
