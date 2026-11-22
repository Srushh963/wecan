import '@testing-library/jest-dom';

// Mock speech synthesis for headless testing
if (typeof window !== 'undefined') {
  window.speechSynthesis = {
    speak: () => {},
    cancel: () => {},
    pause: () => {},
    resume: () => {},
    getVoices: () => [],
  } as any;

  (window as any).SpeechSynthesisUtterance = function (text: string) {
    this.text = text;
    this.rate = 1;
    this.pitch = 1;
  };
}
