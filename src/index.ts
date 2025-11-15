import type {
  DurableObjectNamespace,
  DurableObjectStub,
} from "@cloudflare/workers-types";
import { SocialSkillsAgent } from "./agent";

interface ChatBody {
  sessionId?: string;
  parentMode?: boolean;
  message?: string;
}

interface ProgressBody {
  sessionId?: string;
}

interface ExerciseBody {
  exerciseType?: string;
  sessionId?: string;
}

interface Env {
  SOCIAL_SKILLS_AGENT: DurableObjectNamespace;
  // Use unknown instead of any to avoid disabling type checks.
  AI: unknown;
  ASSETS: unknown;
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
        const body = (await request.json()) as ChatBody;
        const { sessionId } = body || {};

        // Get or create agent instance for this session
        const agentId = env.SOCIAL_SKILLS_AGENT.idFromName(
          sessionId || "default-session"
        );
        const agent = env.SOCIAL_SKILLS_AGENT.get(agentId);

        // Call the agent's chat method via the Durable Object's fetch
        const response = await agent.fetch(request as any);
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
        const body = (await request.json()) as ProgressBody;
        const { sessionId } = body || {};
        const agentId = env.SOCIAL_SKILLS_AGENT.idFromName(
          sessionId || "default-session"
        );
        const agent = env.SOCIAL_SKILLS_AGENT.get(agentId);

        const response = await agent.fetch(request as any);
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
        const body = (await request.json()) as ExerciseBody;
        const { exerciseType, sessionId } = body || {};
        const agentId = env.SOCIAL_SKILLS_AGENT.idFromName(
          sessionId || "default-session"
        );
        const stub = env.SOCIAL_SKILLS_AGENT.get(
          agentId
        ) as DurableObjectStub & {
          startActivity?: (t: string) => Promise<unknown>;
        };

        if (stub.startActivity) {
          const resp = await stub.fetch(request as any);
          const result = await resp.json();
          return new Response(JSON.stringify(result), {
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }

        // Fallback for exercise API
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
      } catch (_error) {
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

    // Serve static assets from the 'src/frontend' directory
    try {
      // This requires a custom build step or a compatible bundler setup
      // to make the assets available to the worker.
      // For local dev with `wrangler dev`, you can configure `site` in `wrangler.jsonc`.
      const assets = env.ASSETS as { fetch: (req: Request) => Promise<Response> };
      const response = await assets.fetch(request);
      return response;

    } catch (e) {
      // If ASSETS binding is not configured or fails, return a simple message.
      return new Response("Not found. Static asset serving is not configured.", { status: 404 });
    }
  },
};

export { SocialSkillsAgent };
