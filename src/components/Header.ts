export function renderHeader(ramadanMode: boolean): string {
  const ramadanActive = ramadanMode ? 'active' : '';
  const ramadanText = ramadanMode ? '🌙 Ramadan Mode ON' : '☀️ Day Mode';

  return `
    <header class="app-header">
      <div class="brand-wrapper">
        <span class="brand-logo" aria-label="Waha Oasis">💧 Waha</span>
      </div>
      <div class="header-actions">
        <button
          type="button"
          class="icon-btn ramadan-toggle-btn ${ramadanActive}"
          id="btn-toggle-ramadan"
          aria-pressed="${ramadanMode}"
        >
          ${ramadanText}
        </button>
      </div>
    </header>
  `;
}
