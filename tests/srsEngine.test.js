import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { SRSEngine } from '../lib/srsEngine.js';

describe('SRSEngine.processReview', () => {
  test('신규 카드 정답: interval 1일', () => {
    const result = SRSEngine.processReview(null, true);
    assert.equal(result.interval, 1);
    assert.ok(result.easeFactor >= 2.5);
  });

  test('1일짜리 정답: interval 3일', () => {
    const result = SRSEngine.processReview({ interval: 1, easeFactor: 2.5 }, true);
    assert.equal(result.interval, 3);
  });

  test('3일짜리 정답: easeFactor 곱셈 적용', () => {
    const result = SRSEngine.processReview({ interval: 3, easeFactor: 2.5 }, true);
    assert.equal(result.interval, Math.round(3 * 2.5));
  });

  test('오답: interval 1로 리셋, easeFactor 감소', () => {
    const result = SRSEngine.processReview({ interval: 5, easeFactor: 2.5 }, false);
    assert.equal(result.interval, 1);
    assert.ok(result.easeFactor < 2.5);
    assert.ok(result.easeFactor >= 1.3);
  });

  test('easeFactor는 1.3 미만으로 내려가지 않음', () => {
    const result = SRSEngine.processReview({ interval: 1, easeFactor: 1.3 }, false);
    assert.equal(result.easeFactor, 1.3);
  });

  test('nextReviewDate가 오늘 이후 날짜로 설정됨', () => {
    const result = SRSEngine.processReview(null, true);
    const today = new Date().toISOString().split('T')[0];
    assert.ok(result.nextReviewDate > today);
  });
});

describe('SRSEngine.getDueCards', () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  test('오늘 복습일 카드 포함', () => {
    const stats = { 'a_あ': { nextReviewDate: todayStr } };
    const due = SRSEngine.getDueCards(stats, todayStr);
    assert.deepEqual(due, ['a_あ']);
  });

  test('어제 복습일 카드 포함 (연체)', () => {
    const stats = { 'b_い': { nextReviewDate: yesterdayStr } };
    const due = SRSEngine.getDueCards(stats, todayStr);
    assert.deepEqual(due, ['b_い']);
  });

  test('미래 복습일 카드 미포함', () => {
    const stats = { 'c_う': { nextReviewDate: tomorrowStr } };
    const due = SRSEngine.getDueCards(stats, todayStr);
    assert.deepEqual(due, []);
  });

  test('빈 stats에서 빈 배열 반환', () => {
    assert.deepEqual(SRSEngine.getDueCards({}, todayStr), []);
  });
});
