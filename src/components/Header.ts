export interface HeaderRenderProps {
  ramadanMode: boolean;
  streakCount: number;
  isAboutOpen: boolean;
}

export function renderHeader(props: HeaderRenderProps): string {
  const { ramadanMode, streakCount, isAboutOpen } = props;
  const ramadanActive = ramadanMode ? 'active' : '';
  const ramadanText = ramadanMode ? '🌙 Ramadan Mode ON' : '☀️ Day Mode';
  const streakText = streakCount > 0 ? `🔥 ${streakCount}` : '🔥 —';

  return `
    <header class="app-header">
      <div class="brand-wrapper">
        <span class="brand-logo" aria-label="Waha Oasis">💧 Waha</span>
      </div>
      <div class="header-actions">
        <span class="streak-badge" aria-label="${streakCount > 0 ? `${streakCount} day streak` : 'No streak yet'}">
          ${streakText}
        </span>
        <button
          type="button"
          class="icon-btn ramadan-toggle-btn ${ramadanActive}"
          id="btn-toggle-ramadan"
          aria-pressed="${ramadanMode}"
        >
          ${ramadanText}
        </button>
        <button
          type="button"
          class="icon-btn about-btn ${isAboutOpen ? 'active' : ''}"
          id="btn-open-about"
          aria-expanded="${isAboutOpen}"
          aria-label="About & Safety"
        >
          ⓘ
        </button>
      </div>
    </header>
  `;
}
