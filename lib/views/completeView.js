import { getTotalProgress } from '../gameLogic.js';

export function showLessonComplete(app) {
  const lessonId = app.currentLesson.id;
  const { total, done } = getTotalProgress(app);

  const messages = [
    'すごい！よくできました！🌟',
    'やったー！かんぺきです！🎉',
    'すばらしい！천재야！✨',
    'がんばった！よかったです！🏆',
    'すごいね！どんどんうまくなってる！🚀'
  ];
  const msg = messages[Math.floor(Math.random() * messages.length)];

  app.appEl.innerHTML = `
    <div class="lesson-complete-view">
      <img src="images/realistic/joseph_cheer.webp" class="mascot-cheer" alt="Joseph cheering"
        onerror="this.src='images/joseph_anime.webp'">
      <div class="speech-bubble">${msg}</div>
      <div class="complete-stats">
        <div class="complete-title">레슨 완료! 🎊</div>
        <div class="complete-progress">전체 ${done} / ${total} 레슨 완료</div>
      </div>
      <div class="complete-actions">
        <button class="quiz-start-btn" id="start-quiz-btn">🎯 퀴즈 도전!</button>
        <a href="#home" class="home-return-btn">🏠 홈으로</a>
      </div>
    </div>
  `;

  document.getElementById('start-quiz-btn').addEventListener('click', () => {
    window.location.hash = `#quiz/${lessonId}`;
  });
}
