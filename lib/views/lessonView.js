import { TTSService } from '../ttsService.js';
import { markLessonCompleted } from '../gameLogic.js';
import { showLessonComplete } from './completeView.js';

export function renderLesson(app) {
  if (!app.currentLesson) return;

  // 섞기 상태 관리: 최초 셔플 시 순서 고정
  if (app.lessonShuffled && !app.lessonShuffledCards) {
    app.lessonShuffledCards = [...app.currentLesson.cards].sort(() => Math.random() - 0.5);
  }
  const cards = app.lessonShuffled ? app.lessonShuffledCards : app.currentLesson.cards;

  const card = cards[app.currentCardIndex];
  const totalCards = cards.length;
  const isLastCard = app.currentCardIndex === totalCards - 1;
  const bgColor = app.currentPhase.type === 'hiragana' ? 'var(--peach)' : 'var(--mint)';

  let wordHtml = '';
  for (let i = 0; i < card.wordReading.length; i++) {
    wordHtml += i === card.highlightIndex
      ? `<span class="highlight">${card.wordReading[i]}</span>`
      : card.wordReading[i];
  }

  const isVocabOrKanji = ['vocabulary', 'kanji', 'bible'].includes(app.currentPhase.type) || !!card.emoji;

  app.appEl.innerHTML = `
    <div class="lesson-view">
      <div class="top-bar">
        <a href="#home" class="home-btn">🏠 홈</a>
        <div class="lesson-title-display">${app.currentLesson.row}</div>
        <button class="shuffle-btn ${app.lessonShuffled ? 'active' : ''}" id="shuffle-btn" title="카드 순서 섞기">🔀</button>
      </div>

      <div class="thumbnail-bar">
        ${cards.map((_, idx) => `
          <div class="thumb-dot ${idx === app.currentCardIndex ? 'active' : ''}" data-idx="${idx}"></div>
        `).join('')}
      </div>

      <div class="flashcard-container" id="flashcard-container">
        <div class="flashcard ${app.isFlipped ? 'flipped' : ''} ${!app.hasFlippedOnce ? 'bounce' : ''}" id="flashcard">
          <div class="card-face card-front" style="background-color: ${bgColor};">
            ${isVocabOrKanji ? `
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
            ${card.example ? `
              <div class="card-example">
                <div class="example-jp">${card.example}</div>
                <div class="example-ko">${card.exampleKo}</div>
              </div>
            ` : ''}
            <button class="speaker-btn" id="manual-tts-btn" title="다시 듣기">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            </button>
          </div>
        </div>
        ${!app.hasFlippedOnce ? '<div class="hint-text visible" id="hint-text">탭해서 뒤집어보세요!</div>' : ''}
      </div>

      <div class="nav-bar" ${isLastCard && app.isFlipped ? 'style="display:none;"' : ''}>
        <button class="nav-btn" id="prev-btn" ${app.currentCardIndex === 0 ? 'disabled' : ''}>◀</button>
        <div class="nav-status">${app.currentCardIndex + 1} / ${totalCards}</div>
        <button class="nav-btn" id="next-btn" ${isLastCard ? 'disabled' : ''}>▶</button>
      </div>


      ${isLastCard ? `
        <button class="done-btn" id="done-btn" style="display: ${app.isFlipped ? 'flex' : 'none'};">
          ✨ 다 봤어요! ✨
        </button>
      ` : ''}
    </div>
  `;

  attachLessonEvents(app);
}

function attachLessonEvents(app) {
  const container = document.getElementById('flashcard-container');
  const flashcard = document.getElementById('flashcard');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const doneBtn = document.getElementById('done-btn');

  document.getElementById('shuffle-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    app.lessonShuffled = !app.lessonShuffled;
    app.lessonShuffledCards = null; // 재셔플
    app.currentCardIndex = 0;
    app.isFlipped = false;
    renderLesson(app);
  });

  const getActiveCards = () => app.lessonShuffled ? app.lessonShuffledCards : app.currentLesson.cards;

  container.addEventListener('click', () => {
    app.isFlipped = !app.isFlipped;
    flashcard.classList.toggle('flipped');

    if (app.isFlipped) {
      const card = getActiveCards()[app.currentCardIndex];
      setTimeout(() => { if (app.isFlipped) TTSService.speak(card.wordReading); }, 300);
    }

    if (!app.hasFlippedOnce) {
      app.hasFlippedOnce = true;
      localStorage.setItem('hasFlippedOnce', 'true');
      flashcard.classList.remove('bounce');
      document.getElementById('hint-text')?.classList.remove('visible');
    }

    const isLastCard = app.currentCardIndex === getActiveCards().length - 1;
    if (isLastCard) {
      const btn = document.getElementById('done-btn');
      const navBar = document.querySelector('.nav-bar');
      if (btn && navBar) {
        btn.style.display = app.isFlipped ? 'flex' : 'none';
        navBar.style.display = app.isFlipped ? 'none' : 'flex';
      }
    }
  });

  document.getElementById('manual-tts-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const card = getActiveCards()[app.currentCardIndex];
    TTSService.speak(card.wordReading);
    e.currentTarget.classList.add('playing');
    setTimeout(() => e.currentTarget.classList.remove('playing'), 600);
  });

  prevBtn?.addEventListener('click', () => navigateCard(app, -1));
  nextBtn?.addEventListener('click', () => navigateCard(app, 1));

  doneBtn?.addEventListener('click', () => {
    markLessonCompleted(app, app.currentLesson.id);
    showLessonComplete(app);
  });

  document.querySelectorAll('.thumb-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
      const idx = parseInt(e.target.getAttribute('data-idx'));
      if (idx !== app.currentCardIndex) {
        app.currentCardIndex = idx;
        app.isFlipped = false;
        renderLesson(app);
      }
    });
  });

  container.addEventListener('touchstart', e => {
    app.touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  container.addEventListener('touchend', e => {
    app.touchEndX = e.changedTouches[0].screenX;
    handleSwipe(app);
  }, { passive: true });
}

export function navigateCard(app, dir) {
  const cards = app.lessonShuffled ? app.lessonShuffledCards : app.currentLesson.cards;
  const newIdx = app.currentCardIndex + dir;
  if (newIdx >= 0 && newIdx < cards.length) {
    app.currentCardIndex = newIdx;
    app.isFlipped = false;
    renderLesson(app);
  }
}

function handleSwipe(app) {
  const cards = app.lessonShuffled ? app.lessonShuffledCards : app.currentLesson.cards;
  const diff = app.touchEndX - app.touchStartX;
  if (Math.abs(diff) > 40) {
    if (diff > 0 && app.currentCardIndex > 0) navigateCard(app, -1);
    else if (diff < 0 && app.currentCardIndex < cards.length - 1) navigateCard(app, 1);
  }
}
