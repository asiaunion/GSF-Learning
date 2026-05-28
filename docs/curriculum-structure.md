# Curriculum Data Structure Reference

`curriculum.js`의 `CURRICULUM` 객체 스키마 정의서.

---

## Top-Level

```js
const CURRICULUM = {
  appTitle: string,   // 앱 제목 (예: "にほんご フラッシュカード")
  phases: Phase[]     // 학습 단계 배열
}
```

## Phase

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | `string` | 식별자 (예: `"hiragana"`, `"katakana"`) |
| `title` | `string` | UI 표시 제목 |
| `type` | `string` | 렌더링 타입 (`"hiragana"` \| `"katakana"`) |
| `lessons` | `Lesson[]` | 레슨 배열 |

**현재 phases:** `hiragana` (14 lessons, 70 cards) · `katakana` (14 lessons, 68 cards)

## Lesson

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | `number` | 레슨 번호 |
| `title` | `string` | 레슨 제목 (예: `"Lesson 1"`) |
| `row` | `string` | 행 이름 (예: `"あ行"`) |
| `cards` | `Card[]` | 플래시카드 배열 |

## Card

| 필드 | 타입 | 설명 |
|------|------|------|
| `character` | `string` | 대표 문자 (예: `"あ"`) |
| `word` | `string` | 예시 단어 (예: `"あり"`) |
| `wordReading` | `string` | 단어 읽기 (히라가나) |
| `meaningKo` | `string` | 한국어 의미 |
| `image` | `string` | 이미지 경로 (`images/realistic/*.webp`) |
| `highlightIndex` | `number` | 단어에서 대표 문자 위치 인덱스 |

---

## Stats

| Phase | Lessons | Cards |
|-------|---------|-------|
| hiragana | 14 | 70 |
| katakana | 14 | 68 |
| **합계** | **28** | **138** |
