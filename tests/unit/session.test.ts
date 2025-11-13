import { describe, it, expect } from 'vitest';
import { sessionSteps, isNumericAnswer, nextStepIndex } from '../../src/lib/session';

describe('guided session helpers', () => {
  it('exports the expected number of steps', () => {
    expect(sessionSteps.length).toBeGreaterThanOrEqual(4);
  });

  it('math step contains choices and includes 5', () => {
    const math = sessionSteps.find(s => s.id === 'math');
    expect(math).toBeDefined();
    expect(math?.choices).toBeDefined();
    expect(math?.choices).toContain('5');
  });

  it('numeric detection works', () => {
    expect(isNumericAnswer('5')).toBe(true);
    expect(isNumericAnswer('done')).toBe(false);
  });

  it('nextStepIndex increments index', () => {
    expect(nextStepIndex(0)).toBe(1);
  });
});
