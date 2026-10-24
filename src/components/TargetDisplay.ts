import { TargetResult } from '../engine/targetCalculator.ts';

export function renderTargetDisplay(target: TargetResult): string {
  const breakdownHtml = target.breakdownLines
    .map((line) => `<span class="breakdown-tag">${line}</span>`)
    .join('');

  return `
    <div class="target-display-card" id="target-display-card">
      <div class="target-subtitle">Today's Target</div>
      <div class="target-headline-wrapper">
        <span class="target-headline-number" id="headline-target-number">${target.displayTargetL.toFixed(1)}</span>
        <span class="target-headline-unit">L</span>
      </div>
      <div class="target-cups-text" id="target-cups-text">≈ ${target.cupsCount} standard cups (250 ml)</div>
      <div class="stacked-breakdown-wrapper" id="stacked-breakdown-wrapper" aria-label="Target calculation breakdown">
        ${breakdownHtml}
      </div>
    </div>
  `;
}
