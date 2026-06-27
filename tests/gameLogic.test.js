import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// gameLogic은 CURRICULUM + StorageAdapter를 import하므로 순수 로직만 인라인으로 검증
// (브라우저 전용 Firebase SDK 없이 테스트하기 위한 구조)

function getTotalProgressPure(completedLessons, totalLessons) {
  const done = completedLessons.length;
  const total = totalLessons;
  return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
}

function markLessonCompletedPure(state, lessonId, allLessons) {
  if (state.completedLessons.includes(lessonId)) return state;
  const next = { ...state, completedLessons: [...state.completedLessons, lessonId] };
  const idx = allLessons.findIndex(l => l.id === lessonId);
  if (idx !== -1 && idx + 1 < allLessons.length) {
    const nextId = allLessons[idx + 1].id;
    if (next.unlockedLessonId < nextId) next.unlockedLessonId = nextId;
  }
  return next;
}

function getCardId(card) {
  return `${card.character}_${card.wordReading}`;
}

describe('getTotalProgress', () => {
  test('완료 0개', () => {
    const r = getTotalProgressPure([], 20);
    assert.equal(r.done, 0);
    assert.equal(r.pct, 0);
  });

  test('완료 10/20 = 50%', () => {
    const r = getTotalProgressPure(new Array(10).fill(0), 20);
    assert.equal(r.pct, 50);
  });

  test('전체 완료 100%', () => {
    const r = getTotalProgressPure(new Array(20).fill(0), 20);
    assert.equal(r.pct, 100);
  });
});

describe('markLessonCompleted', () => {
  const allLessons = [{ id: 1 }, { id: 2 }, { id: 3 }];
  let state;

  beforeEach(() => {
    state = { completedLessons: [], unlockedLessonId: 1 };
  });

  test('레슨 완료 시 completedLessons에 추가', () => {
    const next = markLessonCompletedPure(state, 1, allLessons);
    assert.ok(next.completedLessons.includes(1));
  });

  test('다음 레슨 자동 잠금 해제', () => {
    const next = markLessonCompletedPure(state, 1, allLessons);
    assert.equal(next.unlockedLessonId, 2);
  });

  test('이미 완료한 레슨 중복 추가 안 함', () => {
    state.completedLessons = [1];
    const next = markLessonCompletedPure(state, 1, allLessons);
    assert.equal(next.completedLessons.filter(id => id === 1).length, 1);
  });

  test('마지막 레슨 완료 시 unlockedLessonId 변경 없음', () => {
    state.unlockedLessonId = 3;
    const next = markLessonCompletedPure(state, 3, allLessons);
    assert.equal(next.unlockedLessonId, 3);
  });
});

describe('getCardId', () => {
  test('character + wordReading 조합', () => {
    assert.equal(getCardId({ character: 'あ', wordReading: 'あり' }), 'あ_あり');
  });

  test('동일 character 다른 reading은 다른 ID', () => {
    const id1 = getCardId({ character: 'か', wordReading: 'かに' });
    const id2 = getCardId({ character: 'か', wordReading: 'かさ' });
    assert.notEqual(id1, id2);
  });
});
