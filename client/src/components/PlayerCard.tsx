import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, User } from "lucide-react";

interface PlayerCardProps {
  player: {
    id: string;
    firstName: string;
    lastName: string;
    grade: string;
    image?: string;
    cricherosLink?: string;
    basePrice?: number;
    status?: 'unsold' | 'sold';
    soldPrice?: number;
    team?: string;
  };
  onViewDetails?: () => void;
}

export default function PlayerCard({ player, onViewDetails }: PlayerCardProps) {
  const gradeColors: Record<string, string> = {
    A: 'bg-grade-a',
    B: 'bg-grade-b',
    C: 'bg-grade-c',
  };

  const isSold = player.status === 'sold' || !!player.soldPrice;

  return (
    <Card className={`overflow-hidden hover-elevate ${isSold ? 'border-l-4 border-l-auction-sold' : ''}`}>
      <div className="aspect-video bg-muted relative overflow-hidden">
        {player.image ? (
          <img 
            src={player.image} 
            alt={`${player.firstName} ${player.lastName}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
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
          <h3 className="font-semibold text-lg" data-testid={`text-player-name-${player.id}`}>
            {player.firstName} {player.lastName}
          </h3>
          {player.team && (
            <p className="text-sm text-muted-foreground" data-testid={`text-team-${player.id}`}>
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
          {player.cricherosLink && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open(player.cricherosLink, '_blank')}
              data-testid={`button-stats-${player.id}`}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Stats
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
