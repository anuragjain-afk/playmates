import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../socket';

export default function Controller() {
  const { roomId, playerNum } = useParams();
  const pNum = parseInt(playerNum, 10);
  const [status, setStatus] = useState('connecting');
  const [gameType, setGameType] = useState(null);
  const inputRef = useRef({});
  const joystickRef = useRef(null);
  const joystickKnobRef = useRef(null);
  const [steerX, setSteerX] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [gear, setGear] = useState(1);
  const [nitro, setNitro] = useState(100);
  const [pressedKeys, setPressedKeys] = useState({});

  const color = pNum === 1 ? '#e63946' : '#00b0ff';
  const colorDim = pNum === 1 ? 'rgba(230, 57, 70, 0.7)' : 'rgba(0, 176, 255, 0.7)';

  // ── Join as controller ────────────────────────────────────────────────────────
  useEffect(() => {
    let joined = false;
    const doJoin = () => {
      if (joined) return;
      joined = true;
      socket.emit('join-controller', { roomId, playerNum: pNum });
    };

    socket.on('connect', doJoin);
    socket.on('controller-joined', ({ gameType: gt }) => {
      setGameType(gt || 'pong');
      setStatus('ready');
      inputRef.current = gt === 'car-race'
        ? { accelerate: false, brake: false, left: false, right: false, steerX: 0, nitro: false, drift: false }
        : { up: false, down: false };
    });
    socket.on('game-start', () => setStatus('playing'));
    socket.on('player-disconnected', () => setStatus('disconnected'));
    socket.on('game-state', (state) => {
      if (state.cars && state.cars[pNum - 1]) {
        const car = state.cars[pNum - 1];
        setSpeed(Math.round(car.speed * 260));
        setGear(car.gear || 1);
        setNitro(Math.round(car.nitro || 0));
      }
    });

    if (socket.connected) doJoin();

    return () => {
      socket.off('connect'); socket.off('controller-joined');
      socket.off('game-start'); socket.off('player-disconnected');
      socket.off('game-state');
    };
  }, [roomId, pNum]);

  // ── Send input at 60fps ───────────────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'playing') return;
    const iv = setInterval(() => {
      socket.emit('player-input', { roomId, playerNum: pNum, input: { ...inputRef.current } });
    }, 16);
    return () => clearInterval(iv);
  }, [status, roomId, pNum]);

  // ── Prevent scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    const prevent = (e) => e.preventDefault();
    document.addEventListener('touchmove', prevent, { passive: false });
    document.addEventListener('contextmenu', prevent);
    // Lock to landscape hint
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').catch(() => { });
    }
    return () => {
      document.removeEventListener('touchmove', prevent);
      document.removeEventListener('contextmenu', prevent);
    };
  }, []);

  const press = useCallback((key) => {
    inputRef.current[key] = true;
    setPressedKeys(prev => ({ ...prev, [key]: true }));
    if (navigator.vibrate) navigator.vibrate(15);
  }, []);

  const release = useCallback((key) => {
    inputRef.current[key] = false;
    setPressedKeys(prev => ({ ...prev, [key]: false }));
  }, []);

  const btnEvents = useCallback((key) => ({
    onTouchStart: (e) => { e.preventDefault(); press(key); },
    onTouchEnd: (e) => { e.preventDefault(); release(key); },
    onTouchCancel: (e) => { e.preventDefault(); release(key); },
    onMouseDown: () => press(key),
    onMouseUp: () => release(key),
    onMouseLeave: () => release(key),
  }), [press, release]);

  // ── Joystick handler ─────────────────────────────────────────────────────────
  const joystickTouch = useRef(null);
  const handleJoystickStart = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    joystickTouch.current = touch.identifier;
    handleJoystickMove(e);
  }, []);

  const handleJoystickMove = useCallback((e) => {
    e.preventDefault();
    const zone = joystickRef.current;
    if (!zone) return;
    const rect = zone.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxR = rect.width / 2 - 20;

    let touch = null;
    for (let i = 0; i < e.touches.length; i++) {
      if (joystickTouch.current === null || e.touches[i].identifier === joystickTouch.current) {
        touch = e.touches[i];
        break;
      }
    }
    if (!touch) return;

    let dx = touch.clientX - cx;
    let dy = touch.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }

    const normalizedX = -(dx / maxR); // negative because left = positive angle
    inputRef.current.steerX = normalizedX;
    inputRef.current.left = normalizedX > 0.15;
    inputRef.current.right = normalizedX < -0.15;
    setSteerX(normalizedX);

    if (joystickKnobRef.current) {
      joystickKnobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    }
  }, []);

  const handleJoystickEnd = useCallback((e) => {
    e.preventDefault();
    joystickTouch.current = null;
    inputRef.current.steerX = 0;
    inputRef.current.left = false;
    inputRef.current.right = false;
    setSteerX(0);
    if (joystickKnobRef.current) {
      joystickKnobRef.current.style.transform = 'translate(0px, 0px)';
    }
  }, []);

  // ── Status screens ────────────────────────────────────────────────────────────
  if (status === 'connecting') return <StatusScreen color={color} icon="📡" text="Connecting..." spinner />;
  if (status === 'ready') return <StatusScreen color={color} icon="✅" text="Waiting for game to start..." pNum={pNum} spinner />;
  if (status === 'disconnected') return <StatusScreen color={color} icon="😢" text="Game ended" />;

  // ── Car emulator gamepad ───────────────────────────────────────────────────────
  if (gameType === 'car-race') {
    const isGas = pressedKeys.accelerate;
    const isBrake = pressedKeys.brake;
    const isNitro = pressedKeys.nitro;
    const isDrift = pressedKeys.drift;

    return (
      <div style={s.emuPage}>
        {/* Controller body outline */}
        <div style={s.emuBody}>
          {/* Top shoulder buttons */}
          <div style={s.shoulderRow}>
            <button
              style={{
                ...s.shoulderBtn,
                background: isNitro ? '#ff4400' : 'rgba(40, 40, 60, 0.95)',
                boxShadow: isNitro ? '0 0 20px rgba(255,68,0,0.6), inset 0 -3px 0 rgba(0,0,0,0.3)' : 'inset 0 -3px 0 rgba(0,0,0,0.3)',
              }}
              {...btnEvents('nitro')}
            >
              <span style={{ fontSize: 16, fontWeight: 900 }}>L1</span>
              <span style={{ fontSize: 10, opacity: 0.7 }}>NITRO</span>
            </button>

            {/* Center info display */}
            <div style={s.centerDisplay}>
              <div style={s.playerBadge}>
                <div style={{ ...s.playerDot, background: color, boxShadow: `0 0 8px ${color}` }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>P{pNum}</span>
              </div>
              {/* Speedometer */}
              <div style={s.speedoWrap}>
                <span style={{ ...s.speedNum, color }}>{speed}</span>
                <span style={s.speedUnit}>KM/H</span>
              </div>
              {/* Gear */}
              <div style={s.gearDisplay}>
                <span style={{ fontSize: 9, color: '#666', fontWeight: 700 }}>GEAR</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{gear}</span>
              </div>
              {/* Nitro bar */}
              <div style={s.nitroBarOuter}>
                <div style={{ ...s.nitroBarInner, width: `${nitro}%`, background: nitro > 30 ? '#00ff88' : '#ff4444' }} />
              </div>
              <span style={{ fontSize: 8, color: '#666', fontWeight: 700, letterSpacing: 1 }}>N₂O</span>
            </div>

            <button
              style={{
                ...s.shoulderBtn,
                background: isDrift ? '#8844ff' : 'rgba(40, 40, 60, 0.95)',
                boxShadow: isDrift ? '0 0 20px rgba(136,68,255,0.6), inset 0 -3px 0 rgba(0,0,0,0.3)' : 'inset 0 -3px 0 rgba(0,0,0,0.3)',
              }}
              {...btnEvents('drift')}
            >
              <span style={{ fontSize: 16, fontWeight: 900 }}>R1</span>
              <span style={{ fontSize: 10, opacity: 0.7 }}>DRIFT</span>
            </button>
          </div>

          {/* Main area: Joystick + Buttons */}
          <div style={s.mainRow}>
            {/* Left: Joystick */}
            <div style={s.joystickArea}>
              <div
                ref={joystickRef}
                style={s.joystickZone}
                onTouchStart={handleJoystickStart}
                onTouchMove={handleJoystickMove}
                onTouchEnd={handleJoystickEnd}
                onTouchCancel={handleJoystickEnd}
              >
                {/* Crosshair lines */}
                <div style={s.joystickCrossH} />
                <div style={s.joystickCrossV} />
                {/* Direction labels */}
                <span style={{ ...s.joystickLabel, top: 6, left: '50%', transform: 'translateX(-50%)' }}>▲</span>
                <span style={{ ...s.joystickLabel, bottom: 6, left: '50%', transform: 'translateX(-50%)' }}>▼</span>
                <span style={{ ...s.joystickLabel, left: 6, top: '50%', transform: 'translateY(-50%)' }}>◀</span>
                <span style={{ ...s.joystickLabel, right: 6, top: '50%', transform: 'translateY(-50%)' }}>▶</span>
                {/* Knob */}
                <div
                  ref={joystickKnobRef}
                  style={{
                    ...s.joystickKnob,
                    background: `radial-gradient(circle at 35% 35%, ${color}, ${colorDim})`,
                    boxShadow: `0 4px 12px rgba(0,0,0,0.5), 0 0 15px ${colorDim}`,
                  }}
                />
              </div>
              <span style={s.zoneLabel}>STEERING</span>
            </div>

            {/* Right: Action buttons */}
            <div style={s.btnArea}>
              <div style={s.btnCluster}>
                {/* Gas - large top button */}
                <button
                  style={{
                    ...s.actionBtn,
                    ...s.gasBtn,
                    background: isGas
                      ? 'radial-gradient(circle at 40% 40%, #66ff66, #22aa22)'
                      : 'radial-gradient(circle at 40% 40%, #2a8a2a, #1a5a1a)',
                    boxShadow: isGas
                      ? '0 0 25px rgba(34,170,34,0.7), inset 0 -3px 0 rgba(0,0,0,0.3)'
                      : 'inset 0 -4px 0 rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)',
                  }}
                  {...btnEvents('accelerate')}
                >
                  <span style={{ fontSize: 28, fontWeight: 900 }}>A</span>
                  <span style={{ fontSize: 9, fontWeight: 700, opacity: 0.8, letterSpacing: 1 }}>GAS</span>
                </button>

                {/* Brake - large bottom button */}
                <button
                  style={{
                    ...s.actionBtn,
                    ...s.brakeBtn,
                    background: isBrake
                      ? 'radial-gradient(circle at 40% 40%, #ff6666, #cc2222)'
                      : 'radial-gradient(circle at 40% 40%, #8a2a2a, #5a1a1a)',
                    boxShadow: isBrake
                      ? '0 0 25px rgba(204,34,34,0.7), inset 0 -3px 0 rgba(0,0,0,0.3)'
                      : 'inset 0 -4px 0 rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)',
                  }}
                  {...btnEvents('brake')}
                >
                  <span style={{ fontSize: 28, fontWeight: 900 }}>B</span>
                  <span style={{ fontSize: 9, fontWeight: 700, opacity: 0.8, letterSpacing: 1 }}>BRAKE</span>
                </button>
              </div>
              <span style={s.zoneLabel}>CONTROLS</span>
            </div>
          </div>

          {/* Bottom edge decoration */}
          <div style={s.emuBottomEdge}>
            <div style={{ ...s.emuDot, background: '#444' }} />
            <span style={{ fontSize: 9, color: '#333', fontWeight: 700, letterSpacing: 2 }}>PLAYMATES CONTROLLER</span>
            <div style={{ ...s.emuDot, background: '#444' }} />
          </div>
        </div>
      </div>
    );
  }

  // ── Pong gamepad ────────────────────────────────────────────────────────────────
  return (
    <div style={s.pongPage}>
      <div style={{ ...s.playerChip, background: color, boxShadow: `0 0 16px ${colorDim}` }}>P{pNum}</div>
      <button style={{ ...s.pongHalf, background: color, boxShadow: `inset 0 -6px 0 rgba(0,0,0,0.15)` }} {...btnEvents('up')}>
        <span style={s.pongArrow}>▲</span>
        <span style={s.pongLabel}>UP</span>
      </button>
      <div style={{ height: 4, background: 'rgba(0,0,0,0.5)' }} />
      <button style={{ ...s.pongHalf, background: colorDim, boxShadow: `inset 0 6px 0 rgba(0,0,0,0.15)` }} {...btnEvents('down')}>
        <span style={s.pongLabel}>DOWN</span>
        <span style={s.pongArrow}>▼</span>
      </button>
    </div>
  );
}

