import CURRICULUM from '../data/curriculum.js';

export const getAllLessons = () => CURRICULUM.phases.flatMap(p => p.lessons);

export const getAllCards = () => getAllLessons().flatMap(l => l.cards);

export const getTotalLessonCount = () => getAllLessons().length;

export function findLesson(id) {
  for (const phase of CURRICULUM.phases) {
    const lesson = phase.lessons.find(l => l.id === id);
    if (lesson) return { lesson, phase };
  }
  return null;
}

export function getCardId(card) {
  return `${card.character}_${card.wordReading}`;
}

export function findLessonForCard(card) {
  return getAllLessons().find(l => l.cards.includes(card));
}
