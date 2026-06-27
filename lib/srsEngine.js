// lib/srsEngine.js
// Simplified SM-2 Algorithm

export const SRSEngine = {
  /**
   * Calculate next SRS stats based on quiz result.
   * @param {Object} currentStats - { interval: number, easeFactor: number, nextReviewDate: string }
   * @param {boolean} isCorrect - whether the user answered correctly
   * @returns {Object} - new stats
   */
  processReview(currentStats, isCorrect) {
    let { interval = 0, easeFactor = 2.5, nextReviewDate = null } = currentStats || {};
    
    if (isCorrect) {
      if (interval === 0) {
        interval = 1;
      } else if (interval === 1) {
        interval = 3;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      easeFactor = Math.max(1.3, easeFactor + 0.1);
    } else {
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);
    
    return {
      interval,
      easeFactor,
      nextReviewDate: nextDate.toISOString().split('T')[0] // YYYY-MM-DD
    };
  },

  /**
   * Gets cards due for review today.
   * @param {Object} srsStats - from StorageAdapter
   * @param {string} todayStr - YYYY-MM-DD
   */
  getDueCards(srsStats, todayStr) {
    const dueCards = [];
    for (const [cardId, stats] of Object.entries(srsStats)) {
      if (stats.nextReviewDate && stats.nextReviewDate <= todayStr) {
        dueCards.push(cardId);
      }
    }
    return dueCards;
  }
};
