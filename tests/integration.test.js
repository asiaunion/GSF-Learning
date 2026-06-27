import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { SRSEngine } from '../lib/srsEngine.js';

// StorageAdapter와 Firebase 없이 퀴즈→SRS→스트릭 흐름을 순수 로직으로 검증

function makeApp() {
  return {
    quizScore: 0,
    quizDeck: [],
    currentCardIndex: 0,
    quizAnswered: false,
    isSrsMode: true,
    srsStats: {},
    dailyLogs: {},
    profile: { currentStreak: 0, stars: 0, lastActiveDate: null },
    mapProgress: { completedLessons: [], unlockedLessonId: 1 },
    saved: { srsStats: null, profile: null, dailyLog: null },
  };
}

function makeCard(char, reading, meaning) {
  return { character: char, wordReading: reading, meaningKo: meaning, emoji: '🔤' };
}

function getCardId(card) {
  return `${card.character}_${card.wordReading}`;
}

// 퀴즈 정답 처리 순수 함수 (quizView.js의 핵심 로직 추출)
function processAnswer(app, card, isCorrect, todayStr) {
  if (isCorrect) app.quizScore++;
  const cardId = getCardId(card);
  app.srsStats[cardId] = SRSEngine.processReview(app.srsStats[cardId], isCorrect);
  return app.srsStats[cardId];
}

// 퀴즈 결과 처리 순수 함수 (showQuizResult 핵심 로직 추출)
function processQuizResult(app, totalCards, todayStr) {
  const pct = Math.round((app.quizScore / totalCards) * 100);
  if (app.isSrsMode && pct >= 60) {
    const logToday = app.dailyLogs[todayStr] || {};
    if (!logToday.stampEarned) {
      logToday.stampEarned = true;
      app.dailyLogs[todayStr] = logToday;
      app.profile.currentStreak = (app.profile.currentStreak || 0) + 1;
      app.profile.lastActiveDate = todayStr;
      app.profile.stars = (app.profile.stars || 0) + 20;
    }
  }
  return pct;
}

const todayStr = new Date().toISOString().split('T')[0];

describe('퀴즈 → SRS 기록 흐름', () => {
  let app;
  beforeEach(() => { app = makeApp(); });

  test('정답 시 SRS interval 증가', () => {
    const card = makeCard('あ', 'あり', '개미');
    processAnswer(app, card, true, todayStr);
    assert.equal(app.srsStats[getCardId(card)].interval, 1);
  });

  test('오답 시 SRS interval 1로 리셋', () => {
    const card = makeCard('い', 'いぬ', '강아지');
    app.srsStats[getCardId(card)] = { interval: 5, easeFactor: 2.5 };
    processAnswer(app, card, false, todayStr);
    assert.equal(app.srsStats[getCardId(card)].interval, 1);
  });

  test('정답 후 nextReviewDate가 미래로 설정됨', () => {
    const card = makeCard('う', 'うさぎ', '토끼');
    processAnswer(app, card, true, todayStr);
    assert.ok(app.srsStats[getCardId(card)].nextReviewDate > todayStr);
  });

  test('여러 카드 정답 시 quizScore 누적', () => {
    const cards = [makeCard('あ', 'あり', '개미'), makeCard('い', 'いぬ', '강아지')];
    cards.forEach(c => processAnswer(app, c, true, todayStr));
    assert.equal(app.quizScore, 2);
  });
});

describe('퀴즈 결과 → 스트릭 업데이트 흐름', () => {
  let app;
  beforeEach(() => { app = makeApp(); });

  test('60점 이상 SRS 모드: 스탬프 지급 + 스트릭 +1', () => {
    app.quizScore = 4;
    processQuizResult(app, 5, todayStr);
    assert.ok(app.dailyLogs[todayStr]?.stampEarned);
    assert.equal(app.profile.currentStreak, 1);
  });

  test('60점 이상 SRS 모드: 별 +20', () => {
    app.quizScore = 3;
    processQuizResult(app, 5, todayStr);
    assert.equal(app.profile.stars, 20);
  });

  test('60점 미만: 스탬프 미지급', () => {
    app.quizScore = 2;
    processQuizResult(app, 5, todayStr);
    assert.ok(!app.dailyLogs[todayStr]?.stampEarned);
    assert.equal(app.profile.currentStreak, 0);
  });

  test('같은 날 두 번 결과 처리 시 스탬프 중복 지급 안 함', () => {
    app.quizScore = 5;
    processQuizResult(app, 5, todayStr);
    app.quizScore = 5;
    processQuizResult(app, 5, todayStr);
    assert.equal(app.profile.currentStreak, 1);
    assert.equal(app.profile.stars, 20);
  });

  test('일반 퀴즈 모드(isSrsMode=false): 스탬프 미지급', () => {
    app.isSrsMode = false;
    app.quizScore = 5;
    processQuizResult(app, 5, todayStr);
    assert.ok(!app.dailyLogs[todayStr]?.stampEarned);
  });
});

describe('SRS 복습 큐 → 퀴즈 연동 흐름', () => {
  test('복습 예정 카드가 정답 처리되면 interval 증가', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const srsStats = { 'あ_あり': { interval: 1, easeFactor: 2.5, nextReviewDate: yesterdayStr } };
    const due = SRSEngine.getDueCards(srsStats, todayStr);
    assert.equal(due.length, 1);

    const newStats = SRSEngine.processReview(srsStats['あ_あり'], true);
    assert.equal(newStats.interval, 3);
    assert.ok(newStats.nextReviewDate > todayStr);
  });

  test('오답 처리 후 다음날 복습 큐에 포함됨', () => {
    const card = makeCard('か', 'かえる', '개구리');
    const cardId = getCardId(card);
    const app = makeApp();
    processAnswer(app, card, false, todayStr);

    // interval=1이므로 nextReviewDate는 내일 → 내일 기준으로 due 체크
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const due = SRSEngine.getDueCards(app.srsStats, tomorrowStr);
    assert.ok(due.includes(cardId));
  });
});
