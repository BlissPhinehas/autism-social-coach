// Small, testable session helpers used for unit tests and to mirror the
// guided session steps implemented in the client UI.
export type SessionStep = {
  id: string;
  prompt: string;
  type: 'action' | 'choice';
  choices?: string[];
};

export const sessionSteps: SessionStep[] = [
  { id: 'brush', prompt: "Please brush your teeth for two minutes. Say 'Done' when you're finished.", type: 'action' },
  { id: 'praise', prompt: "Tell me one thing you did well today. I'll cheer for you!", type: 'action' },
  { id: 'math', prompt: "Math time! If you have 3 apples and I give you 2 more, how many apples do you have?", type: 'choice', choices: ['4', '5'] },
  { id: 'chat', prompt: "What's your favorite toy? Tell me its name.", type: 'action' }
];

export function isNumericAnswer(answer: string): boolean {
  const n = Number(answer);
  return !Number.isNaN(n);
}

export function nextStepIndex(current: number): number {
  return current + 1;
}
