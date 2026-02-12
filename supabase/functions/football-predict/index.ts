import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const API_FOOTBALL_BASE = "https://v3.football.api-sports.io";

async function apiFetch(endpoint: string, params: Record<string, string>) {
  const API_KEY = Deno.env.get("API_FOOTBALL_KEY");
  if (!API_KEY) throw new Error("API_FOOTBALL_KEY not configured");

  const url = new URL(`${API_FOOTBALL_BASE}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const resp = await fetch(url.toString(), {
    headers: { "x-apisports-key": API_KEY },
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`API-Football error ${resp.status}: ${t}`);
  }
  return resp.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, team1, team2, team1Id, team2Id } = await req.json();

    // Search teams by name
    if (action === "search-teams") {
      const query = team1;
      const data = await apiFetch("/teams", { search: query });
      const teams = (data.response || []).map((t: any) => ({
        id: t.team.id,
        name: t.team.name,
        logo: t.team.logo,
        country: t.team.country,
      }));
      return new Response(JSON.stringify({ teams }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Predict match
    if (action === "predict") {
      if (!team1Id || !team2Id) throw new Error("Both team IDs required");

      // Fetch data in parallel
      const currentYear = new Date().getFullYear();
      const season = currentYear; // current season

      const [team1Stats, team2Stats, h2h, team1Squad, team2Squad] = await Promise.all([
        apiFetch("/teams/statistics", { team: String(team1Id), season: String(season), league: "39" }).catch(() => null),
        apiFetch("/teams/statistics", { team: String(team2Id), season: String(season), league: "39" }).catch(() => null),
        apiFetch("/fixtures/headtohead", { h2h: `${team1Id}-${team2Id}`, last: "5" }).catch(() => null),
        apiFetch("/players/squads", { team: String(team1Id) }).catch(() => null),
        apiFetch("/players/squads", { team: String(team2Id) }).catch(() => null),
      ]);

      // Build context for AI
      const context = {
        team1: { id: team1Id, name: team1, stats: team1Stats?.response || null },
        team2: { id: team2Id, name: team2, stats: team2Stats?.response || null },
        headToHead: (h2h?.response || []).slice(0, 5),
        team1Squad: (team1Squad?.response?.[0]?.players || []).slice(0, 20),
        team2Squad: (team2Squad?.response?.[0]?.players || []).slice(0, 20),
      };

      // Use Lovable AI for prediction
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

      const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          tools: [
            {
              type: "function",
              function: {
                name: "match_prediction",
                description: "Return structured football match prediction",
                parameters: {
                  type: "object",
                  properties: {
                    winner: { type: "string", description: "Predicted winner team name or 'Draw'" },
                    winProbability: { type: "object", properties: { team1: { type: "number" }, draw: { type: "number" }, team2: { type: "number" } }, required: ["team1", "draw", "team2"] },
                    possession: { type: "object", properties: { team1: { type: "number" }, team2: { type: "number" } }, required: ["team1", "team2"] },
                    passes: { type: "object", properties: { team1: { type: "number" }, team2: { type: "number" } }, required: ["team1", "team2"] },
                    shots: { type: "object", properties: { team1: { type: "number" }, team2: { type: "number" } }, required: ["team1", "team2"] },
                    shotsOnTarget: { type: "object", properties: { team1: { type: "number" }, team2: { type: "number" } }, required: ["team1", "team2"] },
                    predictedScore: { type: "object", properties: { team1: { type: "number" }, team2: { type: "number" } }, required: ["team1", "team2"] },
                    bestPlayer: { type: "object", properties: {
                      team1: { type: "object", properties: { name: { type: "string" }, position: { type: "string" }, reason: { type: "string" } }, required: ["name", "position", "reason"] },
                      team2: { type: "object", properties: { name: { type: "string" }, position: { type: "string" }, reason: { type: "string" } }, required: ["name", "position", "reason"] }
                    }, required: ["team1", "team2"] },
                    analysis: { type: "string", description: "Brief match analysis explaining predictions" }
                  },
                  required: ["winner", "winProbability", "possession", "passes", "shots", "shotsOnTarget", "predictedScore", "bestPlayer", "analysis"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "match_prediction" } },
          messages: [
            {
              role: "system",
              content: `You are an expert football analyst. Analyze the provided match data and make predictions. Use real football knowledge, team form, head-to-head records, and squad quality. Provide realistic predictions based on the data. Possession should sum to 100. All numbers should be realistic match stats.`,
            },
            {
              role: "user",
              content: `Predict the match between ${team1} and ${team2}. Here is the available data:\n\n${JSON.stringify(context, null, 2)}`,
            },
          ],
        }),
      });

      if (!aiResp.ok) {
        if (aiResp.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (aiResp.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const t = await aiResp.text();
        console.error("AI error:", aiResp.status, t);
        throw new Error("AI prediction failed");
      }

      const aiData = await aiResp.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) throw new Error("No prediction generated");

      const prediction = JSON.parse(toolCall.function.arguments);

      return new Response(JSON.stringify({ prediction, team1, team2 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("football-predict error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
