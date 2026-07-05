import { useState, useEffect } from 'react';

/**
 * Simple voice hook using the browser SpeechSynthesis API.
 * Supports speaking a given text in a selected language/voice.
 */
export const useVoice = () => {
  const [supported, setSupported] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
    }
  }, []);

  const speak = (text: string, lang: string = 'en-US') => {
    if (!supported) {
      console.warn('Speech synthesis not supported in this browser');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if (supported) {
      window.speechSynthesis.cancel();
    }
  };

  return { speak, stop, supported };
};
