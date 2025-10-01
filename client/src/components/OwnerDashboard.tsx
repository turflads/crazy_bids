import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Trophy, Users } from "lucide-react";
import PurseTracker from "./PurseTracker";
import GradeQuotaTracker from "./GradeQuotaTracker";
import PlayerCard from "./PlayerCard";

interface TeamData {
  team: string;
  flag?: string;
  playersCount: number;
  purseUsed: number;
  purseRemaining: number;
  gradeCount: Record<string, number>;
}

interface OwnerDashboardProps {
  teamName: string;
  totalPurse: number;
  usedPurse: number;
  gradeQuotas: any[];
  allPlayers: any[];
  myTeamPlayers: any[];
  soldPlayers: any[];
  unsoldPlayers: any[];
  allTeamsData: TeamData[];
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
  allTeamsData,
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
        <h3 className="text-lg font-semibold mb-4">My Grade Quota Status</h3>
        <GradeQuotaTracker quotas={gradeQuotas} />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          All Teams Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allTeamsData.map((team) => (
            <Card key={team.team} data-testid={`card-team-overview-${team.team}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {team.flag && <span className="text-2xl">{team.flag}</span>}
                    <span>{team.team}</span>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <Users className="w-3 h-3" />
                    {team.playersCount}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Purse Used</p>
                    <p className="font-mono font-semibold text-destructive">
                      ₹{team.purseUsed.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className="font-mono font-semibold text-auction-sold">
                      ₹{team.purseRemaining.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-grade-a text-white text-xs">
                    A: {team.gradeCount.A || 0}
                  </Badge>
                  <Badge className="bg-grade-b text-white text-xs">
                    B: {team.gradeCount.B || 0}
                  </Badge>
                  <Badge className="bg-grade-c text-white text-xs">
                    C: {team.gradeCount.C || 0}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
