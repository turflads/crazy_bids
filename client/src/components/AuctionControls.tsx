import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Gavel, CheckCircle, XCircle, Flag, Undo2 } from "lucide-react";
import TeamLogo from "./TeamLogo";

interface Team {
  name: string;
  flag?: string;
  logo?: string;
}

interface AuctionControlsProps {
  currentPlayer?: {
    firstName: string;
    lastName: string;
    grade: string;
    basePrice: number;
  };
  currentBid: number;
  gradeIncrements: Record<string, number>;
  teams: Team[];
  isAuctionActive: boolean;
  hasBids: boolean;
  onBid: (team: string, amount: number) => void;
  onSold: () => void;
  onUnsold: () => void;
  onCancelBid: () => void;
}

export default function AuctionControls({
  currentPlayer,
  currentBid,
  gradeIncrements,
  teams,
  isAuctionActive,
  hasBids,
  onBid,
  onSold,
  onUnsold,
  onCancelBid,
}: AuctionControlsProps) {
  const [customAmount, setCustomAmount] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");

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

  const handleCustomBid = () => {
    if (!customAmount || !selectedTeam || !currentPlayer || !isAuctionActive) return;
    
    const amount = parseInt(customAmount.replace(/,/g, ''));
    const minBid = hasBids ? currentBid + 1 : currentPlayer.basePrice;
    
    if (isNaN(amount) || amount < minBid) {
      alert(`Custom bid must be at least ₹${minBid.toLocaleString()}`);
      return;
    }
    
    onBid(selectedTeam, amount);
    setCustomAmount("");
  };

  if (!currentPlayer) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Gavel className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No player in auction</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gavel className="w-5 h-5" />
          Auction Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Current Player</p>
          <h3 className="text-xl font-bold" data-testid="text-current-player">
            {currentPlayer.firstName} {currentPlayer.lastName}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <Badge className="bg-grade-a text-white">Grade {currentPlayer.grade}</Badge>
            <span className="text-sm text-muted-foreground">
              Base: ₹{currentPlayer.basePrice.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="p-6 bg-primary/10 rounded-lg text-center">
          <p className="text-sm text-muted-foreground mb-2">Current Bid</p>
          <p className="text-4xl font-bold font-mono text-primary" data-testid="text-current-bid">
            ₹{currentBid.toLocaleString()}
          </p>
        </div>

        {currentPlayer && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Next Increment</p>
            <p className="text-lg font-semibold font-mono">
              +₹{gradeIncrements[currentPlayer.grade]?.toLocaleString() || '0'}
            </p>
          </div>
        )}

        {!isAuctionActive && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
              Start the auction to enable bidding
            </p>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm font-medium">Click team to place bid:</p>
          <div className="grid grid-cols-2 gap-3">
            {teams.map((team) => (
              <Button
                key={team.name}
                variant="outline"
                className="h-auto min-h-[100px] py-3 px-2 flex flex-col items-center justify-center gap-2 hover-elevate"
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
                <span className="text-xs font-medium text-center leading-tight line-clamp-2 break-words w-full">
                  {team.name}
                </span>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t">
          <p className="text-sm font-medium">Custom Bid:</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="custom-amount" className="text-xs">Amount (₹)</Label>
              <Input
                id="custom-amount"
                type="text"
                placeholder="5000000"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                data-testid="input-custom-bid"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-select" className="text-xs">Team</Label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger id="team-select" data-testid="select-team">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.name} value={team.name}>
                      <div className="flex items-center gap-2">
                        <TeamLogo 
                          logo={team.logo} 
                          flag={team.flag} 
                          name={team.name}
                          className="w-5 h-5"
                        />
                        <span>{team.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleCustomBid}
            disabled={!customAmount || !selectedTeam || !isAuctionActive}
            data-testid="button-custom-bid"
          >
            Place Custom Bid
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={onCancelBid}
            disabled={!isAuctionActive || !hasBids}
            data-testid="button-cancel-bid"
          >
            <Undo2 className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span className="truncate">Cancel</span>
          </Button>
          <Button
            variant="default"
            className="bg-auction-sold hover:bg-auction-sold/90 w-full"
            onClick={onSold}
            disabled={!isAuctionActive || !hasBids}
            data-testid="button-sold"
          >
            <CheckCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span className="truncate">Sold</span>
          </Button>
          <Button
            variant="destructive"
            className="w-full"
            onClick={onUnsold}
            disabled={!isAuctionActive}
            data-testid="button-unsold"
          >
            <XCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span className="truncate">Unsold</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
