import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Play, Pause, RotateCcw, Users, Presentation, Upload, Download, Volume2, VolumeX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AuctionControls from "./AuctionControls";
import PlayerCard from "./PlayerCard";
import TeamOverviewCard from "./TeamOverviewCard";
import TeamLogo from "./TeamLogo";
import { audioManager } from "@/lib/audioManager";
import * as XLSX from 'xlsx';

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
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [presentationPath, setPresentationPath] = useState<string | null>(
    localStorage.getItem("presentationPath")
  );
  const { toast } = useToast();
  const currentPlayer = players[currentPlayerIndex];
  const prevPlayerIndexRef = useRef(currentPlayerIndex);
  const isDrumRollPlayingRef = useRef(false);
  const [isAudioMuted, setIsAudioMuted] = useState(audioManager.isMutedState());
  const [audioVolume, setAudioVolume] = useState(audioManager.getVolume());

  // Play entrance music when a new player appears
  useEffect(() => {
    if (currentPlayerIndex !== prevPlayerIndexRef.current && currentPlayer && isAuctionActive) {
      audioManager.playEntranceMusic();
      prevPlayerIndexRef.current = currentPlayerIndex;
    }
  }, [currentPlayerIndex, currentPlayer, isAuctionActive]);

  // Start drum roll when bidding begins (first bid placed)
  useEffect(() => {
    if (hasBids && isAuctionActive && !isDrumRollPlayingRef.current) {
      audioManager.startDrumRoll();
      isDrumRollPlayingRef.current = true;
    } else if (!hasBids && isDrumRollPlayingRef.current) {
      audioManager.stopDrumRoll();
      isDrumRollPlayingRef.current = false;
    }
  }, [hasBids, isAuctionActive]);

  // Stop drum roll when auction is paused
  useEffect(() => {
    if (!isAuctionActive && isDrumRollPlayingRef.current) {
      audioManager.stopDrumRoll();
      isDrumRollPlayingRef.current = false;
    }
  }, [isAuctionActive]);

  // Stop drum roll when player is sold or unsold
  useEffect(() => {
    if (currentPlayer && (currentPlayer.status === 'sold' || currentPlayer.status === 'unsold') && isDrumRollPlayingRef.current) {
      audioManager.stopDrumRoll();
      isDrumRollPlayingRef.current = false;
    }
  }, [currentPlayer?.status]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's a PowerPoint file
    const validTypes = [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(ppt|pptx|ppsx)$/i)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PowerPoint file (.ppt, .pptx, or .ppsx)",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('presentation', file);

      const response = await fetch('/api/upload-presentation', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      localStorage.setItem('presentationPath', data.path);
      setPresentationPath(data.path);
      setShowUploadDialog(false);
      
      toast({
        title: "Success!",
        description: "Presentation uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload presentation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openPresentation = () => {
    if (!presentationPath) {
      toast({
        title: "No presentation",
        description: "Please upload a presentation first",
        variant: "destructive",
      });
      return;
    }

    // Open presentation in new window using Office Online viewer
    const fullUrl = window.location.origin + presentationPath;
    const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullUrl)}`;
    window.open(viewerUrl, '_blank', 'width=1024,height=768');
  };

  const downloadAuctionReport = () => {
    // Get all sold players from all teams
    const soldPlayers: any[] = [];
    
    teamData.forEach(team => {
      team.players.forEach(player => {
        soldPlayers.push({
          'Player Name': `${player.firstName} ${player.lastName}`,
          'Phone Number': player.phoneNumber || 'N/A',
          'Team': team.name,
          'Grade': player.grade,
          'Sold Price': player.soldPrice ? `₹${player.soldPrice.toLocaleString()}` : 'N/A',
        });
      });
    });

    if (soldPlayers.length === 0) {
      toast({
        title: "No data to export",
        description: "No players have been sold yet",
        variant: "destructive",
      });
      return;
    }

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(soldPlayers);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Auction Results');
    
    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const filename = `auction_report_${date}.xlsx`;
    
    // Download
    XLSX.writeFile(workbook, filename);
    
    toast({
      title: "Report downloaded!",
      description: `${soldPlayers.length} players exported to ${filename}`,
    });
  };

  const handleTeamBid = (teamName: string) => {
    if (!currentPlayer || !isAuctionActive) return;
    
    let newBid: number;
    if (!hasBids) {
      newBid = currentPlayer.basePrice;
    } else {
      const increment = gradeIncrements[currentPlayer.grade] || 500000;
      newBid = currentBid + increment;
    }
    onBid(teamName, newBid);
  };

  const toggleAudioMute = () => {
    const newMutedState = !isAudioMuted;
    setIsAudioMuted(newMutedState);
    audioManager.setMuted(newMutedState);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setAudioVolume(newVolume);
    audioManager.setVolume(newVolume);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-xl sm:text-2xl font-bold">Auction Control Panel</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
            Player {currentPlayerIndex + 1} of {players.length}
          </span>
          
          {/* Audio Controls */}
          <div className="flex items-center gap-2 bg-muted/50 rounded-md px-2 py-1">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-7 w-7"
              onClick={toggleAudioMute}
              data-testid="button-audio-mute"
              title={isAudioMuted ? "Unmute audio" : "Mute audio"}
            >
              {isAudioMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={audioVolume}
              onChange={handleVolumeChange}
              className="w-16 h-1 accent-primary"
              disabled={isAudioMuted}
              data-testid="slider-audio-volume"
              title="Volume"
            />
          </div>

          <Button 
            onClick={downloadAuctionReport} 
            variant="outline" 
            size="sm" 
            data-testid="button-download-report"
          >
            <Download className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Download Report</span>
          </Button>
          <Button 
            onClick={() => setShowUploadDialog(true)} 
            variant="outline" 
            size="sm" 
            data-testid="button-upload-presentation"
          >
            <Upload className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Upload PPT</span>
          </Button>
          <Button onClick={onResetAuction} variant="outline" size="sm" data-testid="button-reset-auction">
            <RotateCcw className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
          {isAuctionActive ? (
            <Button onClick={onPauseAuction} variant="outline" size="sm" data-testid="button-pause-auction">
              <Pause className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Pause</span>
            </Button>
          ) : (
            <Button onClick={onStartAuction} size="sm" data-testid="button-start-auction">
              <Play className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Start</span>
            </Button>
          )}
        </div>
      </div>

      {/* Player Card and Auction Controls - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Player Card + Team Buttons */}
        <div className="space-y-4">
          {currentPlayer && (
            <div className="max-w-md mx-auto">
              <PlayerCard player={currentPlayer} />
            </div>
          )}
          
          {/* Team Bidding Buttons - Single Horizontal Row */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-center">Click team to place bid:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {teams.map((team) => (
                <Button
                  key={team.name}
                  variant="outline"
                  className="h-auto py-3 px-4 flex flex-col items-center justify-center gap-2 hover-elevate"
                  onClick={() => handleTeamBid(team.name)}
                  disabled={!isAuctionActive}
                  data-testid={`button-bid-${team.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <TeamLogo 
                    logo={team.logo} 
                    flag={team.flag} 
                    name={team.name}
                    className="w-10 h-10 flex-shrink-0"
                  />
                  <span className="text-xs font-medium text-center leading-tight line-clamp-2 break-words">
                    {team.name}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Auction Controls */}
        <div>
          <AuctionControls
            currentPlayer={currentPlayer}
            currentBid={currentBid}
            lastBidTeam={currentPlayer?.lastBidTeam}
            lastBidTeamLogo={teams.find(t => t.name === currentPlayer?.lastBidTeam)?.logo}
            lastBidTeamFlag={teams.find(t => t.name === currentPlayer?.lastBidTeam)?.flag}
            gradeIncrements={gradeIncrements}
            teams={teams}
            teamData={teamData}
            isAuctionActive={isAuctionActive}
            hasBids={hasBids}
            onBid={onBid}
            onSold={onSold}
            onUnsold={onUnsold}
            onCancelBid={onCancelBid}
          />
        </div>
      </div>

      {/* Team Overview Section */}
      <div className="space-y-4 pt-6 border-t">
        <h3 className="text-lg font-semibold">Team Overview</h3>
        <div className="space-y-3">
          {teamData.map((team) => (
            <div key={team.name} onClick={() => setSelectedTeam(team)} className="cursor-pointer">
              <TeamOverviewCard
                teamName={team.name}
                teamFlag={team.flag}
                teamLogo={team.logo}
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

        {/* Presentation Button - Only visible when auction is paused */}
        {!isAuctionActive && presentationPath && (
          <div className="flex justify-center mt-6 pb-6">
            <Button 
              onClick={openPresentation} 
              variant="default" 
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
              data-testid="button-open-presentation"
            >
              <Presentation className="w-5 h-5 mr-2" />
              Open Presentation
            </Button>
          </div>
        )}
      </div>

      {/* Upload Presentation Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent data-testid="dialog-upload-presentation">
          <DialogHeader>
            <DialogTitle>Upload Presentation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="presentation-file">PowerPoint File (.ppt, .pptx, .ppsx)</Label>
              <Input
                id="presentation-file"
                type="file"
                accept=".ppt,.pptx,.ppsx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.presentationml.slideshow"
                onChange={handleFileUpload}
                data-testid="input-presentation-file"
              />
            </div>
            {presentationPath && (
              <div className="text-sm text-muted-foreground">
                Current: {presentationPath.split('/').pop()}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Players Dialog */}
      <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="dialog-team-players-admin">
          {selectedTeam && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl">
                  <TeamLogo 
                    logo={selectedTeam.logo} 
                    flag={selectedTeam.flag} 
                    name={selectedTeam.name}
                    className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0"
                  />
                  <span className="truncate">{selectedTeam.name} - Players</span>
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
