import { Agent } from "agents";

interface ConversationState {
  childName?: string;
  age?: number;
  conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: number;
  }>;
  currentActivity?: string;
  activitiesCompleted: string[];
  lastInteraction?: number;
  preferences: {
    lovesMath: boolean;
    favoriteColor?: string;
    interests: string[];
  };
}

export class SocialSkillsAgent extends Agent {
  // Keep state compatible with the base Agent type by using a permissive any
  // instance property. This avoids incorrect visibility/override errors with
  // the Agent base class while still allowing a structured default value.
  // Use accessors to read/write the Agent's internal state so we don't
  // conflict with the base class' `state` accessor definition.
  public get state(): any {
    return (this as any)._state;
  }

  public set state(v: any) {
    (this as any)._state = v;
  }

  async onStart() {
    const savedState = await this.loadState();
    if (savedState) {
      this.state = { ...this.state, ...savedState };
    }
  }

  async chat(message: string, metadata?: { parentMode?: boolean }) {
    const timestamp = Date.now();

    this.state.conversationHistory.push({
      role: "user",
      content: message,
      timestamp
    });

    // Setup mode
    if (metadata?.parentMode || !this.state.childName) {
      return await this.handleSetup(message);
    }

    const response = await this.generateResponse(message);

    this.state.conversationHistory.push({
      role: "assistant",
      content: response,
      timestamp: Date.now()
    });

    this.state.lastInteraction = Date.now();
    await this.saveState();

    return {
      response,
      currentActivity: this.state.currentActivity,
      activitiesCompleted: this.state.activitiesCompleted
    };
  }

