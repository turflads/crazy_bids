import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Wallet, TrendingDown, TrendingUp } from "lucide-react";

interface PurseTrackerProps {
  totalPurse: number;
  usedPurse: number;
  teamName?: string;
}

export default function PurseTracker({ totalPurse, usedPurse, teamName }: PurseTrackerProps) {
  const remainingPurse = totalPurse - usedPurse;
  const usedPercentage = (usedPurse / totalPurse) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Purse</p>
            <Wallet className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold font-mono" data-testid="text-total-purse">
            ₹{totalPurse.toLocaleString()}
          </p>
          {teamName && (
            <p className="text-xs text-muted-foreground mt-1">{teamName}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Used Purse</p>
            <TrendingDown className="w-4 h-4 text-destructive" />
          </div>
          <p className="text-3xl font-bold font-mono text-destructive" data-testid="text-used-purse">
            ₹{usedPurse.toLocaleString()}
          </p>
          <Progress value={usedPercentage} className="mt-2 h-1" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Remaining</p>
            <TrendingUp className="w-4 h-4 text-auction-sold" />
          </div>
          <p className="text-3xl font-bold font-mono text-auction-sold" data-testid="text-remaining-purse">
            ₹{remainingPurse.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {(100 - usedPercentage).toFixed(1)}% available
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
