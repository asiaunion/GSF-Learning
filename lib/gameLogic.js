import CURRICULUM from '../data/curriculum.js';
import { StorageAdapter } from './storageAdapter.js';

export function getTotalProgress(app) {
  const total = CURRICULUM.phases.reduce((sum, p) => sum + p.lessons.length, 0);
  const done = app.mapProgress.completedLessons.length;
  return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
}

export function markLessonCompleted(app, lessonId) {
  if (app.mapProgress.completedLessons.includes(lessonId)) return;
  app.mapProgress.completedLessons.push(lessonId);

  const allLessons = CURRICULUM.phases.flatMap(p => p.lessons);
  const idx = allLessons.findIndex(l => l.id === lessonId);
  if (idx !== -1 && idx + 1 < allLessons.length) {
    const nextId = allLessons[idx + 1].id;
    if (app.mapProgress.unlockedLessonId < nextId) {
      app.mapProgress.unlockedLessonId = nextId;
    }
  }
  StorageAdapter.saveMapProgress(app.mapProgress);

  app.profile.stars += 10;
  StorageAdapter.saveProfile(app.profile);
}

export function checkStreak(app) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastActive = app.profile.lastActiveDate ? new Date(app.profile.lastActiveDate) : null;
  const todayStr = new Date().toISOString().split('T')[0];

  if (lastActive) {
    const diffDays = Math.ceil(Math.abs(today - lastActive) / (1000 * 60 * 60 * 24));
    if (diffDays > 1 && !app.dailyLogs[todayStr]?.stampEarned) {
      app.profile.currentStreak = 0;
    }
  }

  if (app.dailyLogs[todayStr]?.stampEarned) {
    app.profile.lastActiveDate = todayStr;
  }
  StorageAdapter.saveProfile(app.profile);
}

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
