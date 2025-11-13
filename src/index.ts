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
          JSON.stringify({ error: "Failed to start exercise" }),
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
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    // Default response
    return new Response("AI Social Skills Coach API", {
      headers: { "Content-Type": "text/plain", ...corsHeaders }
    });
  }
};

// Export the Durable Object
export { SocialSkillsAgent };
