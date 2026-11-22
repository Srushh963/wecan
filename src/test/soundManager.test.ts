import { describe, it, expect, vi } from 'vitest';
import { stopAllSpeechAndAudio, playAudioOrSpeech } from '../lib/soundManager';

describe('Audio & Speech Lifecycle Manager', () => {
  it('executes stopAllSpeechAndAudio cleanly without exceptions', () => {
    expect(() => stopAllSpeechAndAudio()).not.toThrow();
  });

  it('triggers speech synthesis fallback cleanly', () => {
    const onEnd = vi.fn();
    expect(() => playAudioOrSpeech(null, 'Test phrase', onEnd)).not.toThrow();
  });
});
