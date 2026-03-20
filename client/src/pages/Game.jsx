import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import socket from '../socket';

import * as Pong from '../games/Pong';
import * as CarRace from '../games/CarRace';

const GAME_MODULES = { pong: Pong, 'car-race': CarRace };

export default function Game() {
  const { roomId } = useParams();
  const { state: routeState } = useLocation();
  const navigate = useNavigate();

  const isHost = routeState?.isHost ?? true;
  const mode = routeState?.mode ?? 1;
  const playerNum = routeState?.playerNum ?? 1;
  const autoStart = routeState?.autoStart ?? false;
  const game = routeState?.game ?? 'pong';
  const selectedCar = routeState?.selectedCar ?? 'sports';
  const selectedTrack = routeState?.selectedTrack ?? 'speedway';

  const G = GAME_MODULES[game] || Pong;
  const isWebGL = G.RENDERER_TYPE === 'webgl';

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const gameStateRef = useRef(G.createInitialState());
  const inputsRef = useRef(getDefaultInputs(G));
  const animFrameRef = useRef(null);
  const gameLoopRef = useRef(null);
  const rendererReady = useRef(false);

  const [status, setStatus] = useState(autoStart ? 'playing' : 'waiting');
  const [controllerCount, setControllerCount] = useState(0);
  const [winner, setWinner] = useState(null);
  const [lapInfo, setLapInfo] = useState([0, 0]);
  const [countdown, setCountdown] = useState(null);
  const [speedInfo, setSpeedInfo] = useState([0, 0]);
  const [gearInfo, setGearInfo] = useState([1, 1]);
  const [nitroInfo, setNitroInfo] = useState([100, 100]);
  const [carPositions, setCarPositions] = useState([{ x: 0, z: 0 }, { x: 0, z: 0 }]);

  // ── Keyboard (Mode 1) ────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 1) return;
    const keyMap = buildKeyMap(game, playerNum);
    const down = (e) => {
      const m = keyMap[e.key];
      if (m) { e.preventDefault(); inputsRef.current[m[0]][m[1]] = true; }
    };
    const up = (e) => {
      const m = keyMap[e.key];
      if (m) inputsRef.current[m[0]][m[1]] = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [mode, playerNum, game]);

  // ── Guest: send input ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isHost || status !== 'playing') return;
    const iv = setInterval(() => {
      socket.emit('player-input', { roomId, playerNum, input: { ...inputsRef.current[`p${playerNum}`] } });
    }, 16);
    return () => clearInterval(iv);
  }, [isHost, status, playerNum, roomId]);

  // ── Init WebGL renderer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'playing' || !isWebGL || rendererReady.current) return;
    if (!containerRef.current) return;
    rendererReady.current = true;
    G.initRenderer(containerRef.current, {
      car1: selectedCar,
      car2: selectedCar, // Both players use same car type for fairness; can be changed
      track: selectedTrack,
    });
    const onResize = () => G.handleResize?.(containerRef.current);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [status, isWebGL]);

  // ── Host game loop ───────────────────────────────────────────────────────────
  const startLoop = useCallback(() => {
    const loop = () => {
      const next = G.update(gameStateRef.current, inputsRef.current);
      gameStateRef.current = next;
      socket.emit('game-state', { roomId, state: next });
      if (isWebGL) G.updateRenderer?.(next);
      if (game === 'car-race') {
        setLapInfo([next.cars[0].lap, next.cars[1].lap]);
        setSpeedInfo([Math.round(next.cars[0].speed * 260), Math.round(next.cars[1].speed * 260)]);
        setGearInfo([next.cars[0].gear, next.cars[1].gear]);
        setNitroInfo([Math.round(next.cars[0].nitro), Math.round(next.cars[1].nitro)]);
        setCarPositions([{ x: next.cars[0].x, z: next.cars[0].z }, { x: next.cars[1].x, z: next.cars[1].z }]);
        if (next.countdown > 0) {
          setCountdown(Math.ceil(next.countdown / 60));
        } else if (next.countdown === 0 && countdown !== null) {
          setCountdown(0);
          setTimeout(() => setCountdown(null), 1000);
        }
      }
      if (next.winner) {
        setWinner(next.winner);
        setStatus('won');
        cancelAnimationFrame(gameLoopRef.current);
        return;
      }
      gameLoopRef.current = requestAnimationFrame(loop);
    };
    gameLoopRef.current = requestAnimationFrame(loop);
  }, [roomId, game, isWebGL, countdown]);

  // ── Canvas render loop (Pong) ────────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'playing' || isWebGL) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const render = () => { G.draw(ctx, gameStateRef.current); animFrameRef.current = requestAnimationFrame(render); };
    render();
    if (isHost) startLoop();
    return () => { cancelAnimationFrame(animFrameRef.current); cancelAnimationFrame(gameLoopRef.current); };
  }, [status, isWebGL, isHost, startLoop]);

  // ── WebGL host loop ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'playing' || !isWebGL || !isHost) return;
    startLoop();
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [status, isWebGL, isHost, startLoop]);

  // ── WebGL guest sync ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'playing' || !isWebGL || isHost) return;
    const sync = () => {
      G.updateRenderer?.(gameStateRef.current);
      const st = gameStateRef.current;
      if (game === 'car-race' && st.cars) {
        setLapInfo([st.cars[0].lap, st.cars[1].lap]);
        setSpeedInfo([Math.round(st.cars[0].speed * 260), Math.round(st.cars[1].speed * 260)]);
        setGearInfo([st.cars[0].gear, st.cars[1].gear]);
        setNitroInfo([Math.round(st.cars[0].nitro), Math.round(st.cars[1].nitro)]);
        setCarPositions([{ x: st.cars[0].x, z: st.cars[0].z }, { x: st.cars[1].x, z: st.cars[1].z }]);
        if (st.countdown > 0) setCountdown(Math.ceil(st.countdown / 60));
        else if (countdown !== null) {
          setCountdown(0);
          setTimeout(() => setCountdown(null), 1000);
        }
      }
      animFrameRef.current = requestAnimationFrame(sync);
    };
    sync();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [status, isWebGL, isHost]);

  // ── Socket listeners ─────────────────────────────────────────────────────────
  useEffect(() => {
    socket.on('game-state', (state) => { if (!isHost) gameStateRef.current = state; });
    socket.on('player-input', ({ playerNum: p, input }) => { inputsRef.current[`p${p}`] = input; });
    socket.on('controller-connected', ({ controllerCount: c }) => setControllerCount(c));
    socket.on('game-start', () => setStatus('playing'));
    socket.on('player-disconnected', () => {
      setStatus('disconnected');
      cancelAnimationFrame(animFrameRef.current);
      cancelAnimationFrame(gameLoopRef.current);
    });
    return () => {
      socket.off('game-state'); socket.off('player-input'); socket.off('controller-connected');
      socket.off('game-start'); socket.off('player-disconnected');
    };
  }, [isHost]);

  // ── Cleanup ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      cancelAnimationFrame(gameLoopRef.current);
      if (isWebGL) { G.cleanup?.(); rendererReady.current = false; }
    };
  }, []);

  const controllerUrl = (n) => `${window.location.origin}/controller/${roomId}/${n}`;

  const tc = CarRace.TRACK_PRESETS[selectedTrack] || CarRace.TRACK_PRESETS.speedway;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>

      {/* QR codes (Mode 2 waiting) */}
      {status === 'waiting' && mode === 2 && (
        <div style={s.qrScreen}>
          <div style={s.qrHeader}>
            <span style={s.qrGameIcon}>{game === 'car-race' ? '🏎️' : '🏓'}</span>
            <h2 style={s.qrTitle}>
              {game === 'car-race' ? 'Car Race' : 'Pong'}
            </h2>
          </div>
          <p style={s.qrSub}>Scan QR codes to connect controllers</p>

          {/* Controller progress */}
          <div style={s.progressBar}>
            <div style={{ ...s.progressFill, width: `${(controllerCount / 2) * 100}%` }} />
          </div>
          <p style={s.progressText}>{controllerCount}/2 controllers connected</p>

          <div style={s.qrSplit}>
            {[1, 2].map((n) => (
              <div key={n} style={{
                ...s.qrPanel,
                borderColor: controllerCount >= n ? (n === 1 ? 'rgba(230, 57, 70, 0.25)' : 'rgba(0, 176, 255, 0.25)') : 'var(--border-subtle)',
              }}>
                <div style={{
                  ...s.playerTag,
                  background: n === 1 ? 'rgba(230, 57, 70, 0.15)' : 'rgba(0, 176, 255, 0.15)',
                  color: n === 1 ? '#ff6b6b' : '#40c4ff',
                  border: `1px solid ${n === 1 ? 'rgba(230, 57, 70, 0.25)' : 'rgba(0, 176, 255, 0.25)'}`,
                }}>
                  Player {n}
                </div>
                <div style={s.qrBox}>
                  <QRCodeSVG value={controllerUrl(n)} size={180} bgColor="transparent" fgColor="#ffffff" level="M" />
                </div>
                <p style={s.qrUrl}>{controllerUrl(n)}</p>
                {controllerCount >= n && (
                  <div style={{
                    ...s.connectedBadge,
                    animation: 'scaleIn 0.3s ease-out',
                  }}>
                    <span>✓</span> Connected
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode 1 waiting */}
      {status === 'waiting' && mode === 1 && (
        <div style={s.centered}>
          <div style={s.connectingSpinner} />
          <p style={s.connectingText}>Connecting...</p>
        </div>
      )}

      {/* Pong canvas */}
      {!isWebGL && (status === 'playing' || status === 'won') && (
        <div style={s.canvasWrapper}>
          <canvas ref={canvasRef} width={Pong.W} height={Pong.H} style={s.canvas} />
          {status === 'playing' && mode === 1 && <PongHint playerNum={playerNum} />}
          {status === 'won' && <WinOverlay winner={winner} playerNum={playerNum} onHome={() => navigate('/')} game={game} />}
        </div>
      )}

      {/* Car Race WebGL */}
      {isWebGL && (status === 'playing' || status === 'won') && (
        <div style={s.webglWrapper}>
          <div ref={containerRef} style={s.webglContainer} />

          {/* Countdown Overlay */}
          {countdown !== null && countdown > 0 && (
            <div style={s.countdownOverlay}>
              <div style={s.countdownNum} key={countdown}>{countdown}</div>
            </div>
          )}
          {countdown === 0 && (
            <div style={{ ...s.countdownOverlay, animation: 'fadeOut 0.8s ease-out forwards' }}>
              <div style={{ ...s.countdownNum, color: '#00ff88', fontSize: 80 }}>GO!</div>
            </div>
          )}

          {/* HUD */}
          <div style={s.carHUD}>
            {/* P1 side */}
            <div style={s.hudSide}>
              <div style={{ ...s.hudPlayerDot, background: '#e63946', boxShadow: '0 0 8px #e63946' }} />
              <span style={{ color: '#ff6b6b', fontWeight: 800, fontSize: 14, letterSpacing: 1 }}>P1</span>
              <span style={s.hudLap}>Lap {Math.min(lapInfo[0] + 1, CarRace.LAPS_TO_WIN)}/{CarRace.LAPS_TO_WIN}</span>
              <div style={s.hudSpeed}>
                <span style={{ color: '#ff6b6b', fontWeight: 900, fontSize: 18, fontFamily: 'var(--font-mono)' }}>{speedInfo[0]}</span>
                <span style={{ fontSize: 9, color: '#666' }}>km/h</span>
              </div>
              <div style={{ ...s.hudGear, color: '#ff6b6b' }}>G{gearInfo[0]}</div>
            </div>

            {/* Center */}
            <div style={s.hudCenter}>
              <span style={{ fontSize: 16 }}>🏎️</span>
              <span>RACE</span>
            </div>

            {/* P2 side */}
            <div style={s.hudSide}>
              <div style={{ ...s.hudGear, color: '#40c4ff' }}>G{gearInfo[1]}</div>
              <div style={s.hudSpeed}>
                <span style={{ color: '#40c4ff', fontWeight: 900, fontSize: 18, fontFamily: 'var(--font-mono)' }}>{speedInfo[1]}</span>
                <span style={{ fontSize: 9, color: '#666' }}>km/h</span>
              </div>
              <span style={s.hudLap}>Lap {Math.min(lapInfo[1] + 1, CarRace.LAPS_TO_WIN)}/{CarRace.LAPS_TO_WIN}</span>
              <span style={{ color: '#40c4ff', fontWeight: 800, fontSize: 14, letterSpacing: 1 }}>P2</span>
              <div style={{ ...s.hudPlayerDot, background: '#00b0ff', boxShadow: '0 0 8px #00b0ff' }} />
            </div>
          </div>

          {/* Minimap */}
          <MiniMap positions={carPositions} trackConfig={tc} />

          {/* Nitro bars */}
          <div style={s.nitroHUD}>
            <NitroBar label="P1" value={nitroInfo[0]} color="#e63946" />
            <NitroBar label="P2" value={nitroInfo[1]} color="#00b0ff" />
          </div>

          {/* Keyboard hint Mode 1 */}
          {status === 'playing' && mode === 1 && countdown === null && (
            <div style={s.carKeyHint}>
              <div style={s.keyHintGroup}>
                <span style={{ ...s.keyHintLabel, background: 'rgba(230, 57, 70, 0.15)', color: '#ff6b6b' }}>P1</span>
                <span>W/S gas/brake · A/D steer · Q nitro · E drift</span>
              </div>
              <div style={s.keyHintDivider} />
              <div style={s.keyHintGroup}>
                <span style={{ ...s.keyHintLabel, background: 'rgba(0, 176, 255, 0.15)', color: '#40c4ff' }}>P2</span>
                <span>↑/↓ gas/brake · ←/→ steer · , nitro · . drift</span>
              </div>
            </div>
          )}
          {status === 'won' && <WinOverlay winner={winner} playerNum={playerNum} onHome={() => navigate('/')} game={game} />}
        </div>
      )}

      {/* Disconnected */}
      {status === 'disconnected' && (
        <div style={{ ...s.centered, animation: 'fadeInUp 0.4s ease-out' }}>
          <p style={{ fontSize: 56, marginBottom: 16 }}>😢</p>
          <h2 style={{ marginBottom: 8, fontWeight: 800 }}>Player disconnected</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 15 }}>The other player left the game</p>
          <button
            style={s.btn}
            onClick={() => navigate('/')}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Go Home
          </button>
        </div>
      )}
    </div>
  );
}

// ── Components ────────────────────────────────────────────────────────────────

function MiniMap({ positions, trackConfig }) {
  const tc = trackConfig;
  const size = 120;
  const scale = size / ((tc.outer + 5) * 2);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div style={s.minimapWrap}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track ring */}
        <circle cx={cx} cy={cy} r={tc.outer * scale} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={tc.inner * scale} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={((tc.outer + tc.inner) / 2) * scale} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={((tc.outer - tc.inner) * scale)} strokeDasharray="3 3" />

        {/* Car dots */}
        <circle cx={cx + positions[0].x * scale} cy={cy + positions[0].z * scale} r="4" fill="#e63946" style={{ filter: 'drop-shadow(0 0 3px #e63946)' }} />
        <circle cx={cx + positions[1].x * scale} cy={cy + positions[1].z * scale} r="4" fill="#00b0ff" style={{ filter: 'drop-shadow(0 0 3px #00b0ff)' }} />
      </svg>
    </div>
  );
}

