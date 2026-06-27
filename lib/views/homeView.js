import CURRICULUM from '../../data/curriculum.js';
import { StorageAdapter } from '../storageAdapter.js';
import { SRSEngine } from '../srsEngine.js';

export function renderHome(app) {
  app.currentLesson = null;
  app.isSrsMode = false;

  const todayStr = new Date().toISOString().split('T')[0];
  const dueCardsIds = SRSEngine.getDueCards(app.srsStats, todayStr);
  const hasDueCards = dueCardsIds.length > 0;
  const logToday = app.dailyLogs[todayStr] || {};
  const stampEarned = logToday.stampEarned || false;

  // 기존 유저 대응: 완료한 레슨 이후 다음 레슨이 잠기는 버그 수정
  const allLessons = CURRICULUM.phases.flatMap(p => p.lessons);
  let highestIdx = -1;
  allLessons.forEach((l, idx) => {
    if (app.mapProgress.completedLessons.includes(l.id)) highestIdx = Math.max(highestIdx, idx);
  });
  if (highestIdx >= 0 && highestIdx + 1 < allLessons.length) {
    const nextId = allLessons[highestIdx + 1].id;
    if (app.mapProgress.unlockedLessonId < nextId) {
      app.mapProgress.unlockedLessonId = nextId;
      StorageAdapter.saveMapProgress(app.mapProgress);
    }
  }

  const stages = CURRICULUM.stages || [];
  const currentStageObj = stages.find(s => s.id === app.currentMapStage) || stages[0];
  const stageLessons = currentStageObj ? currentStageObj.phases.flatMap(p => p.lessons) : allLessons;

  let html = `
    <div class="home-view">
      <div class="header">
        <img src="images/joseph_anime.webp" class="mascot" alt="Joseph Mascot"
          onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiB2aWV3Qm94PSIwIDAgMTIwIDEyMCI+PGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNjAiIGZpbGw9IiNGRkI1QzIiLz48dGV4dCB4PSI2MCIgeT0iNzUiIGZvbnQtc2l6ZT0iNTBweCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+YijwvdGV4dD48L3N2Zz4='">
        <h1 class="title">${CURRICULUM.appTitle}</h1>
      </div>

      <div class="srs-daily-log">
        <span class="srs-streak">🔥 ${app.profile.currentStreak || 0}일 연속</span>
        <span class="srs-stars">⭐ ${app.profile.stars || 0}</span>
        <button class="log-btn" id="view-log-btn">📊 학습 기록</button>
      </div>

      <div class="daily-quest-container">
        <button class="daily-quest-btn" id="daily-quest-btn" ${!hasDueCards && stampEarned ? 'disabled' : ''}>
          ${hasDueCards ? `🎯 오늘의 복습 미션 (${dueCardsIds.length}개)` : (stampEarned ? '✨ 오늘 미션 완료! ✨' : '🎯 오늘의 복습 미션 시작')}
        </button>
      </div>

      <div class="stage-selector">
        <button class="stage-btn" id="stage-prev-btn" ${app.currentMapStage <= 1 ? 'disabled' : ''}>◀</button>
        <div class="stage-title">${currentStageObj ? currentStageObj.title : '맵'}</div>
        <button class="stage-btn" id="stage-next-btn" ${app.currentMapStage >= stages.length ? 'disabled' : ''}>▶</button>
      </div>

      <div class="map-container">
        ${buildMapHtml(stageLessons, app.mapProgress)}
      </div>
    </div>
  `;

  app.appEl.innerHTML = html;

  document.getElementById('daily-quest-btn').addEventListener('click', () => {
    if (hasDueCards || !stampEarned) {
      window.location.hash = '#quiz/srs';
    }
  });

  document.getElementById('view-log-btn').addEventListener('click', () => {
    window.location.hash = '#log';
  });

  document.getElementById('stage-prev-btn')?.addEventListener('click', () => {
    if (app.currentMapStage > 1) { app.currentMapStage--; renderHome(app); }
  });
  document.getElementById('stage-next-btn')?.addEventListener('click', () => {
    if (app.currentMapStage < stages.length) { app.currentMapStage++; renderHome(app); }
  });
}

function buildMapHtml(stageLessons, mapProgress) {
  const nodesPerRow = 3;
  let html = '';

  for (let i = 0; i < stageLessons.length; i++) {
    const lesson = stageLessons[i];
    const isCompleted = mapProgress.completedLessons.includes(lesson.id);
    const isUnlocked = mapProgress.unlockedLessonId >= lesson.id || isCompleted;

    let nodeClass = 'map-node locked';
    if (isCompleted) nodeClass = 'map-node completed';
    else if (isUnlocked) nodeClass = 'map-node unlocked';

    const rowIndex = Math.floor(i / nodesPerRow);
    const colIndex = i % nodesPerRow;
    const gridRow = rowIndex * 2 + 1;
    const isLeftToRight = (rowIndex % 2 === 0);
    const gridCol = isLeftToRight ? (colIndex * 2 + 1) : (5 - (colIndex * 2));

    html += `
      <a href="${isUnlocked ? '#lesson/' + lesson.id : '#home'}"
         class="${nodeClass}"
         title="${lesson.row}"
         style="grid-row: ${gridRow}; grid-column: ${gridCol};">
        <span class="node-text">${lesson.row}</span>
        ${isCompleted ? '<div class="completed-badge">✓</div>' : ''}
      </a>
    `;

    if (i < stageLessons.length - 1) {
      const nextLesson = stageLessons[i + 1];
      const isNextUnlocked = mapProgress.unlockedLessonId >= nextLesson.id ||
        mapProgress.completedLessons.includes(nextLesson.id);
      const lineClass = isNextUnlocked ? 'path-line active' : 'path-line';

      if (colIndex < nodesPerRow - 1) {
        const lineGridCol = isLeftToRight ? gridCol + 1 : gridCol - 1;
        html += `<div class="${lineClass} horizontal" style="grid-row: ${gridRow}; grid-column: ${lineGridCol};"></div>`;
      } else {
        html += `<div class="${lineClass} vertical" style="grid-row: ${gridRow + 1}; grid-column: ${gridCol};"></div>`;
      }
    }
  }
  return html;
}
