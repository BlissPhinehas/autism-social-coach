import type {
  DurableObject,
  DurableObjectState,
  DurableObjectNamespace,
  ExecutionContext,
} from "@cloudflare/workers-types";
import { Request, Response } from "@cloudflare/workers-types";

export interface Env {
  AI: any;
  SOCIAL_SKILLS_AGENT: DurableObjectNamespace;
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

// Simplified state for the agent
interface AgentState {
  childName?: string;
  age?: number;
  preferences: {
    interests: string[];
  };
  currentActivity?: string;
  history: { role: "user" | "assistant"; content: string }[];
}

// The request structure from the frontend
interface ChatRequest {
  message: string;
  sessionId: string;
  state: {
    childName?: string;
    age?: number;
    preferences: {
      interests: string[];
    };
    currentActivity?: string;
  };
}

export class SocialSkillsAgent implements DurableObject {
  durableState: DurableObjectState;
  env: Env;

  constructor(durableObjectState: DurableObjectState, env: Env) {
    this.durableState = durableObjectState;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/chat") {
      return this.handleChat(request);
    }
    return new Response("Not Found", { status: 404 });
  }

  async handleChat(request: Request): Promise<Response> {
    try {
      const { message, sessionId, state: clientState } = await request.json<ChatRequest>();

      // Load or initialize state for the given session
      let agentState = await this.durableState.storage.get<AgentState>(sessionId);

      if (!agentState) {
        agentState = {
          childName: clientState.childName,
          age: clientState.age,
          preferences: { interests: clientState.preferences?.interests || [] },
          currentActivity: clientState.currentActivity,
          history: [],
        };
      } else {
        // Update state with latest from client if needed
        agentState.currentActivity = clientState.currentActivity;
      }
      
      // Add user message to history
      agentState.history.push({ role: "user", content: message });

      const response = await this.generateResponse(agentState);
      
      // Add assistant response to history
      agentState.history.push({ role: "assistant", content: response });

      // Prune history to keep it from getting too long
      if (agentState.history.length > 10) {
        agentState.history = agentState.history.slice(-10);
      }

      // Save the updated state
      await this.durableState.storage.put(sessionId, agentState);

      return new Response(JSON.stringify({ response }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error in handleChat:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  private async generateResponse(agentState: AgentState): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(agentState);
    
    const aiRequest = {
      messages: [
        { role: "system", content: systemPrompt },
        ...agentState.history,
      ],
    };

    const aiResponse: { response: string } = await this.env.AI.run(
      "@cf/meta/llama-3.1-8b-instruct",
      aiRequest,
    );

    return aiResponse.response;
  }

  private buildSystemPrompt(agentState: AgentState): string {
    const childProfile = {
      name: agentState.childName || "my friend",
      age: agentState.age || 7,
      interests: agentState.preferences.interests,
      currentActivity: agentState.currentActivity,
    };

    return `You are speaking with ${childProfile.name}, age ${
      childProfile.age
    }, who may be on the autism spectrum.

CRITICAL RULES (based on ASD communication research):

1.  **LITERAL LANGUAGE ONLY**: Absolutely no idioms, metaphors, or sarcasm. Say exactly what you mean.
2.  **CONCRETE & SPECIFIC**: Use visual, descriptive words.
3.  **ONE INSTRUCTION AT A TIME**: Give a single, clear direction.
4.  **EXPLICIT TRANSITIONS**: Announce topic changes clearly.
5.  **SPECIFIC PRAISE**: Name exactly what they did well. Praise effort.
6.  **PREDICTABLE STRUCTURE**: Use consistent greetings and closings.
7.  **INCORPORATE INTERESTS**: This child loves: ${
      childProfile.interests.length > 0
        ? childProfile.interests.join(", ")
        : "trains, dinosaurs, and space"
    }. Use these topics.
8.  **TONE**: Your tone is warm, calm, and patient. Like a kind teacher.
9.  **ASKING QUESTIONS**: Ask direct, closed questions. Avoid vague or rhetorical questions.

CURRENT ACTIVITY: ${childProfile.currentActivity || "general conversation"}
- Stay focused on this one activity.
- Ensure it has a clear beginning and a clear end.

Your responses must be short (1-2 simple sentences).`;
  }
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    try {
      const url = new URL(request.url);
      if (url.pathname.startsWith("/api/")) {
        // We use a single, named durable object to handle all sessions.
        const id = env.SOCIAL_SKILLS_AGENT.idFromName("agent-v2");
        const agent = env.SOCIAL_SKILLS_AGENT.get(id);
        return agent.fetch(request);
      }
      // Serve static assets from the `public` directory.
      // This requires a change in wrangler.toml to configure the static asset directory.
      // Assuming `public/index.html` is the entry point.
      return env.ASSETS.fetch(request);
    } catch (e: any) {
      return new Response(e.message);
    }
  },
};
