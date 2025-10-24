import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import TeamLogo from "./TeamLogo";

interface TeamOverviewCardProps {
  teamName: string;
  teamFlag?: string;
  teamLogo?: string;
  playersCount: number;
  purseUsed: number;
  purseRemaining: number;
  totalPurse: number;
  gradeCount: Record<string, number>;
  maxBid?: number;
  requiredGrades?: Record<string, number>;
}

export default function TeamOverviewCard({
  teamName,
  teamFlag,
  teamLogo,
  playersCount,
  purseUsed,
  purseRemaining,
  totalPurse,
  gradeCount,
  maxBid,
  requiredGrades,
}: TeamOverviewCardProps) {
  return (
    <Card data-testid={`card-team-${teamName.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <TeamLogo 
              logo={teamLogo} 
              flag={teamFlag} 
              name={teamName}
              className="w-8 h-8"
            />
            <span className="text-sm">{teamName}</span>
          </div>
          <Badge variant="outline" className="gap-1">
            <Users className="w-3 h-3" />
            {playersCount}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Purse Status</p>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-mono font-semibold">
                ₹{totalPurse.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Used:</span>
              <span className="font-mono font-semibold text-destructive">
                ₹{purseUsed.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Left:</span>
              <span className="font-mono font-semibold text-auction-sold">
                ₹{purseRemaining.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {maxBid !== undefined && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-1">Max Bid Available</p>
            <p className="font-mono font-bold text-lg text-primary" data-testid={`text-max-bid-${teamName.toLowerCase().replace(/\s+/g, '-')}`}>
              ₹{maxBid.toLocaleString()}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {requiredGrades && Object.entries(requiredGrades).map(([grade, required]) => {
            const current = gradeCount[grade] || 0;
            const isComplete = current >= required;
            return (
              <Badge 
                key={grade} 
                className={`text-xs ${isComplete ? 'bg-auction-sold' : `bg-grade-${grade.toLowerCase()}`} text-white`}
                data-testid={`badge-grade-${grade}-${teamName.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {grade}: {current}/{required}
              </Badge>
            );
          })}
          {!requiredGrades && (
            <>
              <Badge className="bg-grade-a text-white text-xs">
                A: {gradeCount.A || 0}
              </Badge>
              <Badge className="bg-grade-b text-white text-xs">
                B: {gradeCount.B || 0}
              </Badge>
              <Badge className="bg-grade-c text-white text-xs">
                C: {gradeCount.C || 0}
              </Badge>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
