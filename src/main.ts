import { store } from './state/store.ts';
import { renderHeader } from './components/Header.ts';
import { renderTargetDisplay } from './components/TargetDisplay.ts';
import { renderLiquidProgress, initLiquidCanvas } from './components/LiquidProgress.ts';
import { renderLogControls } from './components/LogControls.ts';
import { renderConditionSelector } from './components/ConditionSelector.ts';
import { renderOnboardingModal } from './components/SafetyModal.ts';

function renderApp(): void {
  const appEl = document.getElementById('app');
  if (!appEl) return;

  const state = store.getState();
  const target = store.getCalculatedTarget();
  const progress = store.getProgress();

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
      ${renderLiquidProgress(progress)}
      ${renderLogControls({ lastLoggedMl: store.lastLoggedEntry?.amountMl ?? null })}
      ${renderConditionSelector(state.conditions)}
    </main>
    ${renderOnboardingModal(state.profile)}
  `;

  initLiquidCanvas(progress.percent);
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

  // Water logging buttons (hero + presets)
  const logBtns = document.querySelectorAll<HTMLButtonElement>('[data-amount]');
  logBtns.forEach((btn) => {
    btn.onclick = () => {
      const amount = Number(btn.getAttribute('data-amount'));
      if (!isNaN(amount) && amount > 0) {
        store.logWater(amount);
      }
    };
  });

  // Undo button
  const undoBtn = document.getElementById('btn-undo-log');
  if (undoBtn) {
    undoBtn.onclick = () => {
      store.undoLastLog();
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
