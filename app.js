import CURRICULUM from './data/curriculum.js';
import { StorageAdapter } from './lib/storageAdapter.js';
import { TTSService } from './lib/ttsService.js';
import { checkStreak } from './lib/gameLogic.js';
import { findLesson, getAllLessons } from './lib/curriculumHelper.js';
import { renderHome } from './lib/views/homeView.js';
import { renderLesson, navigateCard } from './lib/views/lessonView.js';
import { startQuiz, startSrsQuiz } from './lib/views/quizView.js';
import { renderLog } from './lib/views/logView.js';

class FlashcardApp {
  constructor() {
    this.appEl = document.getElementById('app');
    this.quizMode = false;
    this.quizChoices = [];
    this.quizAnswered = false;
    this.touchStartX = 0;
    this.touchEndX = 0;
  }

  async init() {
    await StorageAdapter.init();

    this.mapProgress = StorageAdapter.getMapProgress();
    this.srsStats = StorageAdapter.getSrsStats();
    this.profile = StorageAdapter.getProfile();
    this.dailyLogs = StorageAdapter.getDailyLogs();
    this.isSrsMode = false;
    this.currentMapStage = 1;

    // 현재 잠금 해제된 레슨이 속한 스테이지로 자동 이동
    for (const stage of CURRICULUM.stages || []) {
      for (const phase of stage.phases) {
        if (phase.lessons.some(l => l.id === this.mapProgress.unlockedLessonId)) {
          this.currentMapStage = stage.id;
        }
      }
    }

    this.currentLesson = null;
    this.currentCardIndex = 0;
    this.isFlipped = false;
    this.hasFlippedOnce = localStorage.getItem('hasFlippedOnce') === 'true';

    TTSService.init();
    this.preloadMascot();
    checkStreak(this);

    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('keydown', (e) => this.handleKeydown(e));

    this.handleRoute();
  }

  preloadMascot() {
    ['images/joseph_anime.webp', 'images/realistic/joseph_cheer.webp'].forEach(src => {
      new Image().src = src;
    });
  }

  preloadLessonImages(lesson) {
    lesson.cards.forEach(card => { if (card.image) new Image().src = card.image; });
    setTimeout(() => {
      const allLessons = getAllLessons();
      const idx = allLessons.findIndex(l => l.id === lesson.id);
      allLessons[idx + 1]?.cards.forEach(card => { if (card.image) new Image().src = card.image; });
    }, 1000);
  }

  handleRoute() {
    const hash = window.location.hash || '#home';
    this.quizMode = false;

    if (hash === '#home') {
      renderHome(this);
    } else if (hash === '#log') {
      renderLog(this);
    } else if (hash.startsWith('#lesson/')) {
      const lessonId = parseInt(hash.split('/')[1]);
      const found = findLesson(lessonId);
      if (!found) { window.location.hash = '#home'; return; }
      this.currentLesson = found.lesson;
      this.currentPhase = found.phase;
      this.currentCardIndex = 0;
      this.isFlipped = false;
      this.preloadLessonImages(found.lesson);
      renderLesson(this);
    } else if (hash.startsWith('#quiz/')) {
      const target = hash.split('/')[1];
      if (target === 'srs') {
        startSrsQuiz(this);
      } else {
        startQuiz(this, parseInt(target));
      }
    }
  }

  handleKeydown(e) {
    if (!this.currentLesson || this.quizMode) return;
    if (e.key === 'ArrowLeft' && this.currentCardIndex > 0) {
      navigateCard(this, -1);
    } else if (e.key === 'ArrowRight' && this.currentCardIndex < this.currentLesson.cards.length - 1) {
      navigateCard(this, 1);
    } else if (e.key === ' ' || e.key === 'Enter') {
      document.getElementById('flashcard-container')?.click();
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
  }

  // iOS에서 첫 터치 시 오디오 컨텍스트 활성화
  document.addEventListener('click', function unlockAudio() {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance('');
      u.volume = 0;
      window.speechSynthesis.speak(u);
    }
    document.removeEventListener('click', unlockAudio);
  }, { once: true });

  window.app = new FlashcardApp();
  await window.app.init();
});
