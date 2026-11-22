/**
 * Global audio and speech manager to ensure immediate stoppage
 * whenever users switch sections, tabs, or components.
 */

let currentAudio: HTMLAudioElement | null = null;

export function playAudioOrSpeech(audioUrl: string | null, textFallback: string, onEnd?: () => void) {
  // Always cancel any prior speech/audio first
  stopAllSpeechAndAudio();

  if (audioUrl) {
    try {
      const audio = new Audio(audioUrl);
      currentAudio = audio;
      audio.onended = () => {
        currentAudio = null;
        if (onEnd) onEnd();
      };
      audio.onerror = () => {
        currentAudio = null;
        speakFallback(textFallback, onEnd);
      };
      audio.play().catch(() => {
        speakFallback(textFallback, onEnd);
      });
      return;
    } catch {
      speakFallback(textFallback, onEnd);
      return;
    }
  }

  speakFallback(textFallback, onEnd);
}

function speakFallback(text: string, onEnd?: () => void) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };
    window.speechSynthesis.speak(utterance);
  }
}

/**
 * Immediately cancels all SpeechSynthesis utterances and pauses any HTMLAudioElement.
 */
export function stopAllSpeechAndAudio() {
  if (typeof window !== 'undefined') {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {
      console.warn("Failed to pause audio:", e);
    }
    currentAudio = null;
  }
}
