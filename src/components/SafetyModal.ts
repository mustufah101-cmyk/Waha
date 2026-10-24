import { UserProfile } from '../state/storage.ts';

export function renderOnboardingModal(profile: UserProfile): string {
  if (profile.onboardingCompleted) {
    return '';
  }

  return `
    <div class="modal-overlay" id="onboarding-modal">
      <div class="modal-content" role="dialog" aria-labelledby="onboarding-title" aria-modal="true">
        <h2 class="modal-title" id="onboarding-title">Welcome to Waha</h2>
        <p class="modal-desc">
          Personalized hydration tailored to desert heat and fasting routines. Let's calibrate your daily baseline.
        </p>

        <form id="onboarding-form">
          <div class="form-group">
            <label class="form-label" for="onboarding-weight">Body Weight (kg)</label>
            <input
              type="number"
              id="onboarding-weight"
              class="form-input"
              min="30"
              max="250"
              value="${profile.weightKg || 70}"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="onboarding-outdoor">Usual Daily Outdoor Time</label>
            <select id="onboarding-outdoor" class="form-input" required>
              <option value="indoors" ${profile.outdoorTime === 'indoors' ? 'selected' : ''}>Mostly Indoors (+0.0 L)</option>
              <option value="mixed" ${profile.outdoorTime === 'mixed' ? 'selected' : ''}>Mixed Indoors & Outdoors (+0.25 L)</option>
              <option value="outdoors" ${profile.outdoorTime === 'outdoors' ? 'selected' : ''}>Mostly Outdoors (+0.50 L)</option>
            </select>
          </div>

          <div class="safety-box">
            <strong>⚠️ Hydration & Health Notice:</strong>
            Waha provides guidance based on general physiological formulas. It is not medical diagnosis. Individuals with kidney, cardiovascular, or metabolic conditions, or pregnant individuals, must follow their physician's fluid recommendations. Observers exempt from fasting should prioritize health.
          </div>

          <label class="checkbox-row" for="safety-ack-check">
            <input type="checkbox" id="safety-ack-check" class="checkbox-input" required />
            <span class="checkbox-label">I have read and acknowledge this health notice.</span>
          </label>

          <button type="submit" class="primary-btn" id="btn-start-oasis" disabled>
            Start Oasis 💧
          </button>
        </form>
      </div>
    </div>
  `;
}
