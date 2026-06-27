import CURRICULUM from './data/curriculum.js';
import { StorageAdapter } from './lib/storageAdapter.js';
import { SRSEngine } from './lib/srsEngine.js';

class FlashcardApp {
  constructor() {
    this.appEl = document.getElementById('app');
    
    // P1: 퀴즈 모드 상태
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
    this.currentMapStage = 1; // Default to Stage 1
    
    // Auto-select the stage where the unlocked lesson is located
    const allStages = CURRICULUM.stages || [];
    for (const stage of allStages) {
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
    
    this.voices = [];
    const loadVoices = () => {
      this.voices = window.speechSynthesis.getVoices();
    };
    if ('speechSynthesis' in window) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
      setTimeout(loadVoices, 500);
      setTimeout(loadVoices, 1000);
    }
    
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('keydown', (e) => this.handleKeydown(e));
    
    this.preloadMascot();
    this.checkStreak();
    this.handleRoute();
  }
  
  preloadMascot() {
    ['images/joseph_anime.webp', 'images/realistic/joseph_cheer.webp'].forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }

  preloadLessonImages(lesson, prefetchNext = true) {
    lesson.cards.forEach(card => {
      const img = new Image();
      img.src = card.image;
    });

    if (prefetchNext) {
      setTimeout(() => {
        const allLessons = CURRICULUM.phases.flatMap(p => p.lessons);
        const idx = allLessons.findIndex(l => l.id === lesson.id);
        const nextLesson = allLessons[idx + 1];
        if (nextLesson) {
          nextLesson.cards.forEach(card => {
            const img = new Image();
            img.src = card.image;
          });
        }
      }, 1000);
    }
  }
  
  playTTS(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const speakText = text.endsWith('。') ? text : text + '。';
    const utterance = new SpeechSynthesisUtterance(speakText);
    utterance.lang = 'ja-JP';
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    utterance.rate = isIOS ? 0.6 : 0.95;
    utterance.pitch = isIOS ? 1.0 : 1.05;
    utterance.volume = 1.0;

    if (this.voices && this.voices.length > 0) {
      const jaVoices = this.voices.filter(v => v.lang.startsWith('ja'));
      if (jaVoices.length > 0) {
        const getScore = (v) => {
          let score = 0;
          const name = v.name.toLowerCase();
          if (name.includes('siri')) score += 100;
          if (name.includes('google')) score += 90;
          if (name.includes('enhanced') || name.includes('premium')) score += 80;
          if (name.includes('kyoko')) score += 50;
          if (name.includes('otoya')) score += 40;
          if (name.includes('o-ren') || name.includes('hattori')) score += 30;
          return score;
        };
        const sortedVoices = jaVoices.sort((a, b) => getScore(b) - getScore(a));
        utterance.voice = sortedVoices[0];
      }
    }
    setTimeout(() => { window.speechSynthesis.speak(utterance); }, 50);
  }
  
  checkStreak() {
    const today = new Date();
    today.setHours(0,0,0,0);
    const lastActive = this.profile.lastActiveDate ? new Date(this.profile.lastActiveDate) : null;
    
    const todayStr = new Date().toISOString().split('T')[0];
    if (lastActive) {
      const diffTime = Math.abs(today - lastActive);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 1 && !this.dailyLogs[todayStr]?.stampEarned) {
        this.profile.currentStreak = 0;
      }
    }
    
