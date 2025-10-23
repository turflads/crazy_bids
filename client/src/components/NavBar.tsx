import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, LogOut, Circle } from "lucide-react";

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
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 gap-4">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
            <h1 className="text-lg sm:text-xl font-bold truncate">Cricket Auction</h1>
          </div>
          {isAuctionLive && (
            <Badge className="bg-auction-live text-white animate-pulse flex-shrink-0" data-testid="badge-live-auction">
              <Circle className="w-2 h-2 mr-1 fill-current" />
              <span className="hidden sm:inline">LIVE</span>
              <span className="sm:hidden">•</span>
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium truncate max-w-[150px]" data-testid="text-username">{username}</p>
            <Badge className={roleColors[userRole]} data-testid="badge-role">
              {roleLabels[userRole]}
            </Badge>
          </div>
          <div className="sm:hidden">
            <Badge className={roleColors[userRole]} data-testid="badge-role-mobile">
              {roleLabels[userRole]}
            </Badge>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onLogout}
            data-testid="button-logout"
            className="flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