  private async handleSetup(message: string) {
    const lowerMsg = message.toLowerCase();

    if (!this.state.childName) {
      const nameMatch = message.match(
        /(?:name is |called |i'm |im |my name is )([\w]+)/i
      );
      if (nameMatch) {
        this.state.childName = nameMatch[1];
      }
    }

    if (!this.state.age) {
      const ageMatch = message.match(/(\d+)/);
      if (ageMatch) {
        this.state.age = parseInt(ageMatch[1]);
      }
    }

    // Detect preferences
    if (lowerMsg.includes("math") || lowerMsg.includes("numbers")) {
      this.state.preferences.lovesMath = true;
    }

    if (lowerMsg.includes("green")) {
      this.state.preferences.favoriteColor = "green";
    }

    await this.saveState();

    if (this.state.childName && this.state.age) {
      return {
        response: `Hi ${this.state.childName}! I'm so happy to meet you! I'm your forest friend and I'm here to do fun things with you. Ready to start?`,
        setupComplete: true,
        childName: this.state.childName
      };
    }

    return {
      response: "Hi! What's your name?",
      setupComplete: false
    };
  }

  private async generateResponse(userMessage: string): Promise<string> {
    const systemPrompt = this.buildSystemPrompt();
    const conversationContext = this.getRecentContext();

    try {
      const response = await this.env.AI.run(
        "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
        {
          messages: [
            { role: "system", content: systemPrompt },
            ...conversationContext,
            { role: "user", content: userMessage }
          ],
          max_tokens: 150,
          temperature: 0.8
        }
      );

      // Normalize the SDK response: it may return a plain string or an
      // object with a `response` property depending on runtime. Handle both.
      if (typeof response === "string") return response;
      if ((response as any)?.response) return (response as any).response;
      return String(response) || "That's great! What else?";
    } catch (error) {
      console.error("AI Error:", error);
      return "I'm listening! Keep going!";
    }
  }

  private buildSystemPrompt(): string {
    const childName = this.state.childName || "friend";
    const age = this.state.age || 8;
    const lovesMath = this.state.preferences.lovesMath;
    const activity = this.state.currentActivity;

    let activityContext = "";

    if (activity === "morning-routine") {
      activityContext = `You are helping ${childName} with their morning routine. Guide them step by step through brushing teeth, getting dressed, eating breakfast. Use encouraging language like "Great job!" and "You're doing amazing!". Ask them to confirm when each step is done.`;
    } else if (activity === "math-fun") {
      activityContext = `You are doing math with ${childName}. Ask simple addition or subtraction problems appropriate for age ${age}. Celebrate correct answers enthusiastically. If wrong, gently guide them. Make it fun with forest animals (like "If you have 3 squirrels and 2 more come, how many squirrels?").`;
    } else if (activity === "praise-time") {
      activityContext = `This is praise time. Ask ${childName} what they did well today. Celebrate their achievements enthusiastically. Use specific praise like "You did such a good job brushing your teeth!" Ask follow up questions about what made them proud.`;
    } else if (activity === "feelings-check") {
      activityContext = `Help ${childName} identify and name their feelings. Ask "How are you feeling right now?" with specific emotion words as examples. If they're upset, acknowledge it and help them describe it. Be warm and validating.`;
    } else if (activity === "story-time") {
      activityContext = `Tell ${childName} a very short story about forest animals. Keep it to 3-4 sentences. Then ask them a simple question about it. Make it interactive and fun.`;
    } else {
      activityContext = `Have a friendly conversation with ${childName}. Ask specific questions about their day, their interests, or what they're doing. Be warm and engaging like a caring friend.`;
    }

    return `You are a patient, warm friend talking with ${childName}, who is ${age} years old and has autism.

CRITICAL RULES:
- Use simple, concrete words. No idioms or sarcasm.
- Be encouraging and positive - celebrate everything!
- Speak like you're talking to a young child: warm, gentle, excited for them
- Keep responses to 1-2 short sentences
- Ask ONE specific question at a time, never multiple
- ${lovesMath ? "This child loves math - include numbers when possible!" : ""}
- Never say "tell me more" - ask specific questions instead
- Use their name sometimes to keep it personal

CURRENT ACTIVITY: ${activity || "general conversation"}
${activityContext}

Tone: Like a kind teacher or loving parent - warm, clear, enthusiastic, patient.`;
  }

  private getRecentContext() {
    return this.state.conversationHistory.slice(-8).map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));
  }

  async startActivity(activityType: string) {
    this.state.currentActivity = activityType;
    await this.saveState();

    const activities: Record<string, string> = {
      "morning-routine": `Good morning ${this.state.childName}! Let's do your morning routine together. First, did you brush your teeth yet?`,
      "math-fun": `Math time! 🌲 Here's a fun one: If you have 2 apples and I give you 3 more apples, how many apples do you have?`,
      "praise-time": `You're doing so great! Tell me one thing you did really well today. I want to celebrate with you!`,
      "feelings-check": `How are you feeling right now? Are you happy, excited, tired, or maybe something else?`,
      "story-time": `Story time! 🦊 Once upon a time, a little fox got lost in the forest. He felt scared. Then a friendly owl helped him find his way home! How do you think the fox felt when he got home?`
    };

    return {
      response:
        activities[activityType] ||
        `Let's do something fun together, ${this.state.childName}!`,
      currentActivity: activityType
    };
  }

  async completeActivity() {
    if (this.state.currentActivity) {
      this.state.activitiesCompleted.push(this.state.currentActivity);
      this.state.currentActivity = undefined;
      await this.saveState();

      return {
        response: `Awesome job! You completed that activity! 🌟`,
        activitiesCompleted: this.state.activitiesCompleted
      };
    }
  }

  async getProgress() {
    return {
      childName: this.state.childName,
      age: this.state.age,
      totalConversations: this.state.conversationHistory.length,
      activitiesCompleted: this.state.activitiesCompleted,
      currentActivity: this.state.currentActivity,
      preferences: this.state.preferences
    };
  }

  private async saveState() {
    await this.setState(this.state);
  }

  private async loadState(): Promise<ConversationState | null> {
    try {
      return await this.getState();
    } catch {
      return null;
    }
  }

  private async getState(): Promise<any> {
    return this.state;
  }
}
