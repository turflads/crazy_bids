import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import NavBar from "@/components/NavBar";
import ExcelUpload from "@/components/ExcelUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAuctionState } from "@/lib/auctionState";
import { getTeamState } from "@/lib/teamState";
import { saveAuctionStateWithBroadcast, saveTeamStateWithBroadcast } from "@/lib/webSocketState";
import { loadAuctionConfig, type Team } from "@/lib/auctionConfig";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Save, X, AlertTriangle, DollarSign, Users, Shield, Upload as UploadIcon } from "lucide-react";
import * as XLSX from "xlsx";
import { resolvePlayerImage } from "@/lib/playerImageResolver";

export default function SuperAdmin() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const { toast } = useToast();

  const [teams, setTeams] = useState<Record<string, any>>({});
  const [configTeams, setConfigTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  // Editing states
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<any>({});

  // Role check
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.role !== "superadmin") {
        setLocation("/");
        return;
      }
      setUser(userData);
    } else {
      setLocation("/");
    }
  }, [setLocation]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      const config = await loadAuctionConfig();
      setConfigTeams(config.teams);

      const teamState = getTeamState();
      setTeams(teamState);

      const auctionState = getAuctionState();
      if (auctionState && auctionState.players) {
        setPlayers(auctionState.players);
        setCurrentPlayerIndex(auctionState.currentPlayerIndex || 0);
      }
    };

    loadData();

    // Refresh data every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleEditTeam = (teamName: string) => {
    setEditingTeam(teamName);
    setEditValues({
      totalPurse: teams[teamName]?.totalPurse || 0,
      usedPurse: teams[teamName]?.usedPurse || 0,
    });
  };

  const handleSaveTeam = (teamName: string) => {
    const updatedTeams = { ...teams };
    updatedTeams[teamName] = {
      ...updatedTeams[teamName],
      totalPurse: parseFloat(editValues.totalPurse) || 0,
      usedPurse: parseFloat(editValues.usedPurse) || 0,
    };

    saveTeamStateWithBroadcast(updatedTeams);
    setTeams(updatedTeams);
    setEditingTeam(null);

    toast({
      title: "Team Updated",
      description: `${teamName}'s purse has been updated successfully.`,
    });
  };

  const handleEditPlayer = (index: number) => {
    const player = players[index];
    setEditingPlayer(index);
    setEditValues({
      status: player.status || 'unsold',
      team: player.team || '',
      soldPrice: player.soldPrice || 0,
      firstName: player.firstName || '',
      lastName: player.lastName || '',
      grade: player.grade || 'C',
    });
  };

  const handleSavePlayer = (index: number) => {
    const updatedPlayers = [...players];
    const oldPlayer = { ...updatedPlayers[index] };
    
    // Update player in auction state with all new values
    updatedPlayers[index] = {
      ...updatedPlayers[index],
      status: editValues.status,
      team: editValues.status === 'sold' ? editValues.team : undefined,
      soldPrice: editValues.status === 'sold' ? parseFloat(editValues.soldPrice) || 0 : undefined,
      firstName: editValues.firstName,
      lastName: editValues.lastName,
      grade: editValues.grade,
    };

    // Single consolidated team state update
    const updatedTeams = { ...teams };
    let teamStateChanged = false;

    // Case 1: Player was sold before - remove from old team
    if (oldPlayer.status === 'sold' && oldPlayer.team && updatedTeams[oldPlayer.team]) {
      updatedTeams[oldPlayer.team].usedPurse -= oldPlayer.soldPrice || 0;
      updatedTeams[oldPlayer.team].players = updatedTeams[oldPlayer.team].players.filter(
        (p: any) => !(p.firstName === oldPlayer.firstName && p.lastName === oldPlayer.lastName)
      );
      updatedTeams[oldPlayer.team].gradeCount[oldPlayer.grade] = 
        Math.max(0, (updatedTeams[oldPlayer.team].gradeCount[oldPlayer.grade] || 1) - 1);
      teamStateChanged = true;
    }

    // Case 2: Player is sold now - add to new team (or re-add to same team with new data)
    if (editValues.status === 'sold' && editValues.team && updatedTeams[editValues.team]) {
      updatedTeams[editValues.team].usedPurse += parseFloat(editValues.soldPrice) || 0;
      updatedTeams[editValues.team].players.push({
        ...updatedPlayers[index],
        soldPrice: parseFloat(editValues.soldPrice) || 0,
      });
      updatedTeams[editValues.team].gradeCount[editValues.grade] = 
        (updatedTeams[editValues.team].gradeCount[editValues.grade] || 0) + 1;
      teamStateChanged = true;
    }

    // Save team state if any changes were made
    if (teamStateChanged) {
      saveTeamStateWithBroadcast(updatedTeams);
      setTeams(updatedTeams);
    }

    // Save updated auction state
    const auctionState = getAuctionState() || {
      currentPlayerIndex: 0,
      currentBid: 0,
      isAuctionActive: false,
      players: updatedPlayers,
      bidHistory: [],
      hasBids: false,
    };
    let newCurrentPlayerIndex = auctionState.currentPlayerIndex || 0;

    // If we just sold the current player, advance to next unsold player
    if (index === currentPlayerIndex && oldPlayer.status !== 'sold' && editValues.status === 'sold') {
      // Find next unsold player
      let nextIndex = currentPlayerIndex + 1;
      while (nextIndex < updatedPlayers.length && updatedPlayers[nextIndex].status === 'sold') {
        nextIndex++;
      }
      if (nextIndex < updatedPlayers.length) {
        newCurrentPlayerIndex = nextIndex;
        setCurrentPlayerIndex(nextIndex);
      }
    }

    saveAuctionStateWithBroadcast({
      ...auctionState,
      players: updatedPlayers,
      currentPlayerIndex: newCurrentPlayerIndex,
      currentBid: newCurrentPlayerIndex !== auctionState.currentPlayerIndex ? updatedPlayers[newCurrentPlayerIndex]?.basePrice || 0 : auctionState.currentBid,
      bidHistory: newCurrentPlayerIndex !== auctionState.currentPlayerIndex ? [] : auctionState.bidHistory,
      hasBids: newCurrentPlayerIndex !== auctionState.currentPlayerIndex ? false : auctionState.hasBids,
    });

    setPlayers(updatedPlayers);
    setEditingPlayer(null);

    toast({
      title: "Player Updated",
      description: `${editValues.firstName} ${editValues.lastName} has been updated successfully.`,
    });
  };

  const handleRemovePlayerFromTeam = (teamName: string, playerIndex: number) => {
    const updatedTeams = { ...teams };
    const player = updatedTeams[teamName].players[playerIndex];
    
    updatedTeams[teamName].usedPurse -= player.soldPrice || 0;
    updatedTeams[teamName].players.splice(playerIndex, 1);
    updatedTeams[teamName].gradeCount[player.grade] = 
      (updatedTeams[teamName].gradeCount[player.grade] || 1) - 1;

    saveTeamStateWithBroadcast(updatedTeams);
    setTeams(updatedTeams);

    // Mark player as unsold in auction state
    const updatedPlayers = players.map(p => {
      if (p.firstName === player.firstName && p.lastName === player.lastName) {
        return { ...p, status: 'unsold', team: undefined, soldPrice: undefined };
      }
      return p;
    });

    const auctionState = getAuctionState();
    saveAuctionStateWithBroadcast({
      ...auctionState,
      players: updatedPlayers,
    });
    setPlayers(updatedPlayers);

    toast({
      title: "Player Removed",
      description: `${player.firstName} ${player.lastName} removed from ${teamName}.`,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleExcelUpload = async (file: File) => {
    try {
      const config = await loadAuctionConfig();
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(firstSheet) as any[];

      const EXCEL_COLUMNS = {
        NAME_COLUMN: "name",
        GRADE_COLUMN: "grade",
        PHOTO_COLUMN: "photo",
        PHONE_COLUMN: "phone",
        BATTING_STYLE_COLUMN: "Role",
        RUNS_COLUMN: "MZPL RUNS",
        WICKETS_COLUMN: "MZPL WKTS",
      };

      const newPlayers = data.map((row, index) => {
        const name = row[EXCEL_COLUMNS.NAME_COLUMN] || "";
        const nameParts = name.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
        const grade = (row[EXCEL_COLUMNS.GRADE_COLUMN] || "C").toString().toUpperCase();
        const photo = row[EXCEL_COLUMNS.PHOTO_COLUMN] || "";
        const phone = row[EXCEL_COLUMNS.PHONE_COLUMN] || "";
        const battingStyle = row[EXCEL_COLUMNS.BATTING_STYLE_COLUMN];
        const runs = row[EXCEL_COLUMNS.RUNS_COLUMN];
        const wickets = row[EXCEL_COLUMNS.WICKETS_COLUMN];

        const resolvedImage = resolvePlayerImage(photo);

        return {
          id: (index + 1).toString(),
          firstName,
          lastName,
          grade,
          basePrice: config.gradeBasePrices[grade] || 1000000,
          status: "unsold" as const,
          imageOriginal: photo,
          imageUrl: resolvedImage.resolvedUrl,
          imageSource: resolvedImage.sourceKind,
          phoneNumber: phone,
          battingStyle,
          runs,
          wickets,
        };
      });

      const auctionState = {
        currentPlayerIndex: 0,
        currentBid: newPlayers[0]?.basePrice || 0,
        isAuctionActive: false,
        players: newPlayers,
        lastBidTeam: '',
        bidHistory: [],
        hasBids: false,
      };

      saveAuctionStateWithBroadcast(auctionState);
      setPlayers(newPlayers);
      setCurrentPlayerIndex(0);

      toast({
        title: "Players Uploaded",
        description: `Successfully loaded ${newPlayers.length} players from Excel file.`,
      });
    } catch (error) {
      console.error("Error uploading Excel:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to process Excel file. Please check the file format.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setLocation("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <NavBar 
        username={user.username} 
        userRole={user.role as 'admin' | 'owner' | 'viewer'} 
        onLogout={handleLogout}
      />
      
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-destructive" data-testid="icon-superadmin" />
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-superadmin">Super Admin Dashboard</h1>
            <p className="text-muted-foreground" data-testid="text-superadmin-description">
              Full editing access - All changes sync across all dashboards
            </p>
          </div>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" data-testid="tab-upload">
              <UploadIcon className="h-4 w-4 mr-2" />
              Upload Players
            </TabsTrigger>
            <TabsTrigger value="teams" data-testid="tab-teams">
              <DollarSign className="h-4 w-4 mr-2" />
              Teams & Purse
            </TabsTrigger>
            <TabsTrigger value="players" data-testid="tab-players">
              <Users className="h-4 w-4 mr-2" />
              Players
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <ExcelUpload onUpload={handleExcelUpload} />
            
            {players.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Status</CardTitle>
                  <CardDescription>
                    {players.length} players loaded in the database
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {players.filter(p => p.status === 'sold').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Sold</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">
                        {players.filter(p => p.status === 'unsold').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Unsold</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {players.length}
                      </p>
                      <p className="text-sm text-muted-foreground">Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="teams" className="space-y-4">
            {Object.entries(teams).map(([teamName, teamData]: [string, any]) => (
              <Card key={teamName}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{teamData.flag}</span>
                      <div>
                        <CardTitle data-testid={`text-team-${teamName}`}>{teamName}</CardTitle>
                        <CardDescription>
                          Players: {teamData.players?.length || 0}
                        </CardDescription>
                      </div>
                    </div>
                    {editingTeam === teamName ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveTeam(teamName)}
                          data-testid={`button-save-team-${teamName}`}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingTeam(null)}
                          data-testid={`button-cancel-team-${teamName}`}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditTeam(teamName)}
                        data-testid={`button-edit-team-${teamName}`}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Purse
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editingTeam === teamName ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`total-${teamName}`}>Total Purse</Label>
                        <Input
                          id={`total-${teamName}`}
                          type="number"
                          value={editValues.totalPurse}
                          onChange={(e) => setEditValues({ ...editValues, totalPurse: e.target.value })}
                          data-testid={`input-total-purse-${teamName}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`used-${teamName}`}>Used Purse</Label>
                        <Input
                          id={`used-${teamName}`}
                          type="number"
                          value={editValues.usedPurse}
                          onChange={(e) => setEditValues({ ...editValues, usedPurse: e.target.value })}
                          data-testid={`input-used-purse-${teamName}`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Purse</p>
                        <p className="text-lg font-semibold" data-testid={`text-total-purse-${teamName}`}>
                          {formatCurrency(teamData.totalPurse)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Used Purse</p>
                        <p className="text-lg font-semibold" data-testid={`text-used-purse-${teamName}`}>
                          {formatCurrency(teamData.usedPurse)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Remaining</p>
                        <p className="text-lg font-semibold text-green-600" data-testid={`text-remaining-purse-${teamName}`}>
                          {formatCurrency(teamData.totalPurse - teamData.usedPurse)}
                        </p>
                      </div>
                    </div>
                  )}

                  {teamData.players?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Squad ({teamData.players.length})</h4>
                      <ScrollArea className="h-[200px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Player</TableHead>
                              <TableHead>Grade</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {teamData.players.map((player: any, idx: number) => (
                              <TableRow key={idx}>
                                <TableCell data-testid={`text-player-${teamName}-${idx}`}>
                                  {player.firstName} {player.lastName}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={player.grade === 'A' ? 'default' : player.grade === 'B' ? 'secondary' : 'outline'}>
                                    {player.grade}
                                  </Badge>
                                </TableCell>
                                <TableCell data-testid={`text-price-${teamName}-${idx}`}>
                                  {formatCurrency(player.soldPrice || 0)}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleRemovePlayerFromTeam(teamName, idx)}
                                    data-testid={`button-remove-player-${teamName}-${idx}`}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="players" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Players</CardTitle>
                <CardDescription>
                  Edit player status, team assignments, and sold prices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Player</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Sold Price</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {players.map((player, idx) => (
                        <TableRow key={idx}>
                          {editingPlayer === idx ? (
                            <>
                              <TableCell>
                                <div className="space-y-2">
                                  <Input
                                    placeholder="First Name"
                                    value={editValues.firstName}
                                    onChange={(e) => setEditValues({ ...editValues, firstName: e.target.value })}
                                    data-testid={`input-firstname-${idx}`}
                                  />
                                  <Input
                                    placeholder="Last Name"
                                    value={editValues.lastName}
                                    onChange={(e) => setEditValues({ ...editValues, lastName: e.target.value })}
                                    data-testid={`input-lastname-${idx}`}
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={editValues.grade}
                                  onValueChange={(value) => setEditValues({ ...editValues, grade: value })}
                                >
                                  <SelectTrigger data-testid={`select-grade-${idx}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="A">A</SelectItem>
                                    <SelectItem value="B">B</SelectItem>
                                    <SelectItem value="C">C</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={editValues.status}
                                  onValueChange={(value) => setEditValues({ ...editValues, status: value })}
                                >
                                  <SelectTrigger data-testid={`select-status-${idx}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="sold">Sold</SelectItem>
                                    <SelectItem value="unsold">Unsold</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                {editValues.status === 'sold' && (
                                  <Select
                                    value={editValues.team}
                                    onValueChange={(value) => setEditValues({ ...editValues, team: value })}
                                  >
                                    <SelectTrigger data-testid={`select-team-${idx}`}>
                                      <SelectValue placeholder="Select Team" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {configTeams.map((team) => (
                                        <SelectItem key={team.name} value={team.name}>
                                          {team.flag} {team.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              </TableCell>
                              <TableCell>
                                {editValues.status === 'sold' && (
                                  <Input
                                    type="number"
                                    placeholder="Sold Price"
                                    value={editValues.soldPrice}
                                    onChange={(e) => setEditValues({ ...editValues, soldPrice: e.target.value })}
                                    data-testid={`input-soldprice-${idx}`}
                                  />
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSavePlayer(idx)}
                                    data-testid={`button-save-player-${idx}`}
                                  >
                                    <Save className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingPlayer(null)}
                                    data-testid={`button-cancel-player-${idx}`}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell data-testid={`text-player-${idx}`}>
                                {player.firstName} {player.lastName}
                              </TableCell>
                              <TableCell>
                                <Badge variant={player.grade === 'A' ? 'default' : player.grade === 'B' ? 'secondary' : 'outline'}>
                                  {player.grade}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={player.status === 'sold' ? 'default' : 'outline'} data-testid={`badge-status-${idx}`}>
                                  {player.status || 'unsold'}
                                </Badge>
                              </TableCell>
                              <TableCell data-testid={`text-team-${idx}`}>
                                {player.team || '-'}
                              </TableCell>
                              <TableCell data-testid={`text-soldprice-${idx}`}>
                                {player.soldPrice ? formatCurrency(player.soldPrice) : '-'}
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditPlayer(idx)}
                                  data-testid={`button-edit-player-${idx}`}
                                >
                                  <Edit2 className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Warning</CardTitle>
            </div>
            <CardDescription>
              All changes made here will immediately sync to Admin, Owner, and Viewer dashboards.
              Use with caution!
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
