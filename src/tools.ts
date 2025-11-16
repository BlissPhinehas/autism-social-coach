// src/tools.ts
import { z } from "zod";

// Each tool corresponds to an activity in your agent
export const tools = {
  numberGame: {
    description: "Ask the child a number/math question and validate answer",
    parameters: z.object({
      question: z.string(),
      answer: z.number()
    })
  },
  storyTime: {
    description: "Generate a short story based on child's interests",
    parameters: z.object({
      interests: z.array(z.string())
    })
  },
  morningRoutine: {
    description: "Track completion of morning routine tasks",
    parameters: z.object({
      action: z.string()
    })
  },
  feelings: {
    description: "Record child's feelings",
    parameters: z.object({
      feeling: z.string()
    })
  },
  praise: {
    description: "Give praise based on earned stars",
    parameters: z.object({
      stars: z.number()
    })
  }
};

// Execution handlers for tools
export const executions = {
  numberGame: async ({ question, answer }: { question: string; answer: number }) => {
    return `Question: ${question}, Answer: ${answer}`;
  },
  storyTime: async ({ interests }: { interests: string[] }) => {
    return `Here's a story about ${interests.join(", ")}!`;
  },
  morningRoutine: async ({ action }: { action: string }) => {
    return `Great job on ${action}! ⭐`;
  },
  feelings: async ({ feeling }: { feeling: string }) => {
    return `I heard you're feeling ${feeling}.`;
  },
  praise: async ({ stars }: { stars: number }) => {
    return `You have ${stars} star${stars === 1 ? "" : "s"}! Keep it up! ⭐`;
  }
};
