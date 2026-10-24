export interface LogControlsData {
  lastLoggedMl: number | null;
}

export function renderLogControls(data: LogControlsData): string {
  const undoToastHtml = data.lastLoggedMl
    ? `
      <div class="undo-toast" id="undo-toast" role="status" aria-live="polite">
        <span>Logged ${data.lastLoggedMl} ml</span>
        <button type="button" class="undo-btn" id="btn-undo-log" aria-label="Undo last water log">
          ↩️ Undo
        </button>
      </div>
    `
    : '';

  return `
    <div class="log-controls-section" id="log-controls-section">
      <div class="hero-log-wrapper">
        <button
          type="button"
          class="hero-log-btn"
          id="btn-log-default"
          data-amount="250"
          aria-label="Log 250 milliliters of water"
        >
          <span class="hero-log-icon">💧</span>
          <span class="hero-log-title">+250 ml</span>
          <span class="hero-log-sub">Standard Glass</span>
        </button>
      </div>

      <div class="quick-presets-row" role="group" aria-label="Quick logging presets">
        <button
          type="button"
          class="preset-btn"
          id="btn-log-150"
          data-amount="150"
          aria-label="Log 150 milliliters small sip"
        >
          +150 ml (Small Sip)
        </button>
        <button
          type="button"
          class="preset-btn"
          id="btn-log-500"
          data-amount="500"
          aria-label="Log 500 milliliters bottle"
        >
          +500 ml (Bottle)
        </button>
      </div>

      ${undoToastHtml}
    </div>
  `;
}
