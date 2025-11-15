import { SocialSkillsAgent } from "./agent";

interface Env {
  SOCIAL_SKILLS_AGENT: DurableObjectNamespace;
  AI: any;
  ASSETS: any;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers for development
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // API Routes
    if (url.pathname === "/api/chat") {
      try {
        const body = (await request.json()) as any;
        const { sessionId } = body;

        // Get or create agent instance for this session
        const agentId = env.SOCIAL_SKILLS_AGENT.idFromName(
          sessionId || "default-session"
        );
        const agent = env.SOCIAL_SKILLS_AGENT.get(agentId);

        // Call the agent's chat method
        const response = await agent.fetch(request);
        const result = await response.json();

        return new Response(JSON.stringify(result), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      } catch (_error) {
        return new Response(
          JSON.stringify({ error: "Failed to process message" }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          }
        );
      }
    }

    if (url.pathname === "/api/progress") {
      try {
        const body = (await request.json()) as any;
        const { sessionId } = body;
        const agentId = env.SOCIAL_SKILLS_AGENT.idFromName(
          sessionId || "default-session"
        );
        const agent = env.SOCIAL_SKILLS_AGENT.get(agentId);

        const response = await agent.fetch(request);
        const result = await response.json();

        return new Response(JSON.stringify(result), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      } catch (_error) {
        return new Response(
          JSON.stringify({ error: "Failed to get progress" }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          }
        );
      }
    }

    if (url.pathname === "/api/exercise") {
      try {
        const body = (await request.json()) as any;
        const { exerciseType, sessionId } = body;
        const agentId = env.SOCIAL_SKILLS_AGENT.idFromName(
          sessionId || "default-session"
        );
        const stub = env.SOCIAL_SKILLS_AGENT.get(agentId) as any;

        // Call startActivity method (Durable Object implementation may expose
        // a custom method; cast to any to avoid TS complaints)
        const result = await stub.startActivity(exerciseType);

        return new Response(JSON.stringify(result), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: "Failed to start activity" }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          }
        );
      }
    }

    // Serve static frontend (if using Pages)
    // If the request is not for our API, proxy it to the Pages-hosted static
    // frontend. This works around client-side TLS issues some users experience
    // when connecting directly to the Pages domain: the browser talks to the
    // Worker (which has a valid TLS endpoint) and the Worker fetches the Pages
    // content from Cloudflare and returns it.
    if (request.method === "GET" && !url.pathname.startsWith("/api")) {
      // Proxy to the currently published Pages site. Updated to the active
      // deployment hostname so the Worker returns the same frontend.
      const pagesOrigin = "https://9288a763.autism-social-coach.pages.dev";
      const pagesUrl = pagesOrigin + url.pathname + url.search;
      try {
        const resp = await fetch(pagesUrl, {
          headers: request.headers,
          redirect: 'manual'
        });
        // Return the fetched response directly (preserves content-type, etc.)
        return resp;
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Failed to fetch frontend' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Default response
    return new Response("AI Social Skills Coach API", {
      headers: { "Content-Type": "text/plain", ...corsHeaders }
    });
  }
};

// Export the Durable Object
export { SocialSkillsAgent };
