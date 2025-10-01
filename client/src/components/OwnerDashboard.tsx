import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import PurseTracker from "./PurseTracker";
import GradeQuotaTracker from "./GradeQuotaTracker";
import PlayerCard from "./PlayerCard";

interface OwnerDashboardProps {
  teamName: string;
  totalPurse: number;
  usedPurse: number;
  gradeQuotas: any[];
  allPlayers: any[];
  myTeamPlayers: any[];
  soldPlayers: any[];
  unsoldPlayers: any[];
}

export default function OwnerDashboard({
  teamName,
  totalPurse,
  usedPurse,
  gradeQuotas,
  allPlayers,
  myTeamPlayers,
  soldPlayers,
  unsoldPlayers,
}: OwnerDashboardProps) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-6">Team Dashboard - {teamName}</h2>
        <PurseTracker
          totalPurse={totalPurse}
          usedPurse={usedPurse}
          teamName={teamName}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Grade Quota Status</h3>
        <GradeQuotaTracker quotas={gradeQuotas} />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="all" data-testid="tab-all-players">
            All Players ({allPlayers.length})
          </TabsTrigger>
          <TabsTrigger value="myteam" data-testid="tab-my-team">
            My Team ({myTeamPlayers.length})
          </TabsTrigger>
          <TabsTrigger value="sold" data-testid="tab-sold">
            Sold ({soldPlayers.length})
          </TabsTrigger>
          <TabsTrigger value="unsold" data-testid="tab-unsold">
            Unsold ({unsoldPlayers.length})
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search players..."
              className="pl-10"
              data-testid="input-search-players"
            />
          </div>

          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {allPlayers.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="myteam" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {myTeamPlayers.length > 0 ? (
                myTeamPlayers.map((player) => (
                  <PlayerCard key={player.id} player={player} />
                ))
              ) : (
                <p className="text-muted-foreground col-span-full text-center py-12">
                  No players in your team yet
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sold" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {soldPlayers.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="unsold" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {unsoldPlayers.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
