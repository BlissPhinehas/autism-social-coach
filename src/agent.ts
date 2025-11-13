import { Agent } from "agents";

interface ConversationState {
  childName?: string;
  age?: number;
  conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: number;
  }>;
  skillsPracticed: {
    greetings: number;
    emotions: number;
    questions: number;
    sharing: number;
  };
  currentExercise?: string;
  badges: string[];
  streak: number;
  lastInteraction?: number;
}

export class SocialSkillsAgent extends Agent {
  // Expose `state` as a ConversationState-backed accessor so TypeScript can
  // treat the base Agent's `state` accessor as the correct type here.
  public get state(): ConversationState {
    return (this as any)._state as ConversationState;
  }

  public set state(v: ConversationState) {
    (this as any)._state = v;
  }

  async onStart() {
    // Load existing state from storage
    const savedState = await this.loadState();
    const defaultState: ConversationState = {
      conversationHistory: [],
      skillsPracticed: { greetings: 0, emotions: 0, questions: 0, sharing: 0 },
      badges: [],
      streak: 0
    };

    // Assign to the base Agent's state (type from base may be different)
    this.state = savedState ? { ...defaultState, ...savedState } : defaultState;
  }

  async chat(message: string, metadata?: { parentMode?: boolean }) {
    const timestamp = Date.now();

    // Add user message to history
    this.state.conversationHistory.push({
      role: "user",
      content: message,
      timestamp
    });

    // Detect if this is setup/parent mode
    if (metadata?.parentMode || !this.state.childName) {
      return await this.handleSetup(message);
    }

    // Generate AI response using Workers AI
    const response = await this.generateResponse(message);

    // Track skills practiced
    this.trackSkills(message, response);

    // Add assistant message to history
    this.state.conversationHistory.push({
      role: "assistant",
      content: response,
      timestamp: Date.now()
    });

    // Update streak
    this.updateStreak();

    // Check for new badges
    const newBadges = this.checkForNewBadges();

    // Save state
    await this.saveState();

    return {
      response,
      newBadges,
      progress: this.state.skillsPracticed,
      badges: this.state.badges,
      streak: this.state.streak
    };
  }

  private async handleSetup(message: string) {
    // Extract child info
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
        this.state.age = parseInt(ageMatch[1], 10);
      }
    }

    await this.saveState();

    if (this.state.childName && this.state.age) {
      return {
        response: `Great! I'm excited to talk with ${this.state.childName}. I'm here to practice social skills together. Would you like to start with greetings, talking about feelings, or asking questions?`,
        setupComplete: true,
        childName: this.state.childName
      };
    }

    return {
      response:
        "Hi! I'm your friendly AI coach. I help kids practice social skills. What's your child's name and age?",
      setupComplete: false
    };
  }

  private async generateResponse(userMessage: string): Promise<string> {
    const systemPrompt = this.buildSystemPrompt();
    const conversationContext = this.getRecentContext();

    try {
      // Call Workers AI (Llama 3.3)
      const response = await this.env.AI.run(
        "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
        {
          messages: [
            { role: "system", content: systemPrompt },
            ...conversationContext,
            { role: "user", content: userMessage }
          ],
          max_tokens: 200,
          temperature: 0.7
        }
      );

      // The Workers AI SDK may return a string or an object; normalize to string
      if (typeof response === "string") return response;
      // @ts-ignore - normalize unknown response shape
      if ((response as any)?.response) return (response as any).response;
      return String(response) || "I'm here to help! Can you tell me more?";
    } catch (error) {
      console.error("AI Error:", error);
      return "I'm listening! Tell me more about that.";
    }
  }

  private buildSystemPrompt(): string {
    const childName = this.state.childName || "friend";
    const age = this.state.age || 8;

    return `You are a friendly, patient AI social skills coach helping ${childName} (age ${age}) practice social interactions.

IMPORTANT RULES:
- Use simple, clear, literal language appropriate for age ${age}
- Avoid idioms, sarcasm, or abstract concepts
- Be predictable and encouraging
- One topic at a time, 2-3 sentences max
- Celebrate small wins with enthusiasm
- If the child seems confused, rephrase more simply
- Practice these skills: greetings, emotions, asking questions, sharing

Current focus: ${this.state.currentExercise || "general conversation"}
Skills practiced: Greetings: ${this.state.skillsPracticed.greetings}, Emotions: ${this.state.skillsPracticed.emotions}

Be warm, patient, and supportive. Keep responses under 2-3 sentences.`;
  }

  private getRecentContext() {
    return this.state.conversationHistory.slice(-6).map((msg) => ({
      role: msg.role,
      content: msg.content
    }));
  }

  private trackSkills(userMessage: string, aiResponse: string) {
    const lower = userMessage.toLowerCase();

    if (lower.match(/hello|hi|hey|good morning|good afternoon|howdy/)) {
      this.state.skillsPracticed.greetings++;
    }
    if (lower.match(/feel|sad|happy|angry|scared|excited|worried|mad|glad/)) {
      this.state.skillsPracticed.emotions++;
    }
    if (lower.includes("?") || lower.match(/what|why|how|when|where|who/)) {
      this.state.skillsPracticed.questions++;
    }
    if (lower.match(/i like|my favorite|i enjoy|i think|i love|i want/)) {
      this.state.skillsPracticed.sharing++;
    }
  }

  private updateStreak() {
    const now = Date.now();
    const lastTime = this.state.lastInteraction || 0;
    const hoursSince = (now - lastTime) / (1000 * 60 * 60);

    if (hoursSince < 48) {
      this.state.streak++;
    } else {
      this.state.streak = 1;
    }

    this.state.lastInteraction = now;
  }

  private checkForNewBadges(): string[] {
    const newBadges: string[] = [];
    const skills = this.state.skillsPracticed;

    const badges = [
      { name: "First Hello 👋", condition: skills.greetings >= 1 },
      { name: "Greeting Master 🌟", condition: skills.greetings >= 10 },
      { name: "Feelings Explorer 💭", condition: skills.emotions >= 5 },
      { name: "Question Asker ❓", condition: skills.questions >= 5 },
      { name: "Great Sharer 🎯", condition: skills.sharing >= 5 },
      { name: "3-Day Streak 🔥", condition: this.state.streak >= 3 },
      { name: "Week Warrior 🏆", condition: this.state.streak >= 7 }
    ];

    badges.forEach((badge) => {
      if (badge.condition && !this.state.badges.includes(badge.name)) {
        newBadges.push(badge.name);
        this.state.badges.push(badge.name);
      }
    });

    return newBadges;
  }

  async getProgress() {
    return {
      childName: this.state.childName,
      age: this.state.age,
      totalConversations: this.state.conversationHistory.length,
      skillsPracticed: this.state.skillsPracticed,
      badges: this.state.badges,
      streak: this.state.streak,
      recentHistory: this.state.conversationHistory.slice(-10)
    };
  }

  async startExercise(exerciseType: string) {
    this.state.currentExercise = exerciseType;
    await this.saveState();

    const exercises: Record<string, string> = {
      greetings:
        "Let's practice saying hello! I'll start: Hello! How are you today?",
      emotions:
        "Let's talk about feelings. Can you tell me about a time you felt really happy?",
      questions:
        "Let's practice asking questions. I'll tell you about my day, and you can ask me questions about it!",
      sharing:
        "Let's practice sharing! Tell me about something you really like."
    };

    return exercises[exerciseType] || exercises.greetings;
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
    // Retrieve from Durable Object storage
    return this.state;
  }
}