function NitroBar({ label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 10, fontWeight: 800, color, letterSpacing: 1 }}>{label}</span>
      <div style={{ width: 60, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          width: `${value}%`,
          height: '100%',
          background: value > 30 ? '#00ff88' : '#ff4444',
          borderRadius: 3,
          transition: 'width 0.15s ease',
        }} />
      </div>
      <span style={{ fontSize: 8, color: '#666', fontWeight: 700 }}>N₂O</span>
    </div>
  );
}

function PongHint({ playerNum }) {
  return (
    <div style={s.pongHintBar}>
      <span style={s.pongHintP1}>{playerNum === 1 ? '⬆ W / ⬇ S (You)' : '⬆ W / ⬇ S'}</span>
      <span style={s.pongHintVs}>vs</span>
      <span style={s.pongHintP2}>{playerNum === 2 ? '⬆ W / ⬇ S (You)' : '⬆ W / ⬇ S'}</span>
    </div>
  );
}

function WinOverlay({ winner, playerNum, onHome, game }) {
  const iWon = winner === playerNum;
  return (
    <div style={s.overlay}>
      <div style={{ ...s.overlayBox, animation: 'scaleIn 0.4s ease-out' }}>
        <p style={{ fontSize: 72, marginBottom: 8 }}>{iWon ? '🏆' : '😔'}</p>
        <h2 style={s.overlayTitle}>
          {iWon ? 'You Win!' : `Player ${winner} Wins!`}
        </h2>
        <p style={s.overlayDesc}>
          {iWon
            ? (game === 'car-race' ? 'Incredible driving!' : 'Amazing reflexes!')
            : 'Better luck next time!'}
        </p>
        <button
          style={s.btn}
          onClick={onHome}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
        >
          Play Again
        </button>
      </div>
    </div>
  );
}

