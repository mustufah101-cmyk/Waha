import { DayConditions } from '../state/storage.ts';

export function renderConditionSelector(conditions: DayConditions): string {
  const isMild = conditions.heat === 'mild' ? 'active' : '';
  const isHot = conditions.heat === 'hot' ? 'active' : '';
  const isExtreme = conditions.heat === 'extreme' ? 'active' : '';

  const isW0 = conditions.workoutMinutes === 0 ? 'active' : '';
  const isW30 = conditions.workoutMinutes === 30 ? 'active' : '';
  const isW60 = conditions.workoutMinutes === 60 ? 'active' : '';

  return `
    <div class="condition-section" id="condition-section">
      <span class="section-label">Today's Temperature</span>
      <div class="pill-group" role="group" aria-label="Temperature conditions">
        <button type="button" class="pill-btn ${isMild}" data-heat="mild" id="btn-heat-mild">
          🌤️ Mild
        </button>
        <button type="button" class="pill-btn ${isHot}" data-heat="hot" id="btn-heat-hot">
          ☀️ Hot (+0.5L)
        </button>
        <button type="button" class="pill-btn ${isExtreme}" data-heat="extreme" id="btn-heat-extreme">
          🔥 Extreme (+0.8L)
        </button>
      </div>

      <div class="workout-toggle-row">
        <span class="workout-label">Workout / Exercise</span>
        <div class="workout-options" role="group" aria-label="Workout duration">
          <button type="button" class="workout-pill ${isW0}" data-workout="0" id="btn-workout-0">None</button>
          <button type="button" class="workout-pill ${isW30}" data-workout="30" id="btn-workout-30">+30m</button>
          <button type="button" class="workout-pill ${isW60}" data-workout="60" id="btn-workout-60">+60m</button>
        </div>
      </div>
    </div>
  `;
}
