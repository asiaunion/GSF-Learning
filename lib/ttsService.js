const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export const TTSService = {
  voices: [],

  init() {
    const load = () => { this.voices = window.speechSynthesis.getVoices(); };
    if (!('speechSynthesis' in window)) return;
    load();
    window.speechSynthesis.onvoiceschanged = load;
    setTimeout(load, 500);
    setTimeout(load, 1000);
  },

  speak(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.endsWith('。') ? text : text + '。');
    utterance.lang = 'ja-JP';
    utterance.rate = isIOS ? 0.6 : 0.95;
    utterance.pitch = isIOS ? 1.0 : 1.05;
    utterance.volume = 1.0;

    if (this.voices.length > 0) {
      const jaVoices = this.voices.filter(v => v.lang.startsWith('ja'));
      if (jaVoices.length > 0) {
        const score = (v) => {
          let s = 0;
          const n = v.name.toLowerCase();
          if (n.includes('siri')) s += 100;
          if (n.includes('google')) s += 90;
          if (n.includes('enhanced') || n.includes('premium')) s += 80;
          if (n.includes('kyoko')) s += 50;
          if (n.includes('otoya')) s += 40;
          if (n.includes('o-ren') || n.includes('hattori')) s += 30;
          return s;
        };
        utterance.voice = jaVoices.sort((a, b) => score(b) - score(a))[0];
      }
    }
    setTimeout(() => window.speechSynthesis.speak(utterance), 50);
  }
};
