import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, page = 1, num_pages = 1, date_posted, employment_types, remote_jobs_only, job_requirements } = await req.json();
    const JSEARCH_API_KEY = Deno.env.get("JSEARCH_API_KEY");
    if (!JSEARCH_API_KEY) throw new Error("JSEARCH_API_KEY is not configured");

    const params = new URLSearchParams({
      query: query || "software developer",
      page: String(page),
      num_pages: String(num_pages),
    });
    if (date_posted) params.set("date_posted", date_posted);
    if (employment_types) params.set("employment_types", employment_types);
    if (remote_jobs_only) params.set("remote_jobs_only", String(remote_jobs_only));
    if (job_requirements) params.set("job_requirements", job_requirements);

    const response = await fetch(`https://jsearch.p.rapidapi.com/search?${params.toString()}`, {
      headers: {
        "x-rapidapi-key": JSEARCH_API_KEY,
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("JSearch API error:", response.status, text);
      return new Response(JSON.stringify({ error: "Job search API error", status: response.status }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("search-jobs error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
