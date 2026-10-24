import { RamadanSchedule } from '../engine/ramadanScheduler.ts';

export function renderRamadanScheduleView(schedule: RamadanSchedule): string {
  if (schedule.isFasting && schedule.countdownToIftar) {
    const { hours, minutes, seconds } = schedule.countdownToIftar;
    const pad = (n: number) => n.toString().padStart(2, '0');

    return `
      <section class="ramadan-section" id="ramadan-fasting-card">
        <div class="ramadan-badge">🌙 Daylight Fasting Window</div>
        <h3 class="ramadan-heading">Countdown to Iftar</h3>
        <div class="countdown-display" id="iftar-countdown-timer">
          <span class="countdown-digit">${pad(hours)}</span>
          <span class="countdown-sep">:</span>
          <span class="countdown-digit">${pad(minutes)}</span>
          <span class="countdown-sep">:</span>
          <span class="countdown-digit">${pad(seconds)}</span>
        </div>
        <p class="ramadan-subtext">
          Conserve energy. Your tailored evening hydration schedule will activate at Maghrib sunset.
        </p>
      </section>
    `;
  }

  // Evening Drinking Window
  const constrainedBadge = schedule.isWindowConstrained
    ? `
      <div class="info-window-badge" id="info-window-badge" role="note">
        ℹ️ Safe Window Target: <strong>${schedule.effectiveTargetL} L</strong> (capped for safety under 0.75 L/hr)
      </div>
    `
    : '';

  const checkpointsHtml = schedule.checkpoints
    .map((cp) => {
      const activeClass = cp.isCurrent ? 'current-checkpoint' : '';
      const pastClass = cp.isPast ? 'past-checkpoint' : '';
      const pct = cp.allocatedMl > 0 ? Math.min(100, Math.round((cp.consumedMl / cp.allocatedMl) * 100)) : 0;

      return `
        <div class="checkpoint-card ${activeClass} ${pastClass}" id="${cp.id}">
          <div class="checkpoint-header">
            <span class="checkpoint-title">${cp.label}</span>
            <span class="checkpoint-time">${cp.timeString}</span>
          </div>
          <div class="checkpoint-stats">
            <span class="checkpoint-allocated">${cp.allocatedMl} ml</span>
            <span class="checkpoint-status">
              ${cp.isCurrent ? '✨ Active Now' : cp.isPast ? '✓ Completed' : 'Upcoming'}
            </span>
          </div>
          <div class="checkpoint-bar-track">
            <div class="checkpoint-bar-fill" style="width: ${pct}%;"></div>
          </div>
        </div>
      `;
    })
    .join('');

  return `
    <section class="ramadan-section" id="ramadan-evening-schedule">
      <div class="ramadan-badge">🌙 Ramadan Evening Drinking Plan</div>
      <h3 class="ramadan-heading">Paced Overnight Hydration</h3>
      <p class="ramadan-subtext">
        Capped at 0.75 L/hour to ensure safe, steady absorption through suhoor.
      </p>
      ${constrainedBadge}
      <div class="checkpoints-list" role="list">
        ${checkpointsHtml}
      </div>
    </section>
  `;
}
