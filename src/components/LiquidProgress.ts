export interface ProgressData {
  loggedMl: number;
  targetMl: number;
  remainingMl: number;
  percent: number;
  isGoalReached: boolean;
}

let animationFrameId: number | null = null;
let wavePhase = 0;

export function renderLiquidProgress(data: ProgressData): string {
  const loggedL = (data.loggedMl / 1000).toFixed(2);
  const remainingL = (data.remainingMl / 1000).toFixed(2);
  const celebrationClass = data.isGoalReached ? 'goal-reached' : '';

  return `
    <div
      class="liquid-progress-container ${celebrationClass}"
      id="liquid-progress-container"
      role="progressbar"
      aria-valuenow="${data.percent}"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label="Hydration progress: ${loggedL} of ${(data.targetMl / 1000).toFixed(1)} liters (${data.percent}%)"
    >
      <canvas id="liquid-canvas" class="liquid-canvas" width="280" height="280"></canvas>
      
      <div class="liquid-overlay-content">
        ${
          data.isGoalReached
            ? `<div class="celebration-badge" id="celebration-badge">🎉 Oasis Goal Reached!</div>`
            : ''
        }
        <div class="progress-percent" id="progress-percent-text">${data.percent}%</div>
        <div class="progress-volume" id="progress-volume-text">${loggedL} L logged</div>
        <div class="progress-remaining" id="progress-remaining-text">
          ${data.isGoalReached ? 'Daily goal complete! 💧' : `${remainingL} L remaining`}
        </div>
      </div>
    </div>
  `;
}

export function initLiquidCanvas(percent: number): void {
  const canvas = document.getElementById('liquid-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const width = canvas.width;
  const height = canvas.height;
  const radius = width / 2;

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    // Circular clipping path
    ctx.save();
    ctx.beginPath();
    ctx.arc(radius, radius, radius - 4, 0, Math.PI * 2);
    ctx.clip();

    // Background vessel fill
    const isTwilight = document.documentElement.getAttribute('data-theme') === 'twilight';
    ctx.fillStyle = isTwilight ? '#1E293B' : '#FAF6F0';
    ctx.fillRect(0, 0, width, height);

    // Water level calculation
    const fillRatio = Math.min(1, Math.max(0, percent / 100));
    const waterY = height - height * fillRatio;

    // Draw Water
    ctx.beginPath();
    if (reducedMotion || fillRatio <= 0 || fillRatio >= 1) {
      // Static water level for reduced motion or empty/full
      ctx.rect(0, waterY, width, height - waterY);
    } else {
      // Sinusoidal wave
      wavePhase += 0.04;
      const waveAmplitude = 6;
      const waveFrequency = 0.025;

      ctx.moveTo(0, height);
      ctx.lineTo(0, waterY);

      for (let x = 0; x <= width; x += 5) {
        const y = waterY + Math.sin(x * waveFrequency + wavePhase) * waveAmplitude;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
    }

    // Gradient fill
    const waterGradient = ctx.createLinearGradient(0, waterY, 0, height);
    if (isTwilight) {
      waterGradient.addColorStop(0, '#38BDF8');
      waterGradient.addColorStop(1, '#0284C7');
    } else {
      waterGradient.addColorStop(0, '#14B8A6');
      waterGradient.addColorStop(1, '#0D9488');
    }

    ctx.fillStyle = waterGradient;
    ctx.fill();

    ctx.restore();

    // Vessel border ring
    ctx.beginPath();
    ctx.arc(radius, radius, radius - 4, 0, Math.PI * 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = isTwilight ? '#334155' : '#E2D9CE';
    ctx.stroke();

    if (!reducedMotion && fillRatio > 0 && fillRatio < 1) {
      animationFrameId = requestAnimationFrame(draw);
    }
  }

  draw();
}
