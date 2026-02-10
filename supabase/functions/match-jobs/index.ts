import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { jobs, resumeText } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return new Response(JSON.stringify({ scores: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!resumeText || resumeText.trim().length === 0) {
      const defaultScores = jobs.map((job: any) => ({
        job_id: job.job_id,
        score: 0,
        matched_skills: [],
        explanation: "No resume uploaded yet. Upload your resume to see match scores.",
      }));
      return new Response(JSON.stringify({ scores: defaultScores }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Batch jobs into a single AI call for efficiency
    const jobSummaries = jobs.slice(0, 20).map((job: any, i: number) => 
      `JOB ${i + 1} (ID: ${job.job_id}): ${job.job_title} at ${job.employer_name}. Description: ${(job.job_description || "").substring(0, 500)}`
    ).join("\n\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a job matching expert. Score each job against the candidate's resume from 0-100. Return ONLY a valid JSON array. Each element must have: job_id (string), score (integer 0-100), matched_skills (string array of 2-5 matched skills), explanation (1 sentence explaining the match). Be realistic - only high scores for strong alignment.`,
          },
          {
            role: "user",
            content: `RESUME:\n${resumeText.substring(0, 3000)}\n\nJOBS:\n${jobSummaries}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_match_scores",
              description: "Return match scores for jobs against resume",
              parameters: {
                type: "object",
                properties: {
                  scores: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        job_id: { type: "string" },
                        score: { type: "integer" },
                        matched_skills: { type: "array", items: { type: "string" } },
                        explanation: { type: "string" },
                      },
                      required: ["job_id", "score", "matched_skills", "explanation"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["scores"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_match_scores" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ scores: parsed.scores }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Unexpected AI response format");
  } catch (e) {
    console.error("match-jobs error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", scores: [] }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
