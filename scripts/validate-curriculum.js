/**
 * validate-curriculum.js
 * curriculum.js 데이터 무결성 검증 스크립트
 * Wave 3 NextAtomicStep — docs/curriculum-structure.md 스키마 기준
 *
 * 사용법: node scripts/validate-curriculum.js
 * 반환:  exit 0 (pass) | exit 1 (fail)
 */

const path = require('path');
const fs = require('fs');

// curriculum.js를 eval 없이 로드 (const 선언 추출)
const raw = fs.readFileSync(path.join(__dirname, '..', 'curriculum.js'), 'utf-8');
const match = raw.match(/const CURRICULUM\s*=\s*(\{[\s\S]*\})\s*;?\s*$/);
if (!match) { console.error('FAIL: CURRICULUM 객체를 파싱할 수 없음'); process.exit(1); }
const CURRICULUM = JSON.parse(match[1]);

const REQUIRED_CARD_FIELDS = ['character', 'word', 'wordReading', 'meaningKo', 'image', 'highlightIndex'];
const REQUIRED_LESSON_FIELDS = ['id', 'title', 'row', 'cards'];
const REQUIRED_PHASE_FIELDS = ['id', 'title', 'type', 'lessons'];

let errors = [];
let stats = { phases: 0, lessons: 0, cards: 0 };

// Phase 검증
(CURRICULUM.phases || []).forEach((phase, pi) => {
  stats.phases++;
  REQUIRED_PHASE_FIELDS.forEach(f => {
    if (phase[f] === undefined || phase[f] === '')
      errors.push(`Phase[${pi}].${f} 누락`);
  });

  // Lesson 검증
  (phase.lessons || []).forEach((lesson, li) => {
    stats.lessons++;
    REQUIRED_LESSON_FIELDS.forEach(f => {
      if (lesson[f] === undefined || lesson[f] === '')
        errors.push(`Phase[${phase.id}] Lesson[${li}].${f} 누락`);
    });

    // Card 검증
    (lesson.cards || []).forEach((card, ci) => {
      stats.cards++;
      REQUIRED_CARD_FIELDS.forEach(f => {
        if (card[f] === undefined || card[f] === '')
          errors.push(`Phase[${phase.id}] Lesson[${li}] Card[${ci}].${f} 누락`);
      });
    });
  });
});

// 결과 출력
console.log(`\n=== curriculum.js 검증 결과 ===`);
console.log(`Phases : ${stats.phases}`);
console.log(`Lessons: ${stats.lessons}`);
console.log(`Cards  : ${stats.cards}`);

if (errors.length === 0) {
  console.log(`\n✅ PASS — 모든 필드 정상 (${stats.cards}개 카드 검증 완료)\n`);
  process.exit(0);
} else {
  console.error(`\n❌ FAIL — ${errors.length}개 오류 발견:`);
  errors.forEach(e => console.error(`  · ${e}`));
  console.error('');
  process.exit(1);
}
