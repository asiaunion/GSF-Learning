// lib/storageAdapter.js
// Adapter for localStorage to allow easy migration to Firebase later

const NAMESPACE = 'gsf_learning_';

export const StorageAdapter = {
  getProfile() {
    return this._get('profile', { stars: 0, currentStreak: 0, lastActiveDate: null });
  },
  
  saveProfile(data) {
    this._set('profile', data);
  },

  getMapProgress() {
    return this._get('mapProgress', { unlockedLessonId: 1, completedLessons: [] });
  },

  saveMapProgress(data) {
    this._set('mapProgress', data);
  },

  getSrsStats() {
    return this._get('srsStats', {});
  },

  saveSrsStats(data) {
    this._set('srsStats', data);
  },

  getDailyLogs() {
    return this._get('dailyLogs', {});
  },

  saveDailyLog(dateStr, data) {
    const logs = this.getDailyLogs();
    logs[dateStr] = data;
    this._set('dailyLogs', logs);
  },

  _get(key, defaultValue) {
    try {
      const val = localStorage.getItem(NAMESPACE + key);
      return val ? JSON.parse(val) : defaultValue;
    } catch (e) {
      console.error(`Storage read error for ${key}:`, e);
      return defaultValue;
    }
  },

  _set(key, value) {
    try {
      localStorage.setItem(NAMESPACE + key, JSON.stringify(value));
    } catch (e) {
      console.error(`Storage write error for ${key}:`, e);
    }
  }
};
