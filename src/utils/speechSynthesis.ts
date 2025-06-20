export const speakText = (text: string, targetLanguage: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLanguage;
    
    utterance.onend = () => {
      resolve();
    };
    
    utterance.onerror = (event) => {
      reject(new Error(`Speech synthesis error: ${event.error}`));
    };
    
    window.speechSynthesis.speak(utterance);
  });
}; 