import { store } from './state/store.ts';
import { renderHeader } from './components/Header.ts';
import { renderTargetDisplay } from './components/TargetDisplay.ts';
import { renderConditionSelector } from './components/ConditionSelector.ts';
import { renderOnboardingModal } from './components/SafetyModal.ts';

function renderApp(): void {
  const appEl = document.getElementById('app');
  if (!appEl) return;

  const state = store.getState();
  const target = store.getCalculatedTarget();

  // Update theme on root element
  if (state.ramadanMode) {
    document.documentElement.setAttribute('data-theme', 'twilight');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  appEl.innerHTML = `
    ${renderHeader(state.ramadanMode)}
    <main>
      ${renderTargetDisplay(target)}
      ${renderConditionSelector(state.conditions)}
    </main>
    ${renderOnboardingModal(state.profile)}
  `;

  attachEventListeners();
}

function attachEventListeners(): void {
  // Ramadan toggle
  const ramadanBtn = document.getElementById('btn-toggle-ramadan');
  if (ramadanBtn) {
    ramadanBtn.onclick = () => {
      store.toggleRamadanMode();
    };
  }

  // Heat pill selectors
  const heatBtns = document.querySelectorAll<HTMLButtonElement>('[data-heat]');
  heatBtns.forEach((btn) => {
    btn.onclick = () => {
      const heat = btn.getAttribute('data-heat') as 'mild' | 'hot' | 'extreme';
      if (heat) {
        store.setHeat(heat);
      }
    };
  });

  // Workout duration buttons
  const workoutBtns = document.querySelectorAll<HTMLButtonElement>('[data-workout]');
  workoutBtns.forEach((btn) => {
    btn.onclick = () => {
      const workout = Number(btn.getAttribute('data-workout'));
      if (!isNaN(workout)) {
        store.setWorkoutMinutes(workout);
      }
    };
  });

  // Onboarding interactions
  const ackCheck = document.getElementById('safety-ack-check') as HTMLInputElement | null;
  const startBtn = document.getElementById('btn-start-oasis') as HTMLButtonElement | null;
  const onboardingForm = document.getElementById('onboarding-form') as HTMLFormElement | null;

  if (ackCheck && startBtn) {
    ackCheck.onchange = () => {
      startBtn.disabled = !ackCheck.checked;
    };
  }

  if (onboardingForm) {
    onboardingForm.onsubmit = (e) => {
      e.preventDefault();
      const weightInput = document.getElementById('onboarding-weight') as HTMLInputElement | null;
      const outdoorSelect = document.getElementById('onboarding-outdoor') as HTMLSelectElement | null;

      const weightKg = Number(weightInput?.value) || 70;
      const outdoorTime = (outdoorSelect?.value as 'indoors' | 'mixed' | 'outdoors') || 'mixed';

      store.completeOnboarding(weightKg, outdoorTime);
    };
  }
}

// Initial mount & subscription
store.subscribe(() => {
  renderApp();
});

document.addEventListener('DOMContentLoaded', () => {
  renderApp();
});
