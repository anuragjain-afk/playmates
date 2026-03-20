import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CAR_PRESETS, TRACK_PRESETS } from '../games/CarRace';

const GAMES = [
  {
    id: 'pong',
    name: 'Pong',
    emoji: '🏓',
    desc: 'Classic table tennis. First to 7 wins.',
    accent: '#a78bfa',
  },
  {
    id: 'car-race',
    name: 'Car Race',
    emoji: '🏎️',
    desc: '3D circuit race. First to 3 laps wins.',
    accent: '#f472b6',
  },
];

const CAR_LIST = Object.entries(CAR_PRESETS).map(([id, data]) => ({ id, ...data }));
const TRACK_LIST = Object.entries(TRACK_PRESETS).map(([id, data]) => ({ id, ...data }));

const carEmojis = { sports: '🏎️', muscle: '💪', f1: '🏁', truck: '🚛' };
const trackEmojis = { speedway: '🏟️', city: '🌃', desert: '🏜️', neon: '🌈' };

const statBar = (label, value, max, barColor) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
    <span style={{ width: 55, color: '#888', fontWeight: 600, fontSize: 11 }}>{label}</span>
    <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: `${(value / max) * 100}%`, height: '100%', background: barColor, borderRadius: 3, transition: 'width 0.4s ease' }} />
    </div>
  </div>
);

