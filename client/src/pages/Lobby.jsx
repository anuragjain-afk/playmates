import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import socket from '../socket';

export default function Lobby() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { game, mode, selectedCar, selectedTrack } = state || {};

  const [roomId, setRoomId] = useState('');
  const [joinInput, setJoinInput] = useState('');
  const [view, setView] = useState('choice'); // 'choice' | 'hosting' | 'joining'
  const [error, setError] = useState('');
  const roomIdRef = useRef('');

  // ── Redirect if no state ────────────────────────────────────────────────────
  useEffect(() => {
    if (!game || !mode) navigate('/');
  }, []);

  // ── Socket listeners ──────────────────────────────────────────────────────────
  useEffect(() => {
    socket.on('room-created', ({ roomId: id, playerNum }) => {
      roomIdRef.current = id;
      setRoomId(id);
      if (mode === 2) {
        navigate(`/game/${id}`, { state: { isHost: true, mode, game, playerNum, selectedCar, selectedTrack } });
      } else {
        setView('hosting');
      }
    });

    socket.on('game-start', () => {
      navigate(`/game/${roomIdRef.current}`, {
        state: { isHost: true, mode, game, playerNum: 1, autoStart: true, selectedCar, selectedTrack },
      });
    });

    socket.on('room-joined', ({ roomId: id, playerNum }) => {
      navigate(`/game/${id}`, {
        state: { isHost: false, mode, game, playerNum, autoStart: true, selectedCar, selectedTrack },
      });
    });

    socket.on('join-error', ({ message }) => {
      setError(message);
      setView('joining');
    });

    return () => {
      socket.off('room-created');
      socket.off('game-start');
      socket.off('room-joined');
      socket.off('join-error');
    };
  }, [mode, game]);

  const handleCreate = () => {
    socket.emit('create-room', { gameType: game, mode });
  };

  const handleJoin = () => {
    setError('');
    if (!joinInput.trim()) return;
    socket.emit('join-room', { roomId: joinInput.trim().toUpperCase() });
  };

  const gameName = game?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const gameEmoji = game === 'pong' ? '🏓' : game === 'car-race' ? '🏎️' : '🎮';

  return (
    <div style={s.page}>
      {/* Background orbs */}
      <div style={s.orb1} />
      <div style={s.orb2} />

      <button
        style={s.back}
        onClick={() => navigate('/')}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
      >
        ← Back
      </button>

      <div style={s.box}>
        {/* Game badge */}
        <div style={s.gameBadge}>
          <span style={{ fontSize: 22 }}>{gameEmoji}</span>
          <span style={s.gameBadgeText}>{gameName}</span>
        </div>

        <p style={s.sub}>
          {mode === 1 ? '🌐 Two Devices Mode' : '📱 Split Screen + Phone Controllers'}
        </p>

        <div style={s.divider} />

        {/* ── Choice screen ─────────────────────────────────── */}
        {view === 'choice' && (
          <div style={{ ...s.choices, animation: 'fadeInUp 0.35s ease-out' }}>
            <button
              style={s.primaryBtn}
              onClick={handleCreate}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 36px rgba(124, 58, 237, 0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-btn)'; }}
            >
              <span style={s.btnIcon}>🏠</span>
              Create Room
            </button>
            {mode === 1 && (
              <button
                style={s.secondaryBtn}
                onClick={() => setView('joining')}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.4)'; e.currentTarget.style.background = 'rgba(167, 139, 250, 0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={s.btnIcon}>🔗</span>
                Join Room
              </button>
            )}
          </div>
        )}

        {/* ── Hosting — waiting for guest ───────────────────── */}
        {view === 'hosting' && (
          <div style={{ textAlign: 'center', animation: 'fadeInUp 0.35s ease-out' }}>
            <p style={s.label}>Share this Room ID with your friend</p>
            <div style={s.roomIdContainer}>
              <div style={s.roomId}>{roomId}</div>
            </div>
            <div style={s.waitingPill}>
              <Spinner />
              <span>Waiting for player 2 to join...</span>
            </div>
          </div>
        )}

        {/* ── Joining ───────────────────────────────────────── */}
        {view === 'joining' && (
          <div style={{ animation: 'fadeInUp 0.35s ease-out' }}>
            <p style={s.label}>Enter Room ID</p>
            <input
              style={s.input}
              maxLength={5}
              placeholder="XXXXX"
              value={joinInput}
              onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--purple-400)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(167, 139, 250, 0.15)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
              autoFocus
            />
            {error && <p style={s.error}>⚠ {error}</p>}
            <div style={s.choices}>
              <button
                style={s.primaryBtn}
                onClick={handleJoin}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Join →
              </button>
              <button
                style={s.secondaryBtn}
                onClick={() => { setError(''); setView('choice'); }}
              >
                ← Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 18, height: 18,
      border: '2px solid rgba(255,255,255,0.1)',
      borderTop: '2px solid var(--purple-400)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      flexShrink: 0,
    }} />
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  orb1: {
    position: 'fixed',
    top: '-15%',
    right: '-10%',
    width: 500,
    height: 500,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
    animation: 'orbFloat1 20s ease-in-out infinite',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'fixed',
    bottom: '-20%',
    left: '-10%',
    width: 600,
    height: 600,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(244, 114, 182, 0.06) 0%, transparent 70%)',
    animation: 'orbFloat2 25s ease-in-out infinite',
    pointerEvents: 'none',
  },
  back: {
    position: 'fixed',
    top: 20,
    left: 20,
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'var(--font-sans)',
    padding: '8px 16px',
    borderRadius: 'var(--radius-sm)',
    transition: 'all 0.2s ease',
    zIndex: 10,
  },
  box: {
    background: 'var(--bg-card)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-xl)',
    padding: '44px 48px',
    maxWidth: 500,
    width: '100%',
    boxShadow: 'var(--shadow-card)',
    animation: 'scaleIn 0.4s ease-out',
    position: 'relative',
    zIndex: 1,
  },
  gameBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  gameBadgeText: {
    fontSize: 30,
    fontWeight: 900,
    color: 'var(--text-primary)',
    letterSpacing: '-0.5px',
  },
  sub: {
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 0,
  },
  divider: {
    height: 1,
    background: 'var(--border-subtle)',
    margin: '28px 0',
  },
  choices: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginTop: 8,
  },
  primaryBtn: {
    padding: '15px 20px',
    fontSize: 16,
    fontWeight: 700,
    fontFamily: 'var(--font-sans)',
    background: 'var(--gradient-main)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-btn)',
    transition: 'all 0.25s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    letterSpacing: '0.3px',
  },
  secondaryBtn: {
    padding: '15px 20px',
    fontSize: 16,
    fontWeight: 600,
    fontFamily: 'var(--font-sans)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1.5px solid rgba(255,255,255,0.08)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  btnIcon: {
    fontSize: 18,
  },
  label: {
    color: 'var(--text-secondary)',
    marginBottom: 16,
    fontSize: 14,
    fontWeight: 500,
  },
  roomIdContainer: {
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 'var(--radius-md)',
    padding: '20px 24px',
    border: '1px solid var(--border-glow)',
    display: 'inline-block',
  },
  roomId: {
    fontSize: 52,
    fontWeight: 900,
    letterSpacing: 8,
    color: 'var(--purple-400)',
    fontFamily: 'var(--font-mono)',
    textShadow: '0 0 20px rgba(167, 139, 250, 0.3)',
  },
  waitingPill: {
    marginTop: 24,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 20px',
    background: 'rgba(167, 139, 250, 0.08)',
    borderRadius: 40,
    color: 'var(--text-secondary)',
    fontSize: 14,
    fontWeight: 500,
    border: '1px solid rgba(167, 139, 250, 0.12)',
  },
  input: {
    width: '100%',
    padding: '16px 18px',
    fontSize: 32,
    fontWeight: 800,
    fontFamily: 'var(--font-mono)',
    letterSpacing: 10,
    textAlign: 'center',
    background: 'rgba(0, 0, 0, 0.3)',
    border: '2px solid rgba(255,255,255,0.08)',
    borderRadius: 'var(--radius-md)',
    color: '#fff',
    outline: 'none',
    textTransform: 'uppercase',
    transition: 'all 0.2s ease',
  },
  error: {
    color: '#fca5a5',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    fontWeight: 500,
    padding: '8px 16px',
    background: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
  },
};
