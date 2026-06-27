import hiragana from './phases/hiragana.js';
import katakana from './phases/katakana.js';
import vocabulary from './phases/vocabulary.js';
import kanji from './phases/kanji.js';
import bible from './phases/bible.js';

const CURRICULUM = {
  appTitle: "ヨセフの日本語",
  stages: [
    {
      id: 1,
      title: "1단계: 문자의 기초",
      phases: [hiragana, katakana]
    },
    {
      id: 2,
      title: "2단계: 초급 단어 및 한자",
      phases: [vocabulary, kanji]
    },
    {
      id: 3,
      title: "3단계: 성경 일본어",
      phases: [bible]
    }
  ],
  // Helper getter to maintain backward compatibility with existing code that loops over phases
  get phases() {
    return this.stages.flatMap(s => s.phases);
  }
};

export default CURRICULUM;
