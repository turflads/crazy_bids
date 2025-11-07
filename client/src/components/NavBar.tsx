import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, LogOut, Circle } from "lucide-react";
import { LEAGUE_NAME, LEAGUE_LOGO, SPONSOR_NAME, SPONSOR_LOGO, DEVELOPER_NAME } from "@/config/leagueConfig";

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
        {/* LEFT: League Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {LEAGUE_LOGO ? (
            <img 
              src={LEAGUE_LOGO} 
              alt="League Logo" 
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
            />
          ) : (
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
          )}
          {isAuctionLive && (
            <Badge className="bg-auction-live text-white animate-pulse flex-shrink-0" data-testid="badge-live-auction">
              <Circle className="w-2 h-2 mr-1 fill-current" />
              <span className="hidden sm:inline">LIVE</span>
              <span className="sm:hidden">•</span>
            </Badge>
          )}
        </div>

        {/* CENTER: League Name */}
        <div className="flex-1 flex justify-center min-w-0">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-center truncate px-2">{LEAGUE_NAME}</h1>
        </div>

        {/* RIGHT: Sponsor, User Info, Logout */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {SPONSOR_NAME && (
            <div className="flex items-center gap-1 sm:gap-2">
              {SPONSOR_LOGO && (
                <img 
                  src={SPONSOR_LOGO} 
                  alt="Sponsor" 
                  className="h-6 sm:h-8 w-auto object-contain"
                />
              )}
              <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap max-w-[80px] sm:max-w-none truncate" data-testid="text-sponsor">
                {SPONSOR_NAME}
              </span>
            </div>
          )}
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

      {/* FOOTER: Developer Credit */}
      {DEVELOPER_NAME && (
        <div className="border-t bg-muted/30 px-4 sm:px-6 py-1">
          <p className="text-xs text-center text-muted-foreground" data-testid="text-developer">
            Developed by {DEVELOPER_NAME}
          </p>
        </div>
      )}
    </nav>
  );
}