function getDefaultInputs(G) {
  if (G.INPUT_SCHEMA === 'car') {
    return {
      p1: { accelerate: false, brake: false, left: false, right: false, steerX: 0, nitro: false, drift: false },
      p2: { accelerate: false, brake: false, left: false, right: false, steerX: 0, nitro: false, drift: false },
    };
  }
  return { p1: { up: false, down: false }, p2: { up: false, down: false } };
}

function buildKeyMap(game, playerNum) {
  if (game === 'car-race') {
    return {
      w: ['p1', 'accelerate'], s: ['p1', 'brake'], a: ['p1', 'left'], d: ['p1', 'right'],
      W: ['p1', 'accelerate'], S: ['p1', 'brake'], A: ['p1', 'left'], D: ['p1', 'right'],
      q: ['p1', 'nitro'], Q: ['p1', 'nitro'], e: ['p1', 'drift'], E: ['p1', 'drift'],
      ArrowUp: ['p2', 'accelerate'], ArrowDown: ['p2', 'brake'],
      ArrowLeft: ['p2', 'left'], ArrowRight: ['p2', 'right'],
      ',': ['p2', 'nitro'], '.': ['p2', 'drift'],
    };
  }
  const myP = `p${playerNum}`;
  return {
    ArrowUp: [myP, 'up'], ArrowDown: [myP, 'down'],
    w: [myP, 'up'], s: [myP, 'down'],
  };
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-primary)',
    overflow: 'hidden',
  },
  centered: { textAlign: 'center' },

  // Connecting state
  connectingSpinner: {
    width: 44, height: 44,
    border: '3px solid rgba(255,255,255,0.06)',
    borderTop: '3px solid var(--purple-400)',
    borderRadius: '50%',
    margin: '0 auto 20px',
    animation: 'spin 0.8s linear infinite',
  },
  connectingText: { color: 'var(--text-secondary)', fontSize: 16, fontWeight: 500 },

  // QR Screen
  qrScreen: {
    textAlign: 'center', padding: 32, width: '100%', maxWidth: 920,
    animation: 'fadeInUp 0.5s ease-out',
  },
  qrHeader: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 8 },
  qrGameIcon: { fontSize: 36 },
  qrTitle: { fontSize: 34, fontWeight: 900, letterSpacing: '-0.5px' },
  qrSub: { color: 'var(--text-secondary)', marginBottom: 24, fontSize: 15, fontWeight: 500 },
  progressBar: {
    width: 200, height: 4, background: 'rgba(255,255,255,0.06)',
    borderRadius: 4, margin: '0 auto 8px', overflow: 'hidden',
  },
  progressFill: {
    height: '100%', background: 'var(--gradient-main)',
    borderRadius: 4, transition: 'width 0.5s ease',
  },
  progressText: { color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, marginBottom: 32 },
  qrSplit: { display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 20 },
  qrPanel: {
    flex: '1 1 300px', maxWidth: 380, padding: '32px 36px',
    background: 'var(--bg-card)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-card)', transition: 'border-color 0.3s ease',
  },
  playerTag: {
    display: 'inline-block', padding: '6px 18px', borderRadius: 20,
    fontSize: 14, fontWeight: 800, marginBottom: 24, letterSpacing: '0.5px',
  },
  qrBox: {
    padding: 20, background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 'var(--radius-md)', display: 'inline-block',
  },
  qrUrl: {
    fontSize: 11, color: 'var(--text-muted)', marginTop: 16,
    wordBreak: 'break-all', fontFamily: 'var(--font-mono)',
  },
  connectedBadge: {
    marginTop: 16, padding: '8px 18px',
    background: 'rgba(74, 222, 128, 0.1)', color: '#86efac',
    borderRadius: 24, fontSize: 13, fontWeight: 700,
    display: 'inline-flex', alignItems: 'center', gap: 6,
    border: '1px solid rgba(74, 222, 128, 0.2)',
  },

  // Pong canvas
  canvasWrapper: {
    position: 'relative', display: 'flex', flexDirection: 'column',
    alignItems: 'center', animation: 'fadeIn 0.5s ease-out',
  },
  canvas: {
    borderRadius: 'var(--radius-md)',
    boxShadow: '0 0 80px rgba(124, 58, 237, 0.12), 0 0 0 1px rgba(255,255,255,0.04)',
    maxWidth: '100vw',
  },
  pongHintBar: {
    display: 'flex', gap: 20, marginTop: 16, fontSize: 13, fontWeight: 600,
    padding: '10px 24px', background: 'var(--bg-card)',
    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)',
  },
  pongHintP1: { color: '#ff6b6b' },
  pongHintVs: { color: 'var(--text-muted)' },
  pongHintP2: { color: '#40c4ff' },

  // WebGL wrapper
  webglWrapper: { position: 'relative', width: '100vw', height: '100vh' },
  webglContainer: { width: '100%', height: '100%' },

  // Countdown
  countdownOverlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 30, pointerEvents: 'none',
  },
  countdownNum: {
    fontSize: 120, fontWeight: 900, color: '#fff',
    fontFamily: 'var(--font-mono)',
    textShadow: '0 0 60px rgba(255,255,255,0.3)',
    animation: 'countdownPulse 1s ease-out',
  },

  // HUD
  carHUD: {
    position: 'absolute', top: 0, left: 0, right: 0,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 20px',
    background: 'rgba(8, 8, 15, 0.8)',
    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border-subtle)',
    fontSize: 15, fontWeight: 700, zIndex: 10,
  },
  hudSide: { display: 'flex', gap: 10, alignItems: 'center' },
  hudPlayerDot: { width: 8, height: 8, borderRadius: '50%' },
  hudLap: { color: '#e5e7eb', fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-mono)' },
  hudSpeed: { display: 'flex', alignItems: 'baseline', gap: 2 },
  hudGear: { fontSize: 14, fontWeight: 900, fontFamily: 'var(--font-mono)', padding: '2px 6px', background: 'rgba(0,0,0,0.4)', borderRadius: 6 },
  hudCenter: {
    color: 'var(--text-secondary)', fontSize: 14, fontWeight: 800,
    letterSpacing: 4, textTransform: 'uppercase',
    display: 'flex', alignItems: 'center', gap: 8,
  },

  // Minimap
  minimapWrap: {
    position: 'absolute', bottom: 20, right: 20,
    background: 'rgba(8, 8, 15, 0.75)',
    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    borderRadius: 16, padding: 8,
    border: '1px solid var(--border-subtle)',
    zIndex: 10,
  },

  // Nitro HUD
  nitroHUD: {
    position: 'absolute', bottom: 20, left: 20,
    display: 'flex', flexDirection: 'column', gap: 6,
    background: 'rgba(8, 8, 15, 0.75)',
    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    borderRadius: 12, padding: '8px 12px',
    border: '1px solid var(--border-subtle)',
    zIndex: 10,
  },

  carKeyHint: {
    position: 'absolute', bottom: 70, left: '50%', transform: 'translateX(-50%)',
    display: 'flex', gap: 12, alignItems: 'center',
    padding: '10px 24px',
    background: 'rgba(8, 8, 15, 0.75)',
    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-subtle)',
    fontSize: 12, color: 'var(--text-muted)', zIndex: 10,
  },
  keyHintGroup: { display: 'flex', alignItems: 'center', gap: 8 },
  keyHintLabel: {
    padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800,
  },
  keyHintDivider: { width: 1, height: 18, background: 'rgba(255,255,255,0.1)' },

  // Win overlay
  overlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(8, 8, 15, 0.9)',
    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 20,
  },
  overlayBox: {
    textAlign: 'center', padding: '52px 64px',
    background: 'var(--bg-card)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)',
  },
  overlayTitle: {
    fontSize: 40, fontWeight: 900, marginBottom: 8, letterSpacing: '-1px',
    background: 'linear-gradient(135deg, #ff6b6b, #40c4ff)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  overlayDesc: { color: 'var(--text-secondary)', marginBottom: 28, fontSize: 16, fontWeight: 500 },

  btn: {
    padding: '14px 36px', fontSize: 16, fontWeight: 700,
    fontFamily: 'var(--font-sans)', background: 'var(--gradient-main)',
    color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
    cursor: 'pointer', boxShadow: 'var(--shadow-btn)',
    transition: 'all 0.25s ease',
  },
};
