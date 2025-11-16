import { SocialSkillsAgent } from "./agent";
import { DurableObjectNamespace, ExecutionContext, Request, Response } from "@cloudflare/workers-types";

export interface Env {
  AI: any;
  SOCIAL_SKILLS_AGENT: DurableObjectNamespace;
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Route API requests to the Durable Object stub
    if (url.pathname.startsWith("/api/")) {
      const id = env.SOCIAL_SKILLS_AGENT.idFromName("agent-v2");
      const agentStub = env.SOCIAL_SKILLS_AGENT.get(id);
      return agentStub.fetch(request);
    }

    // Otherwise, serve static assets
    return env.ASSETS.fetch(request);
  },
};

export { SocialSkillsAgent };
