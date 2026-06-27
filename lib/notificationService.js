const COOLDOWN_KEY = 'gsf_last_notification';
const PREF_KEY = 'gsf_notification_enabled';
const COOLDOWN_MS = 20 * 60 * 60 * 1000; // 20시간 (하루 1회)

export const NotificationService = {
  isSupported() {
    return 'Notification' in window && 'serviceWorker' in navigator;
  },

  getPermission() {
    return this.isSupported() ? Notification.permission : 'unsupported';
  },

  isEnabled() {
    return this.getPermission() === 'granted' &&
      localStorage.getItem(PREF_KEY) !== 'false';
  },

  async requestPermission() {
    if (!this.isSupported()) return 'unsupported';
    const result = await Notification.requestPermission();
    if (result === 'granted') localStorage.setItem(PREF_KEY, 'true');
    return result;
  },

  async checkAndNotify(srsStats) {
    if (!this.isEnabled()) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const dueCount = Object.values(srsStats).filter(
      s => s.nextReviewDate && s.nextReviewDate <= todayStr
    ).length;

    if (dueCount === 0) return;

    const last = parseInt(localStorage.getItem(COOLDOWN_KEY) || '0');
    if (Date.now() - last < COOLDOWN_MS) return;

    await this._send(
      `🎯 오늘의 복습 미션 — ${dueCount}개`,
      {
        body: 'ヨセフの日本語 — 지금 바로 복습하러 가볼까요? 🌟',
        icon: '/images/joseph_anime.webp',
        badge: '/images/joseph_anime.webp',
        tag: 'daily-mission',
        renotify: true,
      }
    );

    localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
  },

  async _send(title, options) {
    try {
      const reg = await navigator.serviceWorker.ready;
      reg.active?.postMessage({ type: 'SHOW_NOTIFICATION', title, options });
    } catch {
      // SW 없을 때 직접 생성 (포커스된 탭에서만 동작)
      new Notification(title, options);
    }
  },

  disable() {
    localStorage.setItem(PREF_KEY, 'false');
  },
};
