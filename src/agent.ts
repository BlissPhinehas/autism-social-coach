/// <reference types="@cloudflare/workers-types" />

// src/agent.ts

export interface AgentState {
  childName?: string;
  age?: number;
  preferences?: { interests: string[] };
  mode?: string; // normal | number_game | story_time | morning_routine | feelings | praise
  history: { role: "user" | "assistant"; content: string }[];
  stars?: number;
  numberGame?: { question?: string; answer?: number };
}

export interface ChatRequest {
  message?: string;
  sessionId: string;
  mode?: string;
  state?: {
    childName?: string;
    age?: number;
    preferences?: { interests: string[] };
    currentActivity?: string;
  };
}

export class SocialSkillsAgent {
  durableState: DurableObjectState;
  env: any;

  constructor(state: DurableObjectState, env: any) {
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
      const body = await request.json<ChatRequest>();
      const { message = "", sessionId, mode: uiMode, state: clientState } = body;

      let agentState =
        (await this.durableState.storage.get<AgentState>(sessionId)) || {
          childName: clientState?.childName || "friend",
          age: clientState?.age,
          preferences: clientState?.preferences || { interests: [] },
          mode: "normal",
          history: [],
          stars: 0
        };

      if (clientState?.childName) agentState.childName = clientState.childName;
      if (clientState?.age) agentState.age = clientState.age;
      if (clientState?.preferences) agentState.preferences = clientState.preferences;

      if (uiMode) {
        agentState.mode = uiMode;
      } else {
        const detected = this.detectModeFromText(message);
        if (detected) agentState.mode = detected;
      }

      if (message && message.trim().length > 0) {
        agentState.history.push({ role: "user", content: message });
      }

      let reply = "";
      switch (agentState.mode) {
        case "number_game":
          reply = await this.handleNumberGame(agentState, message);
          break;
        case "story_time":
          reply = await this.handleStoryTime(agentState, message);
          break;
        case "morning_routine":
          reply = await this.handleMorningRoutine(agentState, message);
          break;
        case "feelings":
          reply = await this.handleFeelings(agentState, message);
          break;
        case "praise":
          reply = await this.handlePraise(agentState, message);
          break;
        default:
          reply = await this.generateResponseWithLlama(agentState, message);
      }

      agentState.history.push({ role: "assistant", content: reply });
      if (agentState.history.length > 20) agentState.history = agentState.history.slice(-20);
      await this.durableState.storage.put(sessionId, agentState);

      return new Response(JSON.stringify({ response: reply }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (err: any) {
      console.error("handleChat error:", err);
      return new Response(
        JSON.stringify({ response: "I'm here — can you say that again in a few words?" }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
      );
    }
  }

  private detectModeFromText(text: string): string | null {
    if (!text) return null;
    const t = text.toLowerCase();
    if (t.includes("number game") || t.includes("math") || t.includes("count")) return "number_game";
    if (t.includes("story") || t.includes("story time") || t.includes("tell me a story")) return "story_time";
    if (t.includes("morning") || t.includes("routine") || t.includes("get ready")) return "morning_routine";
    if (t.includes("feel") || t.includes("how i feel") || t.includes("feelings")) return "feelings";
    if (t.includes("praise") || t.includes("star") || t.includes("good job")) return "praise";
    return null;
  }

  private async handleNumberGame(agentState: AgentState, message: string): Promise<string> {
    if (agentState.numberGame?.answer != null && message) {
      const parsed = parseInt(message.replace(/[^\d-]/g, ""), 10);
      if (!isNaN(parsed)) {
        const correctAnswer = agentState.numberGame.answer;
        agentState.numberGame = {};
        if (parsed === correctAnswer) {
          agentState.stars = (agentState.stars || 0) + 1;
          return `That's correct! You're a math wizard! You get a star! ⭐`;
        } else {
          return `Good try! The answer was ${correctAnswer}. Let's try another one!`;
        }
      }
    }

    const a = Math.floor(Math.random() * 6) + 1;
    const b = Math.floor(Math.random() * 6) + 1;
    agentState.numberGame = { question: `What is ${a} + ${b}?`, answer: a + b };
    return `Let's play a number game! What is ${a} + ${b}?`;
  }

  private async handleStoryTime(agentState: AgentState, _message: string): Promise<string> {
    const prompt = `Tell a short 2-sentence imaginative story for a child who likes ${agentState.preferences?.interests?.join(", ") || "trains and dinosaurs"}. Keep it simple and literal.`;
    const story = await this.runLLMOnce(prompt);
    return story || "Once upon a time, a friendly train named Zeal went on an adventure to find a glowing star.";
  }

  private async handleMorningRoutine(agentState: AgentState, message: string): Promise<string> {
    const lc = (message || "").toLowerCase();
    if (lc.includes("brushed") || lc.includes("teeth") || lc.includes("brushed teeth") || lc.includes("showered")) {
      agentState.stars = (agentState.stars || 0) + 1;
      return `Great job on brushing your teeth! You earned a star! ⭐`;
    }
    return "Let's get ready for a great day! What have you done so far?";
  }

  private async handleFeelings(agentState: AgentState, message: string): Promise<string> {
    const lc = (message || "").toLowerCase();
    const feelingsKeywords = ["happy", "sad", "angry", "scared", "tired", "excited"];
    for (const f of feelingsKeywords) {
      if (lc.includes(f)) {
        return `I heard that you are ${f}. Can you tell me one thing that made you feel ${f}?`;
      }
    }
    return "It's great to talk about our feelings. How are you feeling right now? (Happy, sad, tired...)";
  }

  private async handlePraise(agentState: AgentState, _message: string): Promise<string> {
    const s = agentState.stars || 0;
    if (s <= 0) return "You don't have any stars yet. Let's try an activity to earn one!";
    return `You have ${s} star${s === 1 ? "" : "s"}! Great work — keep going! ⭐`;
  }

  private async generateResponseWithLlama(agentState: AgentState, userMessage: string): Promise<string> {
    const system = this.buildSystemPrompt(agentState);
    const messages = [
      { role: "system", content: system },
      ...agentState.history.map(h => ({ role: h.role, content: h.content })),
      { role: "user", content: userMessage || "" }
    ];
    try {
      const raw: any = await this.env.AI.run("@cf/meta/llama-3.3-8b-instruct", { messages }, { temperature: 0.2, max_output_tokens: 200 });
      const text =
        raw?.response ||
        raw?.result?.response ||
        (Array.isArray(raw?.result) && raw.result[0]?.content) ||
        raw?.result ||
        raw;
      return typeof text === "string" && text.trim().length > 0 ? text.trim() : this.simpleFallbackReply(agentState);
    } catch (err) {
      console.error("AI.run error:", err);
      return this.simpleFallbackReply(agentState);
    }
  }

  private buildSystemPrompt(agentState: AgentState): string {
    const interests = (agentState.preferences?.interests || []).join(", ") || "trains, dinosaurs, and space";
    return `You are a kind, calm tutor speaking to a child who may be on the autism spectrum.
Rules:
- Literal language only. No metaphors or sarcasm.
- Use short, concrete sentences (1-2 short sentences).
- Give one instruction at a time.
- Use the child's interests: ${interests}.
- Ask direct closed questions when possible.
- If something is unclear, acknowledge and ask one clear follow-up.
CURRENT ACTIVITY MODE: ${agentState.mode || "normal"}.`;
  }

  private async runLLMOnce(prompt: string): Promise<string | null> {
    try {
      const raw: any = await this.env.AI.run("@cf/meta/llama-3.3-8b-instruct", {
        messages: [{ role: "system", content: prompt }]
      }, { temperature: 0.2, max_output_tokens: 150 });
      const text =
        raw?.response ||
        raw?.result?.response ||
        (Array.isArray(raw?.result) && raw.result[0]?.content) ||
        raw?.result ||
        raw;
      return typeof text === "string" ? text.trim() : String(text);
    } catch (e) {
      console.error("runLLMOnce error", e);
      return null;
    }
  }

  private simpleFallbackReply(agentState: AgentState): string {
    const last = agentState.history.slice().reverse().find(h => h.role === "user");
    const name = agentState.childName || "friend";
    if (!last || !last.content) return `Hi ${name}! Can you tell me one thing you did today?`;
    const lc = last.content.toLowerCase();
    if (lc.includes("finished") || lc.includes("i finished") || lc.includes("done")) {
      agentState.stars = (agentState.stars || 0) + 1;
      return `Great job! That was awesome — you earned a star! ⭐`;
    }
    return `I heard: "${last.content}". Can you tell me more in one sentence?`;
  }
}
