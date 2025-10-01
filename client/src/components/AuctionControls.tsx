import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gavel, CheckCircle, XCircle, Flag } from "lucide-react";

interface Team {
  name: string;
  flag?: string;
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
  onBid: (team: string, amount: number) => void;
  onSold: () => void;
  onUnsold: () => void;
}

export default function AuctionControls({
  currentPlayer,
  currentBid,
  gradeIncrements,
  teams,
  onBid,
  onSold,
  onUnsold,
}: AuctionControlsProps) {
  const handleTeamBid = (teamName: string) => {
    if (!currentPlayer) return;
    
    const increment = gradeIncrements[currentPlayer.grade] || 500000;
    const newBid = currentBid + increment;
    onBid(teamName, newBid);
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

        <div className="space-y-3">
          <p className="text-sm font-medium">Click team to place bid:</p>
          <div className="grid grid-cols-2 gap-3">
            {teams.map((team) => (
              <Button
                key={team.name}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover-elevate"
                onClick={() => handleTeamBid(team.name)}
                data-testid={`button-bid-${team.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {team.flag ? (
                  <div className="text-3xl">{team.flag}</div>
                ) : (
                  <Flag className="w-8 h-8 text-primary" />
                )}
                <span className="text-sm font-medium text-center leading-tight">
                  {team.name}
                </span>
              </Button>
            ))}
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
