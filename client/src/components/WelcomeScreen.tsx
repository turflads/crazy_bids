import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LEAGUE_NAME, LEAGUE_LOGO } from "@/config/leagueConfig";
import { Trophy } from "lucide-react";

interface WelcomeScreenProps {
  onStartAuction?: () => void;
  showStartButton?: boolean;
}

export default function WelcomeScreen({ onStartAuction, showStartButton = false }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center space-y-6 pb-8">
          {LEAGUE_LOGO && (
            <div className="flex justify-center">
              <img 
                src={LEAGUE_LOGO} 
                alt={LEAGUE_NAME}
                className="h-32 w-auto object-contain"
              />
            </div>
          )}
          <CardTitle className="text-4xl font-bold">
            Welcome to {LEAGUE_NAME}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="flex justify-center">
            <Trophy className="w-24 h-24 text-primary" />
          </div>
          
          {showStartButton ? (
            <div className="space-y-4">
              <p className="text-lg text-muted-foreground">
                Ready to begin the player auction?
              </p>
              <Button 
                onClick={onStartAuction}
                size="lg"
                className="text-lg px-8 py-6"
                data-testid="button-start-auction-welcome"
              >
                Start Auction
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-muted-foreground">
                The auction hasn't started yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Please wait for the admin to start the auction.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
