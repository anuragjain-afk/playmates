// ─── Constants ────────────────────────────────────────────────────────────────
export const W = 800;
export const H = 500;
const PADDLE_W = 14;
const PADDLE_H = 100;
const BALL_R = 9;
const PADDLE_SPEED = 6;
const BALL_SPEED_INIT = 5;
const BALL_SPEED_MAX = 14;
const PADDLE_X_MARGIN = 14; // distance from left/right wall
const WIN_SCORE = 7;

// ─── State ────────────────────────────────────────────────────────────────────
export function createInitialState() {
  return {
    ball: { x: W / 2, y: H / 2, vx: BALL_SPEED_INIT, vy: 3 },
    p1: { y: H / 2 - PADDLE_H / 2, score: 0 },
    p2: { y: H / 2 - PADDLE_H / 2, score: 0 },
    scored: null,
    winner: null,
  };
}

// ─── Update ───────────────────────────────────────────────────────────────────
export function update(state, inputs) {
  const s = JSON.parse(JSON.stringify(state));
  s.scored = null;

  // Move paddles
  if (inputs.p1.up) s.p1.y = Math.max(0, s.p1.y - PADDLE_SPEED);
  if (inputs.p1.down) s.p1.y = Math.min(H - PADDLE_H, s.p1.y + PADDLE_SPEED);
  if (inputs.p2.up) s.p2.y = Math.max(0, s.p2.y - PADDLE_SPEED);
  if (inputs.p2.down) s.p2.y = Math.min(H - PADDLE_H, s.p2.y + PADDLE_SPEED);

  // Move ball
  s.ball.x += s.ball.vx;
  s.ball.y += s.ball.vy;

  // Top / bottom wall bounce
  if (s.ball.y - BALL_R <= 0) {
    s.ball.y = BALL_R;
    s.ball.vy *= -1;
  }
  if (s.ball.y + BALL_R >= H) {
    s.ball.y = H - BALL_R;
    s.ball.vy *= -1;
  }

  // P1 paddle collision (left side)
  const p1x = PADDLE_X_MARGIN;
  if (
    s.ball.vx < 0 &&
    s.ball.x - BALL_R <= p1x + PADDLE_W &&
    s.ball.x - BALL_R >= p1x &&
    s.ball.y + BALL_R >= s.p1.y &&
    s.ball.y - BALL_R <= s.p1.y + PADDLE_H
  ) {
    const hitPos = (s.ball.y - (s.p1.y + PADDLE_H / 2)) / (PADDLE_H / 2);
    const angle = hitPos * 0.8;
    const speed = Math.min(Math.hypot(s.ball.vx, s.ball.vy) * 1.07, BALL_SPEED_MAX);
    s.ball.vx = Math.cos(angle) * speed;
    s.ball.vy = Math.sin(angle) * speed;
    s.ball.x = p1x + PADDLE_W + BALL_R + 1;
  }

  // P2 paddle collision (right side)
  const p2x = W - PADDLE_X_MARGIN - PADDLE_W;
  if (
    s.ball.vx > 0 &&
    s.ball.x + BALL_R >= p2x &&
    s.ball.x + BALL_R <= p2x + PADDLE_W + 10 &&
    s.ball.y + BALL_R >= s.p2.y &&
    s.ball.y - BALL_R <= s.p2.y + PADDLE_H
  ) {
    const hitPos = (s.ball.y - (s.p2.y + PADDLE_H / 2)) / (PADDLE_H / 2);
    const speed = Math.min(Math.hypot(s.ball.vx, s.ball.vy) * 1.07, BALL_SPEED_MAX);
    s.ball.vx = -Math.cos(hitPos * 0.8) * speed;
    s.ball.vy = Math.sin(hitPos * 0.8) * speed;
    s.ball.x = p2x - BALL_R - 1;
  }

  // Scoring
  if (s.ball.x < -BALL_R) {
    s.p2.score++;
    s.scored = 2;
    resetBall(s, 1);
  }
  if (s.ball.x > W + BALL_R) {
    s.p1.score++;
    s.scored = 1;
    resetBall(s, -1);
  }

  // Check for winner (first to 7)
  if (s.p1.score >= WIN_SCORE) s.winner = 1;
  if (s.p2.score >= WIN_SCORE) s.winner = 2;

  return s;
}

function resetBall(s, directionX) {
  s.ball.x = W / 2;
  s.ball.y = H / 2;
  s.ball.vx = directionX * BALL_SPEED_INIT;
  s.ball.vy = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 2);
}

