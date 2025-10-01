import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Gavel, Plus, Minus, CheckCircle, XCircle } from "lucide-react";

interface AuctionControlsProps {
  currentPlayer?: {
    firstName: string;
    lastName: string;
    grade: string;
    basePrice: number;
  };
  currentBid: number;
  increment: number;
  teams: string[];
  onBid: (team: string, amount: number) => void;
  onSold: () => void;
  onUnsold: () => void;
}

export default function AuctionControls({
  currentPlayer,
  currentBid,
  increment,
  teams,
  onBid,
  onSold,
  onUnsold,
}: AuctionControlsProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [customAmount, setCustomAmount] = useState("");

  const handleQuickBid = (amount: number) => {
    if (!selectedTeam) {
      alert("Please select a team first");
      return;
    }
    onBid(selectedTeam, currentBid + amount);
  };

  const handleCustomBid = () => {
    if (!selectedTeam) {
      alert("Please select a team first");
      return;
    }
    const amount = parseInt(customAmount);
    if (amount > currentBid) {
      onBid(selectedTeam, amount);
      setCustomAmount("");
    }
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

        <div className="space-y-2">
          <Label>Select Team</Label>
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger data-testid="select-team">
              <SelectValue placeholder="Choose team to bid for" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team} value={team}>
                  {team}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Quick Bid Increments</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              onClick={() => handleQuickBid(500000)}
              data-testid="button-bid-5l"
            >
              <Plus className="w-4 h-4 mr-1" />
              ₹5L
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickBid(1000000)}
              data-testid="button-bid-10l"
            >
              <Plus className="w-4 h-4 mr-1" />
              ₹10L
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickBid(2500000)}
              data-testid="button-bid-25l"
            >
              <Plus className="w-4 h-4 mr-1" />
              ₹25L
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Custom Amount</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Enter amount"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              data-testid="input-custom-bid"
            />
            <Button onClick={handleCustomBid} data-testid="button-custom-bid">
              Bid
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4">
          <Button
            variant="default"
            className="bg-auction-sold hover:bg-auction-sold/90"
            onClick={onSold}
            data-testid="button-sold"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Sold
          </Button>
          <Button
            variant="destructive"
            onClick={onUnsold}
            data-testid="button-unsold"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Unsold
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
