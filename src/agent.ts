import {
  DurableObject,
  DurableObjectState,
  DurableObjectNamespace,
  Request,
  Response,
} from "@cloudflare/workers-types";

export interface Env {
  AI: any;
  SOCIAL_SKILLS_AGENT: DurableObjectNamespace;
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

interface AgentState {
  childName?: string;
  age?: number;
  preferences: { interests: string[] };
  currentActivity?: string;
  history: { role: "user" | "assistant"; content: string }[];
}

interface ChatRequest {
  message: string;
  sessionId: string;
  state: {
    childName?: string;
    age?: number;
    preferences: { interests: string[] };
    currentActivity?: string;
  };
}

export class SocialSkillsAgent implements DurableObject {
  durableState: DurableObjectState;
  env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.durableState = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/chat") {
      return this.handleChat(request);
    }
    return new Response("Not Found", { status: 404 });
  }

  private async handleChat(request: Request): Promise<Response> {
    try {
      const body: ChatRequest = await request.json();

      // Load or initialize state
      let agentState = await this.durableState.storage.get<AgentState>(body.sessionId);
      if (!agentState) {
        agentState = {
          childName: body.state.childName,
          age: body.state.age,
          preferences: { interests: body.state.preferences?.interests || [] },
          currentActivity: body.state.currentActivity,
          history: [],
        };
      } else {
        agentState.currentActivity = body.state.currentActivity;
      }

      agentState.history.push({ role: "user", content: body.message });

      const responseText = await this.generateResponse(agentState);

      agentState.history.push({ role: "assistant", content: responseText });

      if (agentState.history.length > 10) {
        agentState.history = agentState.history.slice(-10);
      }

      await this.durableState.storage.put(body.sessionId, agentState);

      return new Response(JSON.stringify({ response: responseText }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Error in handleChat:", err);
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  private async generateResponse(agentState: AgentState): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(agentState);

    const aiRequest = {
      messages: [{ role: "system", content: systemPrompt }, ...agentState.history],
    };

    const raw: any = await this.env.AI.run("@cf/meta/llama-3.1-8b-instruct", aiRequest);

    const text = raw?.response || raw?.result?.response || raw?.result || raw;

    return typeof text === "string" ? text : JSON.stringify(text);
  }

  private buildSystemPrompt(agentState: AgentState): string {
    const childProfile = {
      name: agentState.childName || "my friend",
      age: agentState.age || 7,
      interests: agentState.preferences.interests,
      currentActivity: agentState.currentActivity,
    };

    return `You are speaking with ${childProfile.name}, age ${childProfile.age}, who may be on the autism spectrum.
CRITICAL RULES (ASD communication):
1. Literal language only.
2. Concrete & specific.
3. One instruction at a time.
4. Explicit transitions.
5. Specific praise.
6. Predictable structure.
7. Incorporate interests: ${childProfile.interests.join(", ") || "trains, dinosaurs, and space"}.
8. Tone: warm, calm, patient.
9. Ask direct, closed questions.
CURRENT ACTIVITY: ${childProfile.currentActivity || "general conversation"}`;
  }
}
