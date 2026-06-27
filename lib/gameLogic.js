import { StorageAdapter } from './storageAdapter.js';
import { getAllLessons, getTotalLessonCount } from './curriculumHelper.js';

export function getTotalProgress(app) {
  const total = getTotalLessonCount();
  const done = app.mapProgress.completedLessons.length;
  return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
}

export function markLessonCompleted(app, lessonId) {
  if (app.mapProgress.completedLessons.includes(lessonId)) return;
  app.mapProgress.completedLessons.push(lessonId);

  const allLessons = getAllLessons();
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
