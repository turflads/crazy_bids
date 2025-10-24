import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, LogOut, Circle } from "lucide-react";
import { LEAGUE_CONFIG } from "@/lib/leagueConfig";

interface NavBarProps {
  userRole: 'admin' | 'owner' | 'viewer';
  username: string;
  isAuctionLive?: boolean;
  onLogout: () => void;
}

export default function NavBar({ userRole, username, isAuctionLive, onLogout }: NavBarProps) {
  const roleColors = {
    admin: 'bg-destructive text-destructive-foreground',
    owner: 'bg-grade-b text-white',
    viewer: 'bg-muted text-muted-foreground',
  };

  const roleLabels = {
    admin: 'Admin',
    owner: 'Owner',
    viewer: 'Viewer',
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">{LEAGUE_CONFIG.name}</h1>
          </div>
          {isAuctionLive && (
            <Badge className="bg-auction-live text-white animate-pulse" data-testid="badge-live-auction">
              <Circle className="w-2 h-2 mr-1 fill-current" />
              LIVE
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium" data-testid="text-username">{username}</p>
            <Badge className={roleColors[userRole]} data-testid="badge-role">
              {roleLabels[userRole]}
            </Badge>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
