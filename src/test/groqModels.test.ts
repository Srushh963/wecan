import { describe, it, expect } from 'vitest';
import { GROQ_MODEL, GROQ_FAST_MODEL } from '../lib/groq';

describe('System Architecture & Configuration Suite', () => {
  it('correctly configures high-capacity LLM for complex evaluations', () => {
    expect(GROQ_MODEL).toBe('openai/gpt-oss-120b');
  });

  it('correctly configures low-latency LLM for fast chat assistance', () => {
    expect(GROQ_FAST_MODEL).toBe('openai/gpt-oss-20b');
  });
});