export default function Home() {
  const [game, setGame] = useState(null);
  const [mode, setMode] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const navigate = useNavigate();

  const showCarSelect = game === 'car-race';
  const ready = game && mode && (!showCarSelect || (selectedCar && selectedTrack));

  return (
    <div style={s.page}>
      {/* Floating background orbs */}
      <div style={s.orb1} />
      <div style={s.orb2} />
      <div style={s.orb3} />

      {/* Header */}
      <div style={s.header}>
        <div style={s.logoWrapper}>
          <span style={s.logoIcon}>🎮</span>
          <h1 style={s.logo}>Playmates</h1>
        </div>
        <p style={s.tagline}>Real-time multiplayer in your browser</p>
        <div style={s.taglineDivider} />
      </div>

      {/* Game selection */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>
          <span style={s.sectionDot} />
          Choose a Game
        </h2>
        <div style={s.grid}>
          {GAMES.map((g) => (
            <div
              key={g.id}
              style={{
                ...s.card,
                ...(game === g.id ? { ...s.cardSelected, borderColor: g.accent, boxShadow: `0 0 40px ${g.accent}22, 0 8px 32px rgba(0,0,0,0.4)` } : {}),
              }}
              onClick={() => { setGame(g.id); if (g.id !== 'car-race') { setSelectedCar(null); setSelectedTrack(null); } }}
              onMouseEnter={(e) => {
                if (game !== g.id) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                if (game !== g.id) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ ...s.cardEmojiBox, background: `${g.accent}15` }}>
                <span style={s.cardEmoji}>{g.emoji}</span>
              </div>
              <h3 style={s.cardName}>{g.name}</h3>
              <p style={s.cardDesc}>{g.desc}</p>
              {game === g.id && (
                <div style={{ ...s.selectedIndicator, background: g.accent }}>
                  ✓ Selected
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Car selection (only for car-race) */}
      {showCarSelect && (
        <section style={{ ...s.section, animation: 'fadeInUp 0.4s ease-out' }}>
          <h2 style={s.sectionTitle}>
            <span style={{ ...s.sectionDot, background: '#e63946' }} />
            Choose Your Car
          </h2>
          <div style={s.carGrid}>
            {CAR_LIST.map((car) => {
              const isSelected = selectedCar === car.id;
              const hexColor = `#${car.color.toString(16).padStart(6, '0')}`;
              return (
                <div
                  key={car.id}
                  style={{
                    ...s.carCard,
                    ...(isSelected ? { border: `2px solid ${hexColor}`, boxShadow: `0 0 30px ${hexColor}33, 0 8px 24px rgba(0,0,0,0.4)` } : {}),
                  }}
                  onClick={() => setSelectedCar(car.id)}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 28 }}>{carEmojis[car.id]}</span>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#f1f1f7', marginBottom: 2 }}>{car.name}</h3>
                      <p style={{ fontSize: 11, color: '#a1a1b5' }}>{car.desc}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {statBar('Speed', car.maxSpeed, 1.1, hexColor)}
                    {statBar('Accel', car.accel, 0.035, hexColor)}
                    {statBar('Grip', car.handling, 0.05, hexColor)}
                  </div>
                  {isSelected && (
                    <div style={{ ...s.selectedIndicator, background: hexColor, marginTop: 10 }}>
                      ✓ Selected
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Track selection (only for car-race) */}
      {showCarSelect && selectedCar && (
        <section style={{ ...s.section, animation: 'fadeInUp 0.4s ease-out' }}>
          <h2 style={s.sectionTitle}>
            <span style={{ ...s.sectionDot, background: '#00b0ff' }} />
            Choose a Track
          </h2>
          <div style={s.carGrid}>
            {TRACK_LIST.map((track) => {
              const isSelected = selectedTrack === track.id;
              const bgHex = `#${(track.skyTop || track.skyColor || 0x111111).toString(16).padStart(6, '0')}`;
              const accentHex = `#${track.barrierColors[0].toString(16).padStart(6, '0')}`;
              return (
                <div
                  key={track.id}
                  style={{
                    ...s.trackCard,
                    ...(isSelected ? { border: `2px solid ${accentHex}`, boxShadow: `0 0 30px ${accentHex}33, 0 8px 24px rgba(0,0,0,0.4)` } : {}),
                  }}
                  onClick={() => setSelectedTrack(track.id)}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{
                    height: 60,
                    borderRadius: '12px 12px 0 0',
                    background: `linear-gradient(135deg, ${bgHex}, ${accentHex}30)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32,
                    margin: '-16px -16px 12px -16px',
                    borderBottom: `2px solid ${accentHex}30`,
                  }}>
                    {trackEmojis[track.id]}
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#f1f1f7', marginBottom: 4 }}>{track.name}</h3>
                  <p style={{ fontSize: 12, color: '#a1a1b5', lineHeight: 1.4 }}>{track.desc}</p>
                  <div style={{
                    marginTop: 8,
                    padding: '3px 10px',
                    borderRadius: 8,
                    background: `${accentHex}15`,
                    color: accentHex,
                    fontSize: 10,
                    fontWeight: 700,
                    display: 'inline-block',
                    letterSpacing: 0.5,
                  }}>
                    {track.env === 'neon' ? '🌙 NIGHT' : track.env === 'night' ? '🌙 EVENING' : '☀️ DAY'}
                  </div>
                  {isSelected && (
                    <div style={{ ...s.selectedIndicator, background: accentHex, marginTop: 10 }}>
                      ✓ Selected
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Mode selection */}
      {game && (!showCarSelect || (selectedCar && selectedTrack)) && (
        <section style={{ ...s.section, animation: 'fadeInUp 0.4s ease-out' }}>
          <h2 style={s.sectionTitle}>
            <span style={{ ...s.sectionDot, background: 'var(--pink-400)' }} />
            Choose Mode
          </h2>
          <div style={s.grid}>
            <div
              style={{
                ...s.modeCard,
                ...(mode === 1 ? s.cardSelected : {}),
              }}
              onClick={() => setMode(1)}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={s.modeIconRow}>
                <span style={s.deviceIcon}>💻</span>
                <span style={s.deviceConnector}>⚡</span>
                <span style={s.deviceIcon}>💻</span>
              </div>
              <h3 style={s.cardName}>Two Devices</h3>
              <p style={s.cardDesc}>
                Each player opens the game on their own laptop. Share a Room ID to connect.
              </p>
              <div style={{ ...s.badge, background: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                Online Multiplayer
              </div>
            </div>
            <div
              style={{
                ...s.modeCard,
                ...(mode === 2 ? s.cardSelected : {}),
              }}
              onClick={() => setMode(2)}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={s.modeIconRow}>
                <span style={s.deviceIcon}>📱</span>
                <span style={s.deviceConnector}>⚡</span>
                <span style={s.deviceIcon}>🖥️</span>
                <span style={s.deviceConnector}>⚡</span>
                <span style={s.deviceIcon}>📱</span>
              </div>
              <h3 style={s.cardName}>Split Screen</h3>
              <p style={s.cardDesc}>
                One laptop screen, two phones as controllers. Scan a QR code to join.
              </p>
              <div style={{ ...s.badge, background: 'rgba(219, 39, 119, 0.2)', color: '#f9a8d4', border: '1px solid rgba(219, 39, 119, 0.3)' }}>
                Phone Controllers
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Play button */}
      {ready && (
        <div style={{ ...s.playArea, animation: 'fadeInUp 0.35s ease-out' }}>
          <button
            style={s.playBtn}
            onClick={() => navigate('/lobby', { state: { game, mode, selectedCar, selectedTrack } })}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
              e.currentTarget.style.boxShadow = '0 8px 40px rgba(124, 58, 237, 0.5), 0 0 0 1px rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = 'var(--shadow-btn)';
            }}
          >
            Let's Race
            <span style={s.playArrow}>→</span>
          </button>
        </div>
      )}

      {/* Footer */}
      <div style={s.footer}>
        <p style={s.footerText}>Built for fun · Real-time with Socket.io</p>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: '100vh',
    padding: '48px 24px 32px',
    maxWidth: 920,
    margin: '0 auto',
    position: 'relative',
    overflow: 'hidden',
  },

  // Background orbs
  orb1: {
    position: 'fixed', top: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
    animation: 'orbFloat1 20s ease-in-out infinite', pointerEvents: 'none', zIndex: 0,
  },
  orb2: {
    position: 'fixed', bottom: '-15%', left: '-10%', width: 600, height: 600, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(244, 114, 182, 0.06) 0%, transparent 70%)',
    animation: 'orbFloat2 25s ease-in-out infinite', pointerEvents: 'none', zIndex: 0,
  },
  orb3: {
    position: 'fixed', top: '40%', left: '50%', width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(34, 211, 238, 0.04) 0%, transparent 70%)',
    animation: 'orbFloat1 30s ease-in-out infinite reverse', pointerEvents: 'none', zIndex: 0,
  },

  header: {
    textAlign: 'center', marginBottom: 56, position: 'relative', zIndex: 1, animation: 'fadeInUp 0.6s ease-out',
  },
  logoWrapper: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 8 },
  logoIcon: { fontSize: 44, animation: 'float 3s ease-in-out infinite' },
  logo: {
    fontSize: 52, fontWeight: 900, letterSpacing: '-2px',
    background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 30%, #f472b6 70%, #fb923c 100%)',
    backgroundSize: '200% 200%', animation: 'gradientShift 4s ease infinite',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1,
  },
  tagline: { color: 'var(--text-secondary)', marginTop: 4, fontSize: 17, fontWeight: 500, letterSpacing: '0.3px' },
  taglineDivider: { width: 60, height: 3, background: 'var(--gradient-main)', borderRadius: 4, margin: '20px auto 0', opacity: 0.6 },

  section: { marginBottom: 44, position: 'relative', zIndex: 1 },
  sectionTitle: {
    fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 18,
    textTransform: 'uppercase', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: 10,
  },
  sectionDot: {
    width: 8, height: 8, borderRadius: '50%', background: 'var(--purple-400)',
    display: 'inline-block', boxShadow: '0 0 8px var(--purple-400)',
  },
  grid: { display: 'flex', gap: 16, flexWrap: 'wrap' },

  // Game cards
  card: {
    flex: '0 0 220px',
    background: 'var(--bg-card)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)',
    padding: '28px 24px', cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    textAlign: 'center', position: 'relative', overflow: 'hidden',
  },
  cardSelected: {
    border: '1.5px solid var(--purple-400)',
    background: 'rgba(139, 92, 246, 0.08)',
    boxShadow: 'var(--shadow-glow-purple)',
  },
  cardEmojiBox: {
    width: 64, height: 64, borderRadius: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px',
  },
  cardEmoji: { fontSize: 32 },
  cardName: {
    fontSize: 18, fontWeight: 800, marginBottom: 6,
    color: 'var(--text-primary)', letterSpacing: '-0.3px',
  },
  cardDesc: { fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.55 },
  selectedIndicator: {
    marginTop: 14, padding: '5px 14px', borderRadius: 20,
    fontSize: 12, fontWeight: 700, color: '#fff', display: 'inline-block', letterSpacing: '0.5px',
  },

  // Car selection cards
  carGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 14,
  },
  carCard: {
    background: 'var(--bg-card)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
    padding: 16, cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    textAlign: 'left',
  },
  trackCard: {
    background: 'var(--bg-card)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
    padding: 16, cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    textAlign: 'left', overflow: 'hidden',
  },

  // Mode cards
  modeCard: {
    flex: '1 1 280px',
    background: 'var(--bg-card)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)',
    padding: '28px 24px', cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  modeIconRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 },
  deviceIcon: { fontSize: 28 },
  deviceConnector: { fontSize: 14, color: 'var(--text-muted)', opacity: 0.6 },
  badge: {
    display: 'inline-block', marginTop: 14, padding: '5px 14px',
    borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: '0.3px',
  },

  // Play button
  playArea: { textAlign: 'center', marginTop: 8, marginBottom: 32, position: 'relative', zIndex: 1 },
  playBtn: {
    padding: '16px 52px', fontSize: 18, fontWeight: 800,
    background: 'var(--gradient-main)', color: '#fff', border: 'none',
    borderRadius: 'var(--radius-md)', cursor: 'pointer', letterSpacing: '0.5px',
    boxShadow: 'var(--shadow-btn)',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'inline-flex', alignItems: 'center', gap: 10,
    fontFamily: 'var(--font-sans)',
  },
  playArrow: { fontSize: 20, transition: 'transform 0.2s ease' },

  // Footer
  footer: {
    textAlign: 'center', marginTop: 40, paddingTop: 24,
    borderTop: '1px solid var(--border-subtle)', position: 'relative', zIndex: 1,
  },
  footerText: { color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 },
};
