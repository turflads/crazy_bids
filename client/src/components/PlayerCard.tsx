import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, User } from "lucide-react";
import { useState } from "react";

interface PlayerCardProps {
  player: {
    id: string;
    firstName: string;
    lastName: string;
    grade: string;
    image?: string;
    imageUrl?: string;      // Resolved image URL (preferred)
    imageSource?: string;   // Image source type
    cricherosLink?: string;
    basePrice?: number;
    status?: 'unsold' | 'sold';
    soldPrice?: number;
    team?: string;
    // Player statistics
    battingStyle?: string;
    bowlingStyle?: string;
    runs?: number;
    wickets?: number;
    strikeRate?: number;
    bowlingAverage?: number;
  };
  onViewDetails?: () => void;
  showStats?: boolean; // Control whether to show stats section
}

export default function PlayerCard({ player, onViewDetails, showStats = true }: PlayerCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const gradeColors: Record<string, string> = {
    A: 'bg-grade-a',
    B: 'bg-grade-b',
    C: 'bg-grade-c',
  };

  const isSold = player.status === 'sold' || !!player.soldPrice;

  return (
    <Card 
      className={`overflow-visible hover-elevate ${isSold ? 'border-l-4 border-l-auction-sold' : ''}`}
      data-testid={`card-player-${player.id}`}
    >
      <div className="aspect-video bg-muted relative overflow-hidden flex items-center justify-center">
        {(player.imageUrl || player.image) && !imageError ? (
          <img 
            src={player.imageUrl || player.image} 
            alt={`${player.firstName} ${player.lastName}`}
            className="h-full w-auto"
            onError={() => {
              const errorMsg = `[PlayerCard] Failed to load image for ${player.firstName} ${player.lastName}`;
              if (player.imageSource === 'gdrive') {
                console.warn(errorMsg, '\n⚠️ Google Drive image failed. Check:', 
                  '\n1. File sharing is set to "Anyone with the link"',
                  '\n2. Open this link in incognito to test:', player.imageUrl || player.image);
              } else {
                console.warn(errorMsg + ':', player.imageUrl || player.image);
              }
              setImageError(true);
            }}
            data-testid={`img-player-${player.id}`}
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            data-testid={`img-placeholder-${player.id}`}
          >
            <User className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
        <Badge 
          className={`absolute top-2 right-2 ${gradeColors[player.grade] || 'bg-muted'} text-white`}
          data-testid={`badge-grade-${player.id}`}
        >
          Grade {player.grade}
        </Badge>
        {isSold && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Badge className="bg-auction-sold text-white text-lg px-4 py-2">
              SOLD
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg break-words" data-testid={`text-player-name-${player.id}`}>
            {player.firstName} {player.lastName}
          </h3>
          {player.team && (
            <p className="text-sm text-muted-foreground truncate" data-testid={`text-team-${player.id}`}>
              {player.team}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          {isSold ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Base Price</p>
                  <p className="font-mono font-semibold text-sm">
                    ₹{player.basePrice?.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Sold Price</p>
                  <p className="font-mono font-semibold text-auction-sold" data-testid={`text-price-${player.id}`}>
                    ₹{player.soldPrice?.toLocaleString()}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Base Price</p>
                <p className="font-mono font-semibold" data-testid={`text-price-${player.id}`}>
                  ₹{player.basePrice?.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Player Statistics Section */}
          {showStats && (player.battingStyle || player.bowlingStyle || player.runs !== undefined || player.wickets !== undefined) && (
            <div className="pt-2 border-t space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Player Stats</p>
              
              {/* Batting/Bowling Styles */}
              {(player.battingStyle || player.bowlingStyle) && (
                <div className="space-y-1">
                  {player.battingStyle && (
                    <p className="text-xs" data-testid={`text-batting-${player.id}`}>
                      <span className="text-muted-foreground">Bat:</span>{' '}
                      <span className="font-medium">{player.battingStyle}</span>
                    </p>
                  )}
                  {player.bowlingStyle && (
                    <p className="text-xs" data-testid={`text-bowling-${player.id}`}>
                      <span className="text-muted-foreground">Bowl:</span>{' '}
                      <span className="font-medium">{player.bowlingStyle}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Performance Stats */}
              <div className="grid grid-cols-2 gap-2">
                {player.runs !== undefined && (
                  <div className="bg-muted/50 rounded p-2">
                    <p className="text-xs text-muted-foreground">Runs</p>
                    <p className="font-mono font-semibold text-sm" data-testid={`text-runs-${player.id}`}>
                      {player.runs.toLocaleString()}
                    </p>
                  </div>
                )}
                {player.wickets !== undefined && (
                  <div className="bg-muted/50 rounded p-2">
                    <p className="text-xs text-muted-foreground">Wickets</p>
                    <p className="font-mono font-semibold text-sm" data-testid={`text-wickets-${player.id}`}>
                      {player.wickets}
                    </p>
                  </div>
                )}
                {player.strikeRate !== undefined && (
                  <div className="bg-muted/50 rounded p-2">
                    <p className="text-xs text-muted-foreground">Strike Rate</p>
                    <p className="font-mono font-semibold text-sm" data-testid={`text-sr-${player.id}`}>
                      {player.strikeRate.toFixed(1)}
                    </p>
                  </div>
                )}
                {player.bowlingAverage !== undefined && (
                  <div className="bg-muted/50 rounded p-2">
                    <p className="text-xs text-muted-foreground">Bowl Avg</p>
                    <p className="font-mono font-semibold text-sm" data-testid={`text-bowlavg-${player.id}`}>
                      {player.bowlingAverage.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CricHeroes Link Button */}
          {player.cricherosLink && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open(player.cricherosLink, '_blank')}
              data-testid={`button-stats-${player.id}`}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              View CricHeroes Profile
            </Button>
          )}
        </div>

        {onViewDetails && (
          <Button 
            variant="secondary" 
            className="w-full"
            onClick={onViewDetails}
            data-testid={`button-view-details-${player.id}`}
          >
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
