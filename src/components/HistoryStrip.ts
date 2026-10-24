export interface DayHistoryItem {
  dateKey: string;
  dayLabel: string;
  isAchieved: boolean;
  isToday: boolean;
}

export function renderHistoryStrip(
  historyItems: DayHistoryItem[],
  streakCount: number
): string {
  const circlesHtml = historyItems
    .map((item) => {
      const todayClass = item.isToday ? 'today-pill' : '';
      const achievedClass = item.isAchieved ? 'achieved' : 'missed';
      const statusIcon = item.isAchieved ? '✓' : '—';
      const labelAria = `${item.dayLabel}: ${item.isAchieved ? 'Goal reached' : 'Missed'}${item.isToday ? ' (Today)' : ''}`;

      return `
        <div class="history-day-col ${todayClass}" aria-label="${labelAria}">
          <span class="history-day-name">${item.dayLabel}</span>
          <div class="history-circle ${achievedClass}">
            <span>${statusIcon}</span>
          </div>
        </div>
      `;
    })
    .join('');

  return `
    <section class="history-strip-section" id="history-strip-section">
      <div class="history-header">
        <span class="history-title">7-Day History</span>
        <span class="history-streak-badge" id="history-streak-count">
          🔥 ${streakCount} ${streakCount === 1 ? 'Day' : 'Days'} Streak
        </span>
      </div>

      <div class="history-circles-row" role="group" aria-label="7-day hydration history">
        ${circlesHtml}
      </div>

      <p class="history-rule-hint">
        Streak increments when you reach ≥90% of each day's personalized target.
      </p>
    </section>
  `;
}