// ─── Draw ─────────────────────────────────────────────────────────────────────
export function draw(ctx, state) {
  const { ball, p1, p2 } = state;

  // Background with subtle gradient
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#08080f');
  bgGrad.addColorStop(0.5, '#0c0c18');
  bgGrad.addColorStop(1, '#08080f');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Subtle grid lines
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.restore();

  // Center dashed line
  ctx.save();
  ctx.setLineDash([14, 12]);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2, 0);
  ctx.lineTo(W / 2, H);
  ctx.stroke();
  ctx.restore();

  // Center circle
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 50, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Scores with glow
  ctx.save();
  ctx.font = '800 60px "Inter", "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // P1 score (left) – purple glow
  ctx.shadowColor = '#a78bfa';
  ctx.shadowBlur = 24;
  ctx.fillStyle = 'rgba(167, 139, 250, 0.5)';
  ctx.fillText(p1.score, W / 4, 30);
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillText(p1.score, W / 4, 30);

  // P2 score (right) – pink glow
  ctx.shadowColor = '#f472b6';
  ctx.shadowBlur = 24;
  ctx.fillStyle = 'rgba(244, 114, 182, 0.5)';
  ctx.fillText(p2.score, (3 * W) / 4, 30);
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillText(p2.score, (3 * W) / 4, 30);
  ctx.restore();

  // Score labels
  ctx.save();
  ctx.font = '700 11px "Inter", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '2px';
  ctx.fillStyle = 'rgba(167, 139, 250, 0.35)';
  ctx.fillText('P 1', W / 4, 98);
  ctx.fillStyle = 'rgba(244, 114, 182, 0.35)';
  ctx.fillText('P 2', (3 * W) / 4, 98);
  ctx.restore();

  // P1 paddle (left) — purple with neon glow
  drawPaddle(ctx, PADDLE_X_MARGIN, p1.y, PADDLE_W, PADDLE_H, '#a78bfa', 'rgba(167, 139, 250, 0.3)');

  // P2 paddle (right) — pink with neon glow
  drawPaddle(ctx, W - PADDLE_X_MARGIN - PADDLE_W, p2.y, PADDLE_W, PADDLE_H, '#f472b6', 'rgba(244, 114, 182, 0.3)');

  // Ball trail (simple motion blur)
  const speed = Math.hypot(ball.vx, ball.vy);
  const trailCount = Math.min(Math.floor(speed / 2), 5);
  for (let i = trailCount; i > 0; i--) {
    const trailX = ball.x - ball.vx * (i * 0.7);
    const trailY = ball.y - ball.vy * (i * 0.7);
    const alpha = 0.06 * (1 - i / (trailCount + 1));
    ctx.beginPath();
    ctx.arc(trailX, trailY, BALL_R - 1, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fill();
  }

  // Ball with glow
  ctx.save();
  // Outer glow
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 24;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Inner highlight
  const ballGrad = ctx.createRadialGradient(
    ball.x - 2, ball.y - 2, 0,
    ball.x, ball.y, BALL_R
  );
  ballGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  ballGrad.addColorStop(0.6, 'rgba(200, 200, 240, 0.9)');
  ballGrad.addColorStop(1, 'rgba(167, 139, 250, 0.6)');
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
  ctx.fillStyle = ballGrad;
  ctx.fill();
  ctx.restore();

  // Top and bottom edge glow lines
  ctx.save();
  const topGrad = ctx.createLinearGradient(0, 0, W, 0);
  topGrad.addColorStop(0, 'rgba(167, 139, 250, 0.08)');
  topGrad.addColorStop(0.5, 'rgba(244, 114, 182, 0.08)');
  topGrad.addColorStop(1, 'rgba(167, 139, 250, 0.08)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, W, 2);
  ctx.fillRect(0, H - 2, W, 2);
  ctx.restore();
}

function drawPaddle(ctx, x, y, w, h, color, glowColor) {
  ctx.save();

  // Outer glow
  ctx.shadowColor = color;
  ctx.shadowBlur = 28;

  // Paddle body with gradient
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, color);
  grad.addColorStop(1, glowColor);

  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 7);
  ctx.fillStyle = color;
  ctx.fill();

  // Inner highlight
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.roundRect(x + 2, y + 4, w - 4, h - 8, 4);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.fill();

  ctx.restore();
}