    if (this.dailyLogs[todayStr]?.stampEarned) {
      this.profile.lastActiveDate = todayStr;
    }
    StorageAdapter.saveProfile(this.profile);
  }

  handleRoute() {
    const hash = window.location.hash || '#home';
    if (hash === '#home') {
      this.quizMode = false;
      this.renderHome();
    } else if (hash.startsWith('#lesson/')) {
      const lessonId = parseInt(hash.split('/')[1]);
      this.quizMode = false;
      this.startLesson(lessonId);
    } else if (hash.startsWith('#quiz/')) {
      const quizTarget = hash.split('/')[1];
      if (quizTarget === 'srs') {
        this.startSrsQuiz();
      } else {
        this.startQuiz(quizTarget);
      }
    }
  }

  startSrsQuiz() {
    const todayStr = new Date().toISOString().split('T')[0];
    const dueCardsIds = SRSEngine.getDueCards(this.srsStats, todayStr);
    const allCards = CURRICULUM.phases.flatMap(p => p.lessons.flatMap(l => l.cards));
    
    if (dueCardsIds.length > 0) {
      this.quizDeck = allCards.filter(c => dueCardsIds.includes(this.getCardId(c)));
    } else {
      const completedCards = allCards.filter(c => {
         const lesson = CURRICULUM.phases.flatMap(p=>p.lessons).find(l => l.cards.includes(c));
         return lesson && this.mapProgress.completedLessons.includes(lesson.id);
      });
      this.quizDeck = completedCards.sort(() => Math.random() - 0.5).slice(0, 5);
      if (this.quizDeck.length === 0) {
        this.quizDeck = allCards.slice(0, 5);
      }
    }
    
    this.quizMode = true;
    this.isSrsMode = true;
    this.currentCardIndex = 0;
    this.quizScore = 0;
    this.quizDeck = this.quizDeck.sort(() => Math.random() - 0.5);
    this.renderQuiz();
  }
  
  markLessonCompleted(lessonId) {
    if (!this.mapProgress.completedLessons.includes(lessonId)) {
      this.mapProgress.completedLessons.push(lessonId);
      
      const allLessons = CURRICULUM.phases.flatMap(p => p.lessons);
      const idx = allLessons.findIndex(l => l.id === lessonId);
      if (idx !== -1 && idx + 1 < allLessons.length) {
        const nextId = allLessons[idx + 1].id;
        if (this.mapProgress.unlockedLessonId < nextId) {
          this.mapProgress.unlockedLessonId = nextId;
        }
      }
      StorageAdapter.saveMapProgress(this.mapProgress);
      
      this.profile.stars += 10;
      StorageAdapter.saveProfile(this.profile);
    }
  }

  getCardId(card) {
    return `${card.character}_${card.wordReading}`;
  }
  
  findLesson(id) {
    for (const phase of CURRICULUM.phases) {
      const lesson = phase.lessons.find(l => l.id === id);
      if (lesson) return { lesson, phase };
    }
    return null;
  }

  // ─── P1: 진도 바 계산 ───────────────────────────────────
  getTotalProgress() {
    const total = CURRICULUM.phases.reduce((sum, p) => sum + p.lessons.length, 0);
    const done = this.mapProgress.completedLessons.length;
    return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  }

  // ─── P1: 홈 화면 렌더 (아코디언 + 진도 바) ─────────────
  renderHome() {
    this.currentLesson = null;
    this.isSrsMode = false;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const dueCardsIds = SRSEngine.getDueCards(this.srsStats, todayStr);
    const hasDueCards = dueCardsIds.length > 0;
    const logToday = this.dailyLogs[todayStr] || {};
    const stampEarned = logToday.stampEarned || false;

    let html = `
      <div class="home-view">
        <div class="header">
          <img src="images/joseph_anime.webp" class="mascot" alt="Joseph Mascot"
            onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiB2aWV3Qm94PSIwIDAgMTIwIDEyMCI+PGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNjAiIGZpbGw9IiNGRkI1QzIiLz48dGV4dCB4PSI2MCIgeT0iNzUiIGZvbnQtc2l6ZT0iNTBweCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+YijwvdGV4dD48L3N2Zz4='">
          <h1 class="title">${CURRICULUM.appTitle}</h1>
        </div>

        <div class="srs-daily-log">
          <span class="srs-streak">🔥 ${this.profile.currentStreak || 0}일 연속</span>
          <span class="srs-stars">⭐ ${this.profile.stars || 0}</span>
        </div>

        <div class="daily-quest-container">
          <button class="daily-quest-btn" id="daily-quest-btn" ${!hasDueCards && stampEarned ? 'disabled' : ''}>
            ${hasDueCards ? `🎯 오늘의 복습 미션 (${dueCardsIds.length}개)` : (stampEarned ? '✨ 오늘 미션 완료! ✨' : '🎯 오늘의 복습 미션 시작')}
          </button>
        </div>
    `;

    const allLessons = CURRICULUM.phases.flatMap(p => p.lessons);
    
    // [기존 유저 대응] 콘텐츠 확장 시, 마지막 레슨을 깬 유저의 다음 레슨(101 등)이 열리지 않는 버그 수정
    let highestCompletedIdx = -1;
    allLessons.forEach((l, idx) => {
      if (this.mapProgress.completedLessons.includes(l.id)) {
        highestCompletedIdx = Math.max(highestCompletedIdx, idx);
      }
    });
    if (highestCompletedIdx >= 0 && highestCompletedIdx + 1 < allLessons.length) {
      const nextId = allLessons[highestCompletedIdx + 1].id;
      if (this.mapProgress.unlockedLessonId < nextId) {
        this.mapProgress.unlockedLessonId = nextId;
        StorageAdapter.saveMapProgress(this.mapProgress);
      }
    }

    const stages = CURRICULUM.stages || [];
    const currentStageObj = stages.find(s => s.id === this.currentMapStage) || stages[0];
    const stageLessons = currentStageObj ? currentStageObj.phases.flatMap(p => p.lessons) : allLessons;

    html += `
        <div class="stage-selector">
          <button class="stage-btn" id="stage-prev-btn" ${this.currentMapStage <= 1 ? 'disabled' : ''}>◀</button>
          <div class="stage-title">${currentStageObj ? currentStageObj.title : '맵'}</div>
          <button class="stage-btn" id="stage-next-btn" ${this.currentMapStage >= stages.length ? 'disabled' : ''}>▶</button>
        </div>
        <div class="map-container">
    `;

    const nodesPerRow = 3;
    for (let i = 0; i < stageLessons.length; i++) {
      const lesson = stageLessons[i];
      const isCompleted = this.mapProgress.completedLessons.includes(lesson.id);
      const isUnlocked = this.mapProgress.unlockedLessonId >= lesson.id || isCompleted;
      
      let nodeClass = 'map-node locked';
      if (isCompleted) nodeClass = 'map-node completed';
      else if (isUnlocked) nodeClass = 'map-node unlocked';
      
      const rowIndex = Math.floor(i / nodesPerRow);
      const colIndex = i % nodesPerRow;
      const gridRow = rowIndex * 2 + 1;
      const isLeftToRight = (rowIndex % 2 === 0);
      const gridCol = isLeftToRight ? (colIndex * 2 + 1) : (5 - (colIndex * 2));
      
      html += `
        <a href="${isUnlocked ? '#lesson/' + lesson.id : '#home'}" 
           class="${nodeClass}" 
           title="${lesson.row}"
           style="grid-row: ${gridRow}; grid-column: ${gridCol};">
          <span class="node-text">${lesson.row}</span>
          ${isCompleted ? '<div class="completed-badge">✓</div>' : ''}
        </a>
      `;
      
      if (i < stageLessons.length - 1) {
        const nextLesson = stageLessons[i + 1];
        const isNextUnlocked = this.mapProgress.unlockedLessonId >= nextLesson.id || this.mapProgress.completedLessons.includes(nextLesson.id);
        const lineClass = isNextUnlocked ? 'path-line active' : 'path-line';
        
        if (colIndex < nodesPerRow - 1) {
          const lineGridCol = isLeftToRight ? gridCol + 1 : gridCol - 1;
          html += `<div class="${lineClass} horizontal" style="grid-row: ${gridRow}; grid-column: ${lineGridCol};"></div>`;
        } else {
          html += `<div class="${lineClass} vertical" style="grid-row: ${gridRow + 1}; grid-column: ${gridCol};"></div>`;
        }
      }
    }
    
    html += `
        </div>
      </div>
    `;
    
    this.appEl.innerHTML = html;

    document.getElementById('daily-quest-btn').addEventListener('click', () => {
      if (hasDueCards || !stampEarned) {
        window.location.hash = '#quiz/srs';
      } else {
        this.startSrsSession();
      }
    });

    const prevBtn = document.getElementById('stage-prev-btn');
    const nextBtn = document.getElementById('stage-next-btn');
    if (prevBtn) prevBtn.addEventListener('click', () => {
      if (this.currentMapStage > 1) {
        this.currentMapStage--;
        this.renderHome();
      }
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
      if (this.currentMapStage < stages.length) {
        this.currentMapStage++;
        this.renderHome();
      }
    });
  }

  startLesson(lessonId) {
    const found = this.findLesson(lessonId);
    if (!found) { window.location.hash = '#home'; return; }
    this.currentLesson = found.lesson;
    this.currentPhase = found.phase;
    this.currentCardIndex = 0;
    this.isFlipped = false;
    this.preloadLessonImages(found.lesson);
    this.renderLesson();
  }
  
  renderLesson() {
    if (!this.currentLesson) return;
    
    const card = this.currentLesson.cards[this.currentCardIndex];
    const totalCards = this.currentLesson.cards.length;
    const isLastCard = this.currentCardIndex === totalCards - 1;
    const bgColor = this.currentPhase.type === 'hiragana' ? 'var(--peach)' : 'var(--mint)';
    
    let wordHtml = '';
    for (let i = 0; i < card.wordReading.length; i++) {
      if (i === card.highlightIndex) {
        wordHtml += `<span class="highlight">${card.wordReading[i]}</span>`;
      } else {
        wordHtml += card.wordReading[i];
      }
    }
    
    let html = `
      <div class="lesson-view">
        <div class="top-bar">
          <a href="#home" class="home-btn">🏠 홈</a>
          <div class="lesson-title-display">${this.currentLesson.row}</div>
        </div>
        
        <div class="thumbnail-bar">
          ${this.currentLesson.cards.map((_, idx) => `
            <div class="thumb-dot ${idx === this.currentCardIndex ? 'active' : ''}" data-idx="${idx}"></div>
          `).join('')}
        </div>
        
        <div class="flashcard-container" id="flashcard-container">
          <div class="flashcard ${this.isFlipped ? 'flipped' : ''} ${!this.hasFlippedOnce ? 'bounce' : ''}" id="flashcard">
            <div class="card-face card-front" style="background-color: ${bgColor};">
              ${(this.currentPhase.type === 'vocabulary' || this.currentPhase.type === 'kanji') ? `
                ${card.emoji ? `<div class="card-emoji-huge">${card.emoji}</div>` : ''}
                <div class="card-char-huge" ${card.emoji ? 'style="font-size: 3rem; margin-top: 10px;"' : ''}>${card.character}</div>
              ` : `
                <img src="${card.image}" class="card-image" alt="illustration" loading="lazy"
                  onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPijjgIxf44CMKTwvdGV4dD48L3N2Zz4='">
                <div class="card-char">${card.character}</div>
              `}
            </div>
            <div class="card-face card-back">
              <div class="word-reading">${wordHtml}</div>
              <div class="word-meaning">${card.meaningKo}</div>
              <button class="speaker-btn" id="manual-tts-btn" title="다시 듣기">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
              </button>
            </div>
          </div>
          ${!this.hasFlippedOnce ? '<div class="hint-text visible" id="hint-text">탭해서 뒤집어보세요!</div>' : ''}
        </div>
        
        <div class="nav-bar" ${isLastCard && this.isFlipped ? 'style="display:none;"' : ''}>
          <button class="nav-btn" id="prev-btn" ${this.currentCardIndex === 0 ? 'disabled' : ''}>◀</button>
          <div class="nav-status">${this.currentCardIndex + 1} / ${totalCards}</div>
          <button class="nav-btn" id="next-btn" ${isLastCard ? 'disabled' : ''}>▶</button>
        </div>
        
        ${isLastCard ? `
          <button class="done-btn" id="done-btn" style="display: ${this.isFlipped ? 'flex' : 'none'};">
            ✨ 다 봤어요! ✨
          </button>
        ` : ''}
      </div>
    `;
    
    this.appEl.innerHTML = html;
    this.attachLessonEvents();
  }
  
  attachLessonEvents() {
    const container = document.getElementById('flashcard-container');
    const flashcard = document.getElementById('flashcard');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const doneBtn = document.getElementById('done-btn');
    const thumbDots = document.querySelectorAll('.thumb-dot');
    
    container.addEventListener('click', () => {
      this.isFlipped = !this.isFlipped;
      flashcard.classList.toggle('flipped');
      
      if (this.isFlipped) {
        const card = this.currentLesson.cards[this.currentCardIndex];
        setTimeout(() => { if (this.isFlipped) this.playTTS(card.wordReading); }, 300);
      }
      
      if (!this.hasFlippedOnce) {
        this.hasFlippedOnce = true;
        localStorage.setItem('hasFlippedOnce', 'true');
        flashcard.classList.remove('bounce');
        const hint = document.getElementById('hint-text');
        if (hint) hint.classList.remove('visible');
      }
      
      const isLastCard = this.currentCardIndex === this.currentLesson.cards.length - 1;
      if (isLastCard) {
        const doneBtn = document.getElementById('done-btn');
        const navBar = document.querySelector('.nav-bar');
        if (doneBtn && navBar) {
          if (this.isFlipped) {
            doneBtn.style.display = 'flex';
            navBar.style.display = 'none';
          } else {
            doneBtn.style.display = 'none';
            navBar.style.display = 'flex';
          }
        }
      }
    });

    const manualBtn = document.getElementById('manual-tts-btn');
    if (manualBtn) {
      manualBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = this.currentLesson.cards[this.currentCardIndex];
        this.playTTS(card.wordReading);
        manualBtn.classList.add('playing');
        setTimeout(() => manualBtn.classList.remove('playing'), 600);
      });
    }
    
    if (prevBtn) prevBtn.addEventListener('click', () => this.navigateCard(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => this.navigateCard(1));
    
    if (doneBtn) {
      doneBtn.addEventListener('click', () => {
        this.markLessonCompleted(this.currentLesson.id);
        this.showLessonComplete();
      });
    }
    
    thumbDots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'));
        if (idx !== this.currentCardIndex) {
          this.currentCardIndex = idx;
          this.isFlipped = false;
          this.renderLesson();
        }
      });
    });
    
    container.addEventListener('touchstart', e => {
      this.touchStartX = e.changedTouches[0].screenX;
    }, {passive: true});
    
    container.addEventListener('touchend', e => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    }, {passive: true});
  }

  // ─── P1: 레슨 완료 화면 (마스코트 피드백) ───────────────
  showLessonComplete() {
    const lessonId = this.currentLesson.id;
    const { total, done } = this.getTotalProgress();
    
    const messages = [
      'すごい！よくできました！🌟',
      'やったー！かんぺきです！🎉',
      'すばらしい！천재야！✨',
      'がんばった！よかったです！🏆',
      'すごいね！どんどんうまくなってる！🚀'
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];

    this.appEl.innerHTML = `
      <div class="lesson-complete-view">
        <img src="images/realistic/joseph_cheer.webp" class="mascot-cheer" alt="Joseph cheering"
          onerror="this.src='images/joseph_anime.webp'">
        <div class="speech-bubble">${msg}</div>
        <div class="complete-stats">
          <div class="complete-title">레슨 완료! 🎊</div>
          <div class="complete-progress">전체 ${done} / ${total} 레슨 완료</div>
        </div>
        <div class="complete-actions">
          <button class="quiz-start-btn" id="start-quiz-btn">🎯 퀴즈 도전!</button>
          <a href="#home" class="home-return-btn">🏠 홈으로</a>
        </div>
      </div>
    `;

    document.getElementById('start-quiz-btn').addEventListener('click', () => {
      // 완료한 레슨 ID로 퀴즈 시작
      window.location.hash = `#quiz/${lessonId}`;
    });
  }

  // ─── P1: 퀴즈 모드 (완료한 레슨 5장, 히라가나/가타카나 공통 UI) ───
  startQuiz(lessonId) {
    const found = this.findLesson(parseInt(lessonId));
    if (!found) { window.location.hash = '#home'; return; }
    this.currentLesson = found.lesson;
    this.currentPhase = found.phase;
    this.quizMode = true;
    this.isSrsMode = false;
    this.currentCardIndex = 0;
    this.quizScore = 0;
    this.quizDeck = [...found.lesson.cards].sort(() => Math.random() - 0.5);
    this.renderQuiz();
  }

  generateQuizChoices(correctCard) {
    // 오답은 같은 phase의 카드 풀에서만 생성
    const samePhaseCards = this.currentPhase
      ? this.currentPhase.lessons.flatMap(l => l.cards)
      : CURRICULUM.phases.flatMap(p => p.lessons.flatMap(l => l.cards));
    const others = samePhaseCards.filter(c => c.meaningKo !== correctCard.meaningKo);
    const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 3);
    const choices = [correctCard, ...shuffled].sort(() => Math.random() - 0.5);
    return choices;
  }

  renderQuiz() {
    if (!this.quizDeck || this.quizDeck.length === 0) {
      window.location.hash = '#home';
      return;
    }
    const card = this.quizDeck[this.currentCardIndex];
    const totalCards = this.quizDeck.length;
    const choices = this.generateQuizChoices(card);
    this.quizChoices = choices;
    this.quizAnswered = false;

    const phaseLabel = this.currentPhase?.type === 'katakana' ? '가타카나' : '히라가나';

    this.appEl.innerHTML = `
      <div class="lesson-view quiz-view">
        <div class="top-bar">
          <a href="#home" class="home-btn">🏠 홈</a>
          <div class="lesson-title-display">🎯 ${phaseLabel} 퀴즈</div>
        </div>
        
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" style="width: ${(this.currentCardIndex / totalCards) * 100}%"></div>
        </div>
        <div class="quiz-counter">${this.currentCardIndex + 1} / ${totalCards}</div>

        <div class="quiz-card-hiragana">
          <div class="quiz-char-big">${card.character}</div>
          <div class="quiz-word-hint">${card.wordReading}</div>
          <div class="quiz-question">이 글자의 뜻은?</div>
        </div>

        <div class="quiz-choices" id="quiz-choices">
          ${choices.map((c, i) => `
            <button class="quiz-choice-btn" data-idx="${i}" id="choice-${i}">
              ${c.meaningKo}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    // TTS: 단어 읽기
    setTimeout(() => this.playTTS(card.wordReading), 300);

    document.querySelectorAll('.quiz-choice-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (this.quizAnswered) return;
        this.quizAnswered = true;
        
        const idx = parseInt(btn.getAttribute('data-idx'));
        const selected = this.quizChoices[idx];
        const isCorrect = selected.meaningKo === card.meaningKo;
        
        if (isCorrect) {
          this.quizScore++;
          btn.classList.add('correct');
        } else {
          btn.classList.add('wrong');
          // 정답 표시
          document.querySelectorAll('.quiz-choice-btn').forEach((b, i) => {
            if (this.quizChoices[i].meaningKo === card.meaningKo) {
              b.classList.add('correct');
            }
          });
        }
        
        // SRS 자동 기록
        const cardId = this.getCardId(card);
        const currentStats = this.srsStats[cardId];
        const newStats = SRSEngine.processReview(currentStats, isCorrect);
        this.srsStats[cardId] = newStats;
        StorageAdapter.saveSrsStats(this.srsStats);

        // 1.2초 후 다음 카드 or 결과
        setTimeout(() => {
          if (this.currentCardIndex < this.quizDeck.length - 1) {
            this.currentCardIndex++;
            this.renderQuiz();
          } else {
            this.showQuizResult(totalCards);
          }
        }, 1200);
      });
    });
  }

  showQuizResult(totalCards) {
    const pct = Math.round((this.quizScore / totalCards) * 100);
    
    // 일일 스탬프 지급 (SRS 모드일 때만, 60점 이상이면)
    if (this.isSrsMode && pct >= 60) {
      const todayStr = new Date().toISOString().split('T')[0];
      const logToday = this.dailyLogs[todayStr] || {};
      if (!logToday.stampEarned) {
        logToday.stampEarned = true;
        this.dailyLogs[todayStr] = logToday;
        StorageAdapter.saveDailyLog(todayStr, logToday);
        
        this.profile.currentStreak = (this.profile.currentStreak || 0) + 1;
        this.profile.stars = (this.profile.stars || 0) + 20;
        StorageAdapter.saveProfile(this.profile);
      }
    }

    let grade = '';
    if (pct === 100) grade = '🏆 만점! すごい！';
    else if (pct >= 80) grade = '🌟 잘했어요!';
    else if (pct >= 60) grade = '👍 좋아요! 조금 더 해봐요';
    else grade = '💪 다시 한번 해봐요!';

    this.appEl.innerHTML = `
      <div class="lesson-complete-view">
        <img src="images/realistic/joseph_cheer.webp" class="mascot-cheer" alt="Joseph"
          onerror="this.src='images/joseph_anime.webp'">
        <div class="speech-bubble">${grade}</div>
        <div class="complete-stats">
          <div class="quiz-result-score">${this.quizScore} / ${totalCards}</div>
          <div class="quiz-result-pct">${pct}점</div>
        </div>
        <div class="complete-actions">
          <button class="quiz-start-btn" id="retry-quiz-btn">🔄 다시 도전!</button>
          <a href="#home" class="home-return-btn">🏠 홈으로</a>
        </div>
      </div>
    `;

    document.getElementById('retry-quiz-btn').addEventListener('click', () => {
      this.currentCardIndex = 0;
      this.quizScore = 0;
      this.renderQuiz();
    });
  }
  
  handleSwipe() {
    const diff = this.touchEndX - this.touchStartX;
    if (Math.abs(diff) > 40) {
      if (diff > 0 && this.currentCardIndex > 0) {
        this.navigateCard(-1);
      } else if (diff < 0 && this.currentCardIndex < this.currentLesson.cards.length - 1) {
        this.navigateCard(1);
      }
    }
  }
  
  handleKeydown(e) {
    if (!this.currentLesson) return;
    if (this.quizMode) return;
    if (e.key === 'ArrowLeft' && this.currentCardIndex > 0) {
      this.navigateCard(-1);
    } else if (e.key === 'ArrowRight' && this.currentCardIndex < this.currentLesson.cards.length - 1) {
      this.navigateCard(1);
    } else if (e.key === ' ' || e.key === 'Enter') {
      const container = document.getElementById('flashcard-container');
      if (container) container.click();
    }
  }
  
  navigateCard(dir) {
    const newIdx = this.currentCardIndex + dir;
    if (newIdx >= 0 && newIdx < this.currentLesson.cards.length) {
      this.currentCardIndex = newIdx;
      this.isFlipped = false;
      this.renderLesson();
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // 모바일/iOS 기기에서 음성 재생을 허용하기 위해, 첫 터치 시점에 빈 음성을 재생하여 오디오 컨텍스트를 활성화합니다.
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
