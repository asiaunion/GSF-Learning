import CURRICULUM from '../../data/curriculum.js';

export function renderLog(app) {
  const totalLessons = CURRICULUM.phases.reduce((s, p) => s + p.lessons.length, 0);
  const completedCount = app.mapProgress.completedLessons.length;
  const reviewedCount = Object.keys(app.srsStats).length;

  // 최근 30일 캘린더 생성
  const calendarDays = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    calendarDays.push({ dateStr, log: app.dailyLogs[dateStr] || {} });
  }

  // SRS 통계
  const srsValues = Object.values(app.srsStats);
  const masteredCount = srsValues.filter(s => s.interval >= 7).length;
  const learningCount = srsValues.filter(s => s.interval > 0 && s.interval < 7).length;
  const todayStr = new Date().toISOString().split('T')[0];
  const dueToday = srsValues.filter(s => s.nextReviewDate && s.nextReviewDate <= todayStr).length;

  app.appEl.innerHTML = `
    <div class="log-view">
      <div class="top-bar">
        <a href="#home" class="home-btn">🏠 홈</a>
        <div class="lesson-title-display">📊 학습 기록</div>
      </div>

      <div class="log-summary">
        <div class="log-stat-card">
          <div class="log-stat-num">${completedCount}</div>
          <div class="log-stat-label">완료한 레슨</div>
          <div class="log-stat-sub">/ ${totalLessons}개</div>
        </div>
        <div class="log-stat-card">
          <div class="log-stat-num">${app.profile.currentStreak || 0}</div>
          <div class="log-stat-label">연속 학습</div>
          <div class="log-stat-sub">일</div>
        </div>
        <div class="log-stat-card">
          <div class="log-stat-num">${app.profile.stars || 0}</div>
          <div class="log-stat-label">획득 별</div>
          <div class="log-stat-sub">⭐</div>
        </div>
      </div>

      <div class="log-section">
        <h3 class="log-section-title">📅 최근 30일 학습 캘린더</h3>
        <div class="log-calendar">
          ${calendarDays.map(({ dateStr, log }) => {
            const label = dateStr.slice(5); // MM-DD
            const cls = log.stampEarned ? 'cal-day stamped' : 'cal-day';
            return `<div class="${cls}" title="${dateStr}">${log.stampEarned ? '🔥' : ''}</div>`;
          }).join('')}
        </div>
        <div class="log-calendar-legend">
          <span>🔥 = 미션 완료일</span>
        </div>
      </div>

      <div class="log-section">
        <h3 class="log-section-title">🧠 단어 복습 현황</h3>
        <div class="log-srs-stats">
          <div class="srs-stat-row">
            <span class="srs-stat-label">오늘 복습 예정</span>
            <span class="srs-stat-val accent">${dueToday}개</span>
          </div>
          <div class="srs-stat-row">
            <span class="srs-stat-label">학습 중 (1~6일)</span>
            <span class="srs-stat-val">${learningCount}개</span>
          </div>
          <div class="srs-stat-row">
            <span class="srs-stat-label">마스터 (7일+)</span>
            <span class="srs-stat-val">${masteredCount}개</span>
          </div>
          <div class="srs-stat-row">
            <span class="srs-stat-label">총 학습 단어</span>
            <span class="srs-stat-val">${reviewedCount}개</span>
          </div>
        </div>
      </div>

      <div class="log-section">
        <h3 class="log-section-title">✅ 완료한 레슨</h3>
        <div class="log-lessons">
          ${buildCompletedLessonsHtml(app)}
        </div>
      </div>
    </div>
  `;
}

function buildCompletedLessonsHtml(app) {
  if (app.mapProgress.completedLessons.length === 0) {
    return '<p class="log-empty">아직 완료한 레슨이 없어요. 시작해봐요! 💪</p>';
  }

  return CURRICULUM.phases.map(phase => {
    const completed = phase.lessons.filter(l => app.mapProgress.completedLessons.includes(l.id));
    if (completed.length === 0) return '';
    return `
      <div class="log-phase">
        <div class="log-phase-title">${phase.title || phase.type}</div>
        <div class="log-phase-lessons">
          ${completed.map(l => `<span class="log-lesson-tag">${l.row}</span>`).join('')}
        </div>
      </div>
    `;
  }).join('');
}
