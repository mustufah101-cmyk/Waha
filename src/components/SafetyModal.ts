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

export function renderAboutModal(isOpen: boolean): string {
  if (!isOpen) {
    return '';
  }

  return `
    <div class="modal-overlay" id="about-modal">
      <div class="modal-content" role="dialog" aria-labelledby="about-title" aria-modal="true">
        <div class="modal-header">
          <h2 class="modal-title" id="about-title">About Waha</h2>
          <button
            type="button"
            class="modal-close-btn"
            id="btn-close-about"
            aria-label="Close About"
          >
            ✕
          </button>
        </div>

        <div class="about-content">
          <section class="about-section">
            <h3>Purpose</h3>
            <p>Waha is a personal hydration companion built for desert climates and Ramadan fasting schedules. It calculates your daily water target from weight, heat, outdoor exposure, and exercise — then helps you log intake and pace evening drinking safely.</p>
          </section>

          <section class="about-section">
            <h3>How the Target Works</h3>
            <ul>
              <li><strong>Base:</strong> 0.033 L × body weight (e.g., 70 kg → 2.31 L)</li>
              <li><strong>Heat:</strong> Mild +0.0 L, Hot +0.50 L, Extreme +0.80 L</li>
              <li><strong>Outdoors:</strong> Indoors +0.0 L, Mixed +0.25 L, Outdoors +0.50 L</li>
              <li><strong>Workout:</strong> +0.35 L per 30 minutes</li>
              <li><strong>Range:</strong> Clamped to 1.5 L – 4.5 L</li>
            </ul>
            <p>The headline target rounds to 0.1 L for display; the unrounded value drives scheduling and streak checks.</p>
          </section>

          <section class="about-section">
            <h3>Ramadan Evening Scheduler</h3>
            <p>When Ramadan mode is active, your target is split across four checkpoints from iftar to suhoor (20% / 40% / 15% / 25%). A rolling 60-minute safety cap of 0.75 L spaces checkpoints. If the fasting window is too short, the effective target becomes the safe window capacity, and any overflow stays unscheduled with an informational badge — never an error.</p>
          </section>

          <section class="about-section safety-disclaimer">
            <h3>⚠️ Hydration & Health Notice</h3>
            <p><strong>Waha provides guidance based on general physiological formulas. It is not medical diagnosis, treatment, or advice.</strong></p>
            <ul>
              <li>Individuals with kidney, cardiovascular, or metabolic conditions must follow their physician's fluid recommendations.</li>
              <li>Pregnant and nursing individuals should consult their healthcare provider.</li>
              <li>Those exempt from fasting (illness, travel, pregnancy, etc.) should prioritize health and follow medical guidance.</li>
              <li>Overhydration can be dangerous. Do not force fluids beyond comfort or medical advice.</li>
            </ul>
          </section>

          <section class="about-section">
            <h3>Data & Privacy</h3>
            <p>100% offline. All data stays in your browser's localStorage. No accounts, no tracking, no network requests after load.</p>
          </section>

          <section class="about-section">
            <h3>Built For</h3>
            <p>Build with AI Basics hackathon (Devpost). Source on GitHub.</p>
          </section>
        </div>
      </div>
    </div>
  `;
}
