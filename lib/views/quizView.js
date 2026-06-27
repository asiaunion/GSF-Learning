import CURRICULUM from '../../data/curriculum.js';
import { SRSEngine } from '../srsEngine.js';
import { StorageAdapter } from '../storageAdapter.js';
import { TTSService } from '../ttsService.js';
import { getAllLessons, getAllCards, getCardId, findLesson, findLessonForCard } from '../curriculumHelper.js';

export function startSrsQuiz(app) {
  const todayStr = new Date().toISOString().split('T')[0];
  const dueCardIds = SRSEngine.getDueCards(app.srsStats, todayStr);
  const allCards = getAllCards();

  if (dueCardIds.length > 0) {
    app.quizDeck = allCards.filter(c => dueCardIds.includes(getCardId(c)));
  } else {
    const allLessons = getAllLessons();
    const completedCards = allCards.filter(c => {
      const lesson = findLessonForCard(c);
      return lesson && app.mapProgress.completedLessons.includes(lesson.id);
    });
    app.quizDeck = completedCards.sort(() => Math.random() - 0.5).slice(0, 5);
    if (app.quizDeck.length === 0) app.quizDeck = allCards.slice(0, 5);
  }

  app.quizMode = true;
  app.isSrsMode = true;
  app.currentCardIndex = 0;
  app.quizScore = 0;
  app.quizDeck = app.quizDeck.sort(() => Math.random() - 0.5);
  renderQuiz(app);
}

export function startQuiz(app, lessonId) {
  const found = findLesson(lessonId);
  if (!found) { window.location.hash = '#home'; return; }
  app.currentLesson = found.lesson;
  app.currentPhase = found.phase;
  app.quizMode = true;
  app.isSrsMode = false;
  app.currentCardIndex = 0;
  app.quizScore = 0;
  app.quizDeck = [...found.lesson.cards].sort(() => Math.random() - 0.5);
  renderQuiz(app);
}

export function renderQuiz(app) {
  if (!app.quizDeck || app.quizDeck.length === 0) {
    window.location.hash = '#home';
    return;
  }

  const card = app.quizDeck[app.currentCardIndex];
  const totalCards = app.quizDeck.length;
  const choices = generateChoices(app, card);
  app.quizChoices = choices;
  app.quizAnswered = false;

  const phaseLabels = { hiragana: '히라가나', katakana: '가타카나', vocabulary: '초급 단어', kanji: '한자', bible: '성경 일본어' };
  const phaseLabel = phaseLabels[app.currentPhase?.type] || '퀴즈';

  app.appEl.innerHTML = `
    <div class="lesson-view quiz-view">
      <div class="top-bar">
        <a href="#home" class="home-btn">🏠 홈</a>
        <div class="lesson-title-display">🎯 ${phaseLabel} 퀴즈</div>
      </div>

      <div class="quiz-progress-bar">
        <div class="quiz-progress-fill" style="width: ${(app.currentCardIndex / totalCards) * 100}%"></div>
      </div>
      <div class="quiz-counter">${app.currentCardIndex + 1} / ${totalCards}</div>

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

  setTimeout(() => TTSService.speak(card.wordReading), 300);

  document.querySelectorAll('.quiz-choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (app.quizAnswered) return;
      app.quizAnswered = true;

      const idx = parseInt(btn.getAttribute('data-idx'));
      const selected = app.quizChoices[idx];
      const isCorrect = selected.meaningKo === card.meaningKo;

      if (isCorrect) {
        app.quizScore++;
        btn.classList.add('correct');
      } else {
        btn.classList.add('wrong');
        document.querySelectorAll('.quiz-choice-btn').forEach((b, i) => {
          if (app.quizChoices[i].meaningKo === card.meaningKo) b.classList.add('correct');
        });
      }

      const cardId = getCardId(card);
      app.srsStats[cardId] = SRSEngine.processReview(app.srsStats[cardId], isCorrect);
      StorageAdapter.saveSrsStats(app.srsStats);

      setTimeout(() => {
        if (app.currentCardIndex < app.quizDeck.length - 1) {
          app.currentCardIndex++;
          renderQuiz(app);
        } else {
          showQuizResult(app, totalCards);
        }
      }, 1200);
    });
  });
}

export function showQuizResult(app, totalCards) {
  const pct = Math.round((app.quizScore / totalCards) * 100);

  if (app.isSrsMode && pct >= 60) {
    const todayStr = new Date().toISOString().split('T')[0];
    const logToday = app.dailyLogs[todayStr] || {};
    if (!logToday.stampEarned) {
      logToday.stampEarned = true;
      app.dailyLogs[todayStr] = logToday;
      StorageAdapter.saveDailyLog(todayStr, logToday);
      app.profile.currentStreak = (app.profile.currentStreak || 0) + 1;
      app.profile.lastActiveDate = todayStr;
      app.profile.stars = (app.profile.stars || 0) + 20;
      StorageAdapter.saveProfile(app.profile);
    }
  }

  let grade = '';
  if (pct === 100) grade = '🏆 만점! すごい！';
  else if (pct >= 80) grade = '🌟 잘했어요!';
  else if (pct >= 60) grade = '👍 좋아요! 조금 더 해봐요';
  else grade = '💪 다시 한번 해봐요!';

  app.appEl.innerHTML = `
    <div class="lesson-complete-view">
      <img src="images/realistic/joseph_cheer.webp" class="mascot-cheer" alt="Joseph"
        onerror="this.src='images/joseph_anime.webp'">
      <div class="speech-bubble">${grade}</div>
      <div class="complete-stats">
        <div class="quiz-result-score">${app.quizScore} / ${totalCards}</div>
        <div class="quiz-result-pct">${pct}점</div>
      </div>
      <div class="complete-actions">
        <button class="quiz-start-btn" id="retry-quiz-btn">🔄 다시 도전!</button>
        <a href="#home" class="home-return-btn">🏠 홈으로</a>
      </div>
    </div>
  `;

  document.getElementById('retry-quiz-btn').addEventListener('click', () => {
    app.currentCardIndex = 0;
    app.quizScore = 0;
    renderQuiz(app);
  });
}

function generateChoices(app, correctCard) {
  const pool = app.currentPhase
    ? app.currentPhase.lessons.flatMap(l => l.cards)
    : getAllCards();
  const others = pool.filter(c => c.meaningKo !== correctCard.meaningKo)
    .sort(() => Math.random() - 0.5).slice(0, 3);
  return [correctCard, ...others].sort(() => Math.random() - 0.5);
}
