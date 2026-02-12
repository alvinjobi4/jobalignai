import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Search, Trophy, Target, Activity, Users, Loader2 } from "lucide-react";

type Team = { id: number; name: string; logo: string; country: string };

type Prediction = {
  winner: string;
  winProbability: { team1: number; draw: number; team2: number };
  possession: { team1: number; team2: number };
  passes: { team1: number; team2: number };
  shots: { team1: number; team2: number };
  shotsOnTarget: { team1: number; team2: number };
  predictedScore: { team1: number; team2: number };
  bestPlayer: {
    team1: { name: string; position: string; reason: string };
    team2: { name: string; position: string; reason: string };
  };
  analysis: string;
};

export default function PredictionPage() {
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [teams1, setTeams1] = useState<Team[]>([]);
  const [teams2, setTeams2] = useState<Team[]>([]);
  const [selected1, setSelected1] = useState<Team | null>(null);
  const [selected2, setSelected2] = useState<Team | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [searching, setSearching] = useState<1 | 2 | null>(null);
  const [predicting, setPredicting] = useState(false);
  const { toast } = useToast();

  const searchTeams = async (query: string, slot: 1 | 2) => {
    if (!query.trim()) return;
    setSearching(slot);
    try {
      const { data, error } = await supabase.functions.invoke("football-predict", {
        body: { action: "search-teams", team1: query },
      });
      if (error) throw error;
      if (slot === 1) setTeams1(data.teams || []);
      else setTeams2(data.teams || []);
    } catch (e: any) {
      toast({ title: "Search failed", description: e.message, variant: "destructive" });
    } finally {
      setSearching(null);
    }
  };

  const predict = async () => {
    if (!selected1 || !selected2) return;
    setPredicting(true);
    setPrediction(null);
    try {
      const { data, error } = await supabase.functions.invoke("football-predict", {
        body: {
          action: "predict",
          team1: selected1.name,
          team2: selected2.name,
          team1Id: selected1.id,
          team2Id: selected2.id,
        },
      });
      if (error) throw error;
      setPrediction(data.prediction);
    } catch (e: any) {
      toast({ title: "Prediction failed", description: e.message, variant: "destructive" });
    } finally {
      setPredicting(false);
    }
  };

  const StatBar = ({ label, v1, v2, icon: Icon, suffix = "" }: { label: string; v1: number; v2: number; icon: any; suffix?: string }) => {
    const total = v1 + v2 || 1;
    const p1 = (v1 / total) * 100;
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">{v1}{suffix}</span>
          <span className="flex items-center gap-1 text-muted-foreground text-xs">
            <Icon className="h-3.5 w-3.5" /> {label}
          </span>
          <span className="font-semibold">{v2}{suffix}</span>
        </div>
        <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
          <div className="bg-emerald-500 transition-all duration-700" style={{ width: `${p1}%` }} />
          <div className="bg-blue-500 transition-all duration-700" style={{ width: `${100 - p1}%` }} />
        </div>
      </div>
    );
  };

  return (
    <main className="container max-w-4xl py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Trophy className="h-8 w-8 text-amber-500" />
          Football Match Predictor
        </h1>
        <p className="text-muted-foreground">AI-powered match predictions using real team data</p>
      </div>

      {/* Team Selection */}
      <div className="grid gap-6 md:grid-cols-2">
        {[{ slot: 1 as const, search: search1, setSearch: setSearch1, teams: teams1, selected: selected1, setSelected: setSelected1, setTeams: setTeams1 },
          { slot: 2 as const, search: search2, setSearch: setSearch2, teams: teams2, selected: selected2, setSelected: setSelected2, setTeams: setTeams2 }]
          .map(({ slot, search, setSearch, teams, selected, setSelected, setTeams }) => (
            <Card key={slot} className={selected ? "border-primary/50" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Team {slot}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selected ? (
                  <div className="flex items-center gap-3">
                    <img src={selected.logo} alt={selected.name} className="h-12 w-12 object-contain" />
                    <div>
                      <p className="font-semibold">{selected.name}</p>
                      <p className="text-xs text-muted-foreground">{selected.country}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-auto" onClick={() => { setSelected(null); setTeams([]); }}>
                      Change
                    </Button>
                  </div>
                ) : (
                  <>
                    <form onSubmit={(e) => { e.preventDefault(); searchTeams(search, slot); }} className="flex gap-2">
                      <Input placeholder="Search team name..." value={search} onChange={(e) => setSearch(e.target.value)} />
                      <Button type="submit" size="icon" disabled={searching === slot}>
                        {searching === slot ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      </Button>
                    </form>
                    {teams.length > 0 && (
                      <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-1">
                        {teams.map((t) => (
                          <button key={t.id} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent" onClick={() => { setSelected(t); setTeams([]); }}>
                            <img src={t.logo} alt={t.name} className="h-6 w-6 object-contain" />
                            <span>{t.name}</span>
                            <span className="ml-auto text-xs text-muted-foreground">{t.country}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
      </div>

      <div className="flex justify-center">
        <Button size="lg" onClick={predict} disabled={!selected1 || !selected2 || predicting} className="gap-2 px-8">
          {predicting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Activity className="h-5 w-5" />}
          {predicting ? "Analyzing Match..." : "Predict Match"}
        </Button>
      </div>

      {/* Results */}
      {prediction && selected1 && selected2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Score & Winner */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500/10 via-transparent to-blue-500/10 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <img src={selected1.logo} alt={selected1.name} className="h-14 w-14 object-contain" />
                  <div>
                    <p className="font-bold text-lg">{selected1.name}</p>
                    <p className="text-xs text-muted-foreground">{prediction.winProbability.team1}% win</p>
                  </div>
                </div>
                <div className="text-center px-6">
                  <p className="text-4xl font-bold tracking-tight">
                    {prediction.predictedScore.team1} – {prediction.predictedScore.team2}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{prediction.winProbability.draw}% draw</p>
                </div>
                <div className="flex items-center gap-3 flex-1 justify-end text-right">
                  <div>
                    <p className="font-bold text-lg">{selected2.name}</p>
                    <p className="text-xs text-muted-foreground">{prediction.winProbability.team2}% win</p>
                  </div>
                  <img src={selected2.logo} alt={selected2.name} className="h-14 w-14 object-contain" />
                </div>
              </div>
              <p className="text-center mt-3 text-sm font-medium text-primary">
                Predicted Winner: {prediction.winner}
              </p>
            </div>
          </Card>

          {/* Match Stats */}
          <Card>
            <CardHeader><CardTitle className="text-base">Predicted Match Stats</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <StatBar label="Possession" v1={prediction.possession.team1} v2={prediction.possession.team2} icon={Activity} suffix="%" />
              <StatBar label="Passes" v1={prediction.passes.team1} v2={prediction.passes.team2} icon={Target} />
              <StatBar label="Shots" v1={prediction.shots.team1} v2={prediction.shots.team2} icon={Target} />
              <StatBar label="Shots on Target" v1={prediction.shotsOnTarget.team1} v2={prediction.shotsOnTarget.team2} icon={Target} />
            </CardContent>
          </Card>

          {/* Best Players */}
          <div className="grid gap-4 md:grid-cols-2">
            {[{ team: selected1, player: prediction.bestPlayer.team1, color: "emerald" },
              { team: selected2, player: prediction.bestPlayer.team2, color: "blue" }].map(({ team, player, color }) => (
              <Card key={team.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Best Player – {team.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-bold">{player.name}</p>
                  <p className="text-xs text-muted-foreground mb-1">{player.position}</p>
                  <p className="text-sm">{player.reason}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Analysis */}
          <Card>
            <CardHeader><CardTitle className="text-base">Match Analysis</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{prediction.analysis}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
