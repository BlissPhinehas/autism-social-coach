// src/index.ts
import { SocialSkillsAgent, type ChatRequest } from "./agent";

export { SocialSkillsAgent };

export default {
  async fetch(request: Request, env: any) {
    try {
      const url = new URL(request.url);
      let sessionId: string | null = url.searchParams.get("sessionId");

      if (request.method === "POST") {
        try {
          // Use a clone of the request to read the body, leaving the original for the DO
          const body: ChatRequest = await request.clone().json();
          if (body.sessionId) {
            sessionId = body.sessionId;
          }
        } catch (e) {
          // Ignore if body is not JSON or doesn't have sessionId
        }
      }

      if (!sessionId) {
        return new Response("Session ID is required.", { status: 400 });
      }

      const id = env.AGENT.idFromName(sessionId);
      const stub = env.AGENT.get(id);

      return await stub.fetch(request);
    } catch (err: any) {
      console.error("Error in worker fetch:", err);
      return new Response("Worker Error: " + err.message, { status: 500 });
    }
  }
};