function StatusScreen({ color, icon, text, pNum, spinner }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#08080f',
    }}>
      <div style={{
        textAlign: 'center',
        padding: 40,
        background: 'rgba(18,18,30,0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 24,
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        maxWidth: 320,
        width: '90%',
        animation: 'scaleIn 0.4s ease-out',
      }}>
        <p style={{ fontSize: 56, marginBottom: 16 }}>{icon}</p>
        {pNum && <h2 style={{ color, marginBottom: 10, fontSize: 22, fontWeight: 800 }}>Player {pNum}</h2>}
        <p style={{ color: '#a1a1b5', fontSize: 15, fontWeight: 500 }}>{text}</p>
        {spinner && (
          <div style={{
            width: 28, height: 28,
            border: '2.5px solid rgba(255,255,255,0.06)',
            borderTop: `2.5px solid ${color}`,
            borderRadius: '50%',
            margin: '20px auto 0',
            animation: 'spin 0.8s linear infinite',
          }} />
        )}
      </div>
    </div>
  );
}

const s = {
  // Emulator page - dark matte background with subtle grid
  emuPage: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `
      linear-gradient(135deg, #0a0a14 0%, #0f0f1e 50%, #0a0a14 100%)
    `,
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(135deg, #0a0a14 0%, #0f0f1e 50%, #0a0a14 100%)
    `,
    backgroundSize: '20px 20px, 20px 20px, 100% 100%',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    overflow: 'hidden',
    padding: 8,
  },
  emuBody: {
    width: '100%',
    height: '100%',
    maxWidth: 700,
    maxHeight: 380,
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(180deg, rgba(25,25,40,0.95) 0%, rgba(15,15,25,0.98) 100%)',
    borderRadius: 24,
    border: '2px solid rgba(255,255,255,0.08)',
    boxShadow: '0 0 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
    padding: '6px 10px',
    position: 'relative',
  },

  // Shoulder buttons row
  shoulderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 4px',
    gap: 8,
    flexShrink: 0,
  },
  shoulderBtn: {
    flex: '0 0 auto',
    width: 72,
    height: 40,
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px 12px 6px 6px',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
    transition: 'all 0.1s ease',
    fontFamily: "'Inter', sans-serif",
  },

  // Center display
  centerDisplay: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: '4px 0',
  },
  playerBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '3px 10px',
    background: 'rgba(0,0,0,0.4)',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.06)',
  },
  playerDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
  },
  speedoWrap: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 3,
  },
  speedNum: {
    fontSize: 26,
    fontWeight: 900,
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: -1,
  },
  speedUnit: {
    fontSize: 8,
    color: '#666',
    fontWeight: 700,
    letterSpacing: 1,
  },
  gearDisplay: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2px 8px',
    background: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.06)',
  },
  nitroBarOuter: {
    width: 50,
    height: 6,
    background: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  nitroBarInner: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.15s ease, background 0.3s ease',
  },

  // Main row (joystick + buttons)
  mainRow: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 8px',
    gap: 12,
  },

  // Joystick
  joystickArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  joystickZone: {
    width: 140,
    height: 140,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(30,30,50,0.9) 0%, rgba(20,20,35,0.95) 100%)',
    border: '2px solid rgba(255,255,255,0.08)',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
    touchAction: 'none',
  },
  joystickCrossH: {
    position: 'absolute',
    width: '70%',
    height: 1,
    background: 'rgba(255,255,255,0.05)',
    top: '50%',
    left: '15%',
  },
  joystickCrossV: {
    position: 'absolute',
    height: '70%',
    width: 1,
    background: 'rgba(255,255,255,0.05)',
    left: '50%',
    top: '15%',
  },
  joystickLabel: {
    position: 'absolute',
    color: 'rgba(255,255,255,0.15)',
    fontSize: 10,
    fontWeight: 700,
    pointerEvents: 'none',
  },
  joystickKnob: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.2)',
    transition: 'transform 0.05s ease-out',
    pointerEvents: 'none',
  },

  // Action buttons
  btnArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  btnCluster: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.15)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
    transition: 'all 0.08s ease',
    fontFamily: "'Inter', sans-serif",
  },
  gasBtn: {},
  brakeBtn: {},

  zoneLabel: {
    fontSize: 9,
    color: '#444',
    fontWeight: 800,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // Bottom edge
  emuBottomEdge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: '4px 0',
    flexShrink: 0,
  },
  emuDot: {
    width: 4,
    height: 4,
    borderRadius: '50%',
  },

  // Pong layout (kept)
  playerChip: {
    position: 'fixed', top: 12, right: 12,
    padding: '5px 16px', borderRadius: 24,
    fontSize: 13, fontWeight: 800, color: '#fff', zIndex: 10,
    fontFamily: "'Inter', sans-serif",
    letterSpacing: '0.5px',
  },
  pongPage: {
    width: '100vw', height: '100vh',
    display: 'flex', flexDirection: 'column',
    background: '#08080f',
    userSelect: 'none', WebkitUserSelect: 'none', overflow: 'hidden',
  },
  pongHalf: {
    flex: 1, width: '100%', border: 'none',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: 12, WebkitTapHighlightColor: 'transparent', cursor: 'pointer',
    transition: 'opacity 0.1s ease',
  },
  pongArrow: { fontSize: 56, lineHeight: 1, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))' },
  pongLabel: { fontSize: 14, fontWeight: 800, letterSpacing: 3, color: 'rgba(255,255,255,0.8)', fontFamily: "'Inter', sans-serif" },
};
