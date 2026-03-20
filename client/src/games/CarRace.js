import * as THREE from 'three';

// ── Game config ───────────────────────────────────────────────────────────────
export const RENDERER_TYPE = 'webgl';
export const INPUT_SCHEMA = 'car';
export const LAPS_TO_WIN = 3;

// ── Car Presets ───────────────────────────────────────────────────────────────
export const CAR_PRESETS = {
  sports: { name: 'Viper GT', accel: 0.022, maxSpeed: 0.85, handling: 0.042, brake: 0.89, color: 0xe63946, accent: 0xff1744, desc: 'Balanced speed & control' },
  muscle: { name: 'Thunder V8', accel: 0.026, maxSpeed: 0.95, handling: 0.032, brake: 0.90, color: 0xff8c00, accent: 0xffa726, desc: 'Raw power, less grip' },
  f1: { name: 'Apex F1', accel: 0.030, maxSpeed: 1.05, handling: 0.048, brake: 0.87, color: 0x00b0ff, accent: 0x40c4ff, desc: 'Top speed, expert handling' },
  truck: { name: 'Bison XL', accel: 0.015, maxSpeed: 0.65, handling: 0.028, brake: 0.93, color: 0x4caf50, accent: 0x69f0ae, desc: 'Slow but tanky' },
};

// ── Track Presets ─────────────────────────────────────────────────────────────
export const TRACK_PRESETS = {
  speedway: {
    name: 'Speedway Oval', desc: 'Classic high-speed oval circuit',
    outer: 85, inner: 50,
    skyTop: 0x4a90d9, skyBottom: 0x87ceeb, fogColor: 0xc8ddf0, fogDensity: 0.0018,
    groundColor: 0x3d8c40, trackColor: 0x444444, trackDark: 0x333333,
    ambientColor: 0xffffff, ambientIntensity: 0.9,
    sunColor: 0xfff8e7, sunIntensity: 1.8,
    barrierColors: [0xff0000, 0xffffff], laneColor: 0xffffff,
    env: 'day', grassDetail: 0x2d7a2f,
  },
  city: {
    name: 'City Streets', desc: 'Tight urban circuit with neon lights',
    outer: 80, inner: 44,
    skyTop: 0x0a0a2e, skyBottom: 0x1a1a3e, fogColor: 0x0d0d2a, fogDensity: 0.003,
    groundColor: 0x1a1a1a, trackColor: 0x2a2a2a, trackDark: 0x222222,
    ambientColor: 0x8888cc, ambientIntensity: 0.6,
    sunColor: 0xaaaaff, sunIntensity: 0.8,
    barrierColors: [0x00e5ff, 0x7c4dff], laneColor: 0xffffff,
    env: 'night', grassDetail: 0x222222,
  },
  desert: {
    name: 'Desert Canyon', desc: 'Scorching desert with wide turns',
    outer: 95, inner: 55,
    skyTop: 0xe8a840, skyBottom: 0xf5d090, fogColor: 0xecc888, fogDensity: 0.0015,
    groundColor: 0xc4a44a, trackColor: 0x555548, trackDark: 0x444438,
    ambientColor: 0xffe8cc, ambientIntensity: 1.0,
    sunColor: 0xffe0a0, sunIntensity: 2.0,
    barrierColors: [0xff6f00, 0xffd54f], laneColor: 0xffffff,
    env: 'day', grassDetail: 0xb8943a,
  },
  neon: {
    name: 'Neon Night', desc: 'Futuristic glowing track in the dark',
    outer: 78, inner: 42,
    skyTop: 0x050520, skyBottom: 0x0a0a30, fogColor: 0x080818, fogDensity: 0.003,
    groundColor: 0x0a0a15, trackColor: 0x151525, trackDark: 0x101020,
    ambientColor: 0x6644cc, ambientIntensity: 0.5,
    sunColor: 0x8844ff, sunIntensity: 0.6,
    barrierColors: [0xff00ff, 0x00ffff], laneColor: 0x00ff88,
    env: 'neon', grassDetail: 0x0a0a15,
  },
};

// ── Physics constants ────────────────────────────────────────────────────────
const CAR_FRICTION = 0.97;
const NITRO_MULTIPLIER = 1.6;
const NITRO_MAX = 100;
const NITRO_REGEN = 0.15;
const NITRO_DRAIN = 1.2;

// ── Three.js module state ─────────────────────────────────────────────────────
let scene, camera, renderer, animId;
let carMeshes = [];
let particleSystems = [];
let trackConfig = null;
let carConfigs = [null, null];
let clock;
let cameraTarget = new THREE.Vector3();
let cameraPos = new THREE.Vector3();

// ── Game State ────────────────────────────────────────────────────────────────
export function createInitialState() {
  return {
    cars: [
      { x: 0, z: 0, angle: 0, speed: 0, lap: 0, checkpoint: false, finished: false, nitro: NITRO_MAX, usingNitro: false, drifting: false, gear: 1, rpm: 0 },
      { x: 0, z: 0, angle: 0, speed: 0, lap: 0, checkpoint: false, finished: false, nitro: NITRO_MAX, usingNitro: false, drifting: false, gear: 1, rpm: 0 },
    ],
    winner: null,
    tick: 0,
    countdown: 180,
  };
}

// ── Physics update ───────────────────────────────────────────────────────────
export function update(state, inputs) {
  const s = JSON.parse(JSON.stringify(state));
  s.tick++;

  if (s.countdown > 0) { s.countdown--; return s; }

  const tc = trackConfig || TRACK_PRESETS.speedway;
  const TRACK_OUTER = tc.outer;
  const TRACK_INNER = tc.inner;
  const TRACK_MID = (TRACK_OUTER + TRACK_INNER) / 2;

  for (let i = 0; i < 2; i++) {
    const car = s.cars[i];
    if (car.finished) continue;

    const cc = carConfigs[i] || CAR_PRESETS.sports;
    const inp = inputs[`p${i + 1}`] || {};

    // Nitro
    car.usingNitro = !!inp.nitro && car.nitro > 5;
    if (car.usingNitro) {
      car.nitro = Math.max(0, car.nitro - NITRO_DRAIN);
    } else {
      car.nitro = Math.min(NITRO_MAX, car.nitro + NITRO_REGEN);
    }

    const speedBoost = car.usingNitro ? NITRO_MULTIPLIER : 1;
    const effectiveMaxSpeed = cc.maxSpeed * speedBoost;

    if (inp.accelerate) {
      car.speed = Math.min(car.speed + cc.accel, effectiveMaxSpeed);
    } else if (inp.brake) {
      car.speed *= cc.brake;
    } else {
      car.speed *= CAR_FRICTION;
    }
    if (Math.abs(car.speed) < 0.001) car.speed = 0;

    // Gears
    const speedRatio = car.speed / cc.maxSpeed;
    car.gear = speedRatio < 0.15 ? 1 : speedRatio < 0.35 ? 2 : speedRatio < 0.55 ? 3 : speedRatio < 0.75 ? 4 : speedRatio < 0.9 ? 5 : 6;
    car.rpm = ((speedRatio * 100) % 18) / 18;

    // Steering
    let steerAmount = 0;
    if (car.speed > 0.01) {
      const factor = Math.min(car.speed / cc.maxSpeed, 1);
      const steerReduction = 1 - factor * 0.4;
      if (typeof inp.steerX === 'number' && Math.abs(inp.steerX) > 0.05) {
        steerAmount = inp.steerX * cc.handling * steerReduction;
      } else {
        if (inp.left) steerAmount = cc.handling * steerReduction;
        if (inp.right) steerAmount = -cc.handling * steerReduction;
      }
    }

    car.drifting = inp.drift && car.speed > 0.2;
    if (car.drifting) { steerAmount *= 1.8; car.speed *= 0.995; }

    car.angle += steerAmount;
    car.x += Math.cos(car.angle) * car.speed;
    car.z -= Math.sin(car.angle) * car.speed;

    // Boundaries
    const dist = Math.sqrt(car.x * car.x + car.z * car.z);
    if (dist > TRACK_OUTER - 3) {
      const n = 1 / dist;
      car.x = car.x * n * (TRACK_OUTER - 3.5);
      car.z = car.z * n * (TRACK_OUTER - 3.5);
      car.speed *= 0.35;
    } else if (dist < TRACK_INNER + 3) {
      const n = 1 / dist;
      car.x = car.x * n * (TRACK_INNER + 3.5);
      car.z = car.z * n * (TRACK_INNER + 3.5);
      car.speed *= 0.35;
    }

    // Car-to-car collision
    const other = s.cars[1 - i];
    const cdx = car.x - other.x;
    const cdz = car.z - other.z;
    const cDist = Math.sqrt(cdx * cdx + cdz * cdz);
    if (cDist < 6 && cDist > 0.01) {
      const pushForce = (6 - cDist) * 0.3;
      car.x += (cdx / cDist) * pushForce;
      car.z += (cdz / cDist) * pushForce;
      car.speed *= 0.7;
    }

    // Lap system
    const carAngle = Math.atan2(car.z, car.x);
    const onTrack = dist > TRACK_INNER && dist < TRACK_OUTER;
    if (onTrack && Math.abs(Math.abs(carAngle) - Math.PI) < 0.25) car.checkpoint = true;
    if (car.checkpoint && onTrack && Math.abs(carAngle) < 0.2 && car.speed > 0.05) {
      car.lap++;
      car.checkpoint = false;
      if (car.lap >= LAPS_TO_WIN && !s.winner) {
        s.winner = i + 1;
        car.finished = true;
      }
    }
  }
  return s;
}

export function checkWin(state) { return state.winner; }

// ═══════════════════════════════════════════════════════════════════════════════
//  THREE.JS RENDERER — Chase Camera Style
// ═══════════════════════════════════════════════════════════════════════════════

export function initRenderer(container, options = {}) {
  const W = container.clientWidth;
  const H = container.clientHeight;

  const carType1 = options.car1 || 'sports';
  const carType2 = options.car2 || 'muscle';
  const trackType = options.track || 'speedway';

  trackConfig = TRACK_PRESETS[trackType] || TRACK_PRESETS.speedway;
  carConfigs = [
    CAR_PRESETS[carType1] || CAR_PRESETS.sports,
    CAR_PRESETS[carType2] || CAR_PRESETS.muscle,
  ];

  const tc = trackConfig;
  const TRACK_MID = (tc.outer + tc.inner) / 2;
  clock = new THREE.Clock();

  // ── Scene ──────────────────────────────────────────────────────
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(tc.fogColor, 50, 350);

  // ── Sky gradient background ────────────────────────────────────
  const skyCanvas = document.createElement('canvas');
  skyCanvas.width = 2; skyCanvas.height = 512;
  const skyCtx = skyCanvas.getContext('2d');
  const skyGrad = skyCtx.createLinearGradient(0, 0, 0, 512);
  const topColor = new THREE.Color(tc.skyTop);
  const bottomColor = new THREE.Color(tc.skyBottom);
  skyGrad.addColorStop(0, `#${topColor.getHexString()}`);
  skyGrad.addColorStop(0.5, `#${bottomColor.getHexString()}`);
  skyGrad.addColorStop(1, `#${new THREE.Color(tc.fogColor).getHexString()}`);
  skyCtx.fillStyle = skyGrad;
  skyCtx.fillRect(0, 0, 2, 512);
  const skyTex = new THREE.CanvasTexture(skyCanvas);
  scene.background = skyTex;

  // ── Camera — behind-car chase cam ─────────────────────────────
  camera = new THREE.PerspectiveCamera(65, W / H, 0.5, 800);
  camera.position.set(TRACK_MID + 30, 18, 0);
  camera.lookAt(TRACK_MID, 0, 0);

  // ── Renderer ──────────────────────────────────────────────────
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  // ── Lighting ──────────────────────────────────────────────────
  const hemi = new THREE.HemisphereLight(tc.skyTop, tc.groundColor, 0.6);
  scene.add(hemi);

  const ambient = new THREE.AmbientLight(tc.ambientColor, tc.ambientIntensity);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(tc.sunColor, tc.sunIntensity);
  sun.position.set(100, 200, 80);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 500;
  const r = tc.outer + 30;
  sun.shadow.camera.left = -r;
  sun.shadow.camera.right = r;
  sun.shadow.camera.top = r;
  sun.shadow.camera.bottom = -r;
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0xffeedd, 0.4);
  fill.position.set(-80, 60, -60);
  scene.add(fill);

  // ── Build World ───────────────────────────────────────────────
  buildGround(tc);
  buildTrackSurface(tc);
  buildBarriersAndFences(tc);
  buildStartFinish(tc);
  buildEnvironment(tc);

  // ── Cars ──────────────────────────────────────────────────────
  carMeshes = [
    createDetailedCar(carConfigs[0], new THREE.Vector3(TRACK_MID, 0, -5), 0),
    createDetailedCar(carConfigs[1], new THREE.Vector3(TRACK_MID, 0, 5), 0),
  ];

  // ── Particles ─────────────────────────────────────────────────
  particleSystems = [createParticleSystem(), createParticleSystem()];

  // ── Render Loop ───────────────────────────────────────────────
  const loop = () => {
    animId = requestAnimationFrame(loop);
    const dt = clock.getDelta();
    particleSystems.forEach(ps => updateParticles(ps, dt));
    renderer.render(scene, camera);
  };
  loop();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  GROUND — Large plane with grass/sand texture
// ═══════════════════════════════════════════════════════════════════════════════
function buildGround(tc) {
  // Main ground
  const groundGeo = new THREE.PlaneGeometry(800, 800);
  const groundMat = new THREE.MeshStandardMaterial({
    color: tc.groundColor,
    roughness: 0.95,
    metalness: 0,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.1;
  ground.receiveShadow = true;
  scene.add(ground);

  // Inner island — slightly different color
  const islandGeo = new THREE.CircleGeometry(tc.inner - 2, 64);
  const islandMat = new THREE.MeshStandardMaterial({ color: tc.grassDetail, roughness: 0.9 });
  const island = new THREE.Mesh(islandGeo, islandMat);
  island.rotation.x = -Math.PI / 2;
  island.position.y = 0.05;
  island.receiveShadow = true;
  scene.add(island);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TRACK SURFACE — asphalt ring with lane markings and curbs
// ═══════════════════════════════════════════════════════════════════════════════
function buildTrackSurface(tc) {
  const TRACK_MID = (tc.outer + tc.inner) / 2;

  // Asphalt ring
  const trackGeo = new THREE.RingGeometry(tc.inner, tc.outer, 128);
  const trackMat = new THREE.MeshStandardMaterial({
    color: tc.trackColor,
    roughness: 0.75,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
  const track = new THREE.Mesh(trackGeo, trackMat);
  track.rotation.x = -Math.PI / 2;
  track.position.y = 0.02;
  track.receiveShadow = true;
  scene.add(track);

  // Darker inner lane
  const innerLaneGeo = new THREE.RingGeometry(tc.inner, TRACK_MID - 1, 128);
  const innerLaneMat = new THREE.MeshStandardMaterial({
    color: tc.trackDark,
    roughness: 0.8,
    side: THREE.DoubleSide,
  });
  const innerLane = new THREE.Mesh(innerLaneGeo, innerLaneMat);
  innerLane.rotation.x = -Math.PI / 2;
  innerLane.position.y = 0.03;
  scene.add(innerLane);

  // White dashed center line
  const dashCount = 80;
  for (let i = 0; i < dashCount; i++) {
    if (i % 2 === 0) continue;
    const a1 = (i / dashCount) * Math.PI * 2;
    const a2 = ((i + 0.7) / dashCount) * Math.PI * 2;
    const pts = [];
    for (let j = 0; j <= 6; j++) {
      const a = a1 + (a2 - a1) * (j / 6);
      pts.push(new THREE.Vector3(Math.cos(a) * TRACK_MID, 0.06, Math.sin(a) * TRACK_MID));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.TubeGeometry(curve, 6, 0.3, 4);
    const mat = new THREE.MeshStandardMaterial({
      color: tc.laneColor,
      emissive: tc.env === 'neon' ? tc.laneColor : 0x000000,
      emissiveIntensity: tc.env === 'neon' ? 0.8 : 0,
    });
    scene.add(new THREE.Mesh(geo, mat));
  }

  // Red-white outer curbs
  buildCurbStrip(tc.outer - 1, tc.outer + 0.5, 100, tc);
  // Yellow-black inner curbs
  buildCurbStrip(tc.inner - 0.5, tc.inner + 1, 100, tc, true);
}

function buildCurbStrip(innerR, outerR, count, tc, isInner = false) {
  for (let i = 0; i < count; i++) {
    const a1 = (i / count) * Math.PI * 2;
    const a2 = ((i + 0.95) / count) * Math.PI * 2;
    const color = isInner
      ? (i % 2 === 0 ? 0xffcc00 : 0x333333)
      : (i % 2 === 0 ? 0xff2222 : 0xffffff);
    const shape = new THREE.Shape();
    shape.moveTo(Math.cos(a1) * innerR, Math.sin(a1) * innerR);
    shape.lineTo(Math.cos(a1) * outerR, Math.sin(a1) * outerR);
    shape.lineTo(Math.cos(a2) * outerR, Math.sin(a2) * outerR);
    shape.lineTo(Math.cos(a2) * innerR, Math.sin(a2) * innerR);
    shape.closePath();
    const geo = new THREE.ShapeGeometry(shape);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.5 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.04;
    scene.add(mesh);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  BARRIERS & GUARDRAILS — 3D walls along the track edges
// ═══════════════════════════════════════════════════════════════════════════════
function buildBarriersAndFences(tc) {
  // Outer concrete barrier (continuous wall)
  const outerWallR = tc.outer + 1.5;
  const wallHeight = 1.8;
  const wallSegments = 120;

  for (let i = 0; i < wallSegments; i++) {
    const a = (i / wallSegments) * Math.PI * 2;
    const aNext = ((i + 1) / wallSegments) * Math.PI * 2;
    const aMid = (a + aNext) / 2;
    const segLen = outerWallR * (aNext - a);

    const geo = new THREE.BoxGeometry(segLen + 0.1, wallHeight, 1.5);
    const color = i % 6 < 3 ? tc.barrierColors[0] : tc.barrierColors[1];
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.6,
      metalness: 0.1,
      emissive: tc.env === 'neon' ? color : 0x000000,
      emissiveIntensity: tc.env === 'neon' ? 0.4 : 0,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(Math.cos(aMid) * outerWallR, wallHeight / 2, Math.sin(aMid) * outerWallR);
    mesh.rotation.y = -aMid + Math.PI / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
  }

  // Inner guardrail
  const innerWallR = tc.inner - 1.5;
  for (let i = 0; i < wallSegments; i++) {
    const a = (i / wallSegments) * Math.PI * 2;
    const aNext = ((i + 1) / wallSegments) * Math.PI * 2;
    const aMid = (a + aNext) / 2;
    const segLen = innerWallR * (aNext - a);

    const geo = new THREE.BoxGeometry(segLen + 0.1, 1.2, 0.8);
    const mat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.3, metalness: 0.5 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(Math.cos(aMid) * innerWallR, 0.6, Math.sin(aMid) * innerWallR);
    mesh.rotation.y = -aMid + Math.PI / 2;
    mesh.castShadow = true;
    scene.add(mesh);
  }

  // Metal rail on top of outer wall
  const railPts = [];
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    railPts.push(new THREE.Vector3(Math.cos(a) * outerWallR, wallHeight + 0.3, Math.sin(a) * outerWallR));
  }
  const railCurve = new THREE.CatmullRomCurve3(railPts, true);
  const railGeo = new THREE.TubeGeometry(railCurve, 256, 0.15, 6, true);
  const railMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });
  scene.add(new THREE.Mesh(railGeo, railMat));
}

// ═══════════════════════════════════════════════════════════════════════════════
//  START/FINISH LINE
// ═══════════════════════════════════════════════════════════════════════════════
function buildStartFinish(tc) {
  const tileSize = 2.5;
  const count = Math.floor((tc.outer - tc.inner) / tileSize);
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < count; i++) {
      const r = tc.inner + i * tileSize + tileSize / 2;
      const geo = new THREE.PlaneGeometry(tileSize - 0.1, 2.5);
      const color = (i + row) % 2 === 0 ? 0xffffff : 0x111111;
      const mat = new THREE.MeshStandardMaterial({ color });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(r, 0.06, -2.5 + row * 2.5);
      scene.add(mesh);
    }
  }

  // Start/finish gantry (overhead arch)
  const gantryMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.6, roughness: 0.2 });
  const poles = [tc.inner - 3, tc.outer + 3];
  poles.forEach(pr => {
    const poleGeo = new THREE.CylinderGeometry(0.5, 0.5, 20, 12);
    const pole = new THREE.Mesh(poleGeo, gantryMat);
    pole.position.set(pr, 10, 0);
    pole.castShadow = true;
    scene.add(pole);
  });

  // Crossbar
  const span = tc.outer - tc.inner + 6;
  const crossGeo = new THREE.BoxGeometry(span, 2, 3);
  const crossMat = new THREE.MeshStandardMaterial({ color: 0xdd0000, roughness: 0.4, metalness: 0.2 });
  const cross = new THREE.Mesh(crossGeo, crossMat);
  cross.position.set((tc.outer + tc.inner) / 2, 20, 0);
  cross.castShadow = true;
  scene.add(cross);

  // Checker pattern on crossbar face
  for (let i = 0; i < 16; i++) {
    for (let row = 0; row < 2; row++) {
      const cGeo = new THREE.PlaneGeometry(span / 16, 1);
      const cColor = (i + row) % 2 === 0 ? 0xffffff : 0x111111;
      const cMat = new THREE.MeshStandardMaterial({ color: cColor });
      const cMesh = new THREE.Mesh(cGeo, cMat);
      cMesh.position.set(
        tc.inner - 3 + (i + 0.5) * (span / 16),
        19.5 + row * 1,
        1.51
      );
      scene.add(cMesh);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ENVIRONMENT — trees, buildings, grandstands, lights
// ═══════════════════════════════════════════════════════════════════════════════
function buildEnvironment(tc) {
  // ── Track-side flood lights ──
  const lightCount = tc.env === 'neon' ? 20 : 10;
  for (let i = 0; i < lightCount; i++) {
    const a = (i / lightCount) * Math.PI * 2;
    const r = tc.outer + 8;
    buildFloodLight(Math.cos(a) * r, Math.sin(a) * r, a, tc);
  }

  // ── Scenery (depends on track type) ──
  if (tc.env === 'day') {
    // Trees around outside
    for (let i = 0; i < 30; i++) {
      const a = (i / 30) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
      const r = tc.outer + 15 + Math.random() * 40;
      buildRealisticTree(Math.cos(a) * r, Math.sin(a) * r);
    }
    // Trees inside island
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const r = 10 + Math.random() * (tc.inner - 18);
      buildRealisticTree(Math.cos(a) * r, Math.sin(a) * r);
    }
  }

  if (tc.env === 'night' || tc.env === 'neon') {
    // City buildings outside track
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2 + (Math.random() - 0.5) * 0.1;
      const r = tc.outer + 14 + Math.random() * 30;
      buildCityBuilding(Math.cos(a) * r, Math.sin(a) * r, tc);
    }
  }

  // ── Grandstands ──
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.4;
    const r = tc.outer + 6;
    buildGrandstand(Math.cos(a) * r, Math.sin(a) * r, a, tc);
  }

  // ── Billboard signs ──
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.8;
    const r = tc.outer + 4;
    buildBillboard(Math.cos(a) * r, Math.sin(a) * r, a, tc);
  }
}

function buildFloodLight(x, z, angle, tc) {
  // Pole
  const poleGeo = new THREE.CylinderGeometry(0.3, 0.4, 18, 8);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.7, roughness: 0.3 });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.set(x, 9, z);
  pole.castShadow = true;
  scene.add(pole);

  // Light panel
  const panelGeo = new THREE.BoxGeometry(3, 2, 0.5);
  const lightColor = tc.env === 'neon'
    ? [0xff00ff, 0x00ffff, 0x00ff88, 0xffff00][Math.floor(Math.random() * 4)]
    : 0xffffee;
  const panelMat = new THREE.MeshStandardMaterial({
    color: lightColor,
    emissive: lightColor,
    emissiveIntensity: tc.env === 'neon' ? 2 : 1.2,
  });
  const panel = new THREE.Mesh(panelGeo, panelMat);
  panel.position.set(x, 18.5, z);
  panel.rotation.y = -angle;
  scene.add(panel);

  // Actual light (every other to save perf)
  if (Math.random() > 0.5) {
    const light = new THREE.PointLight(lightColor, tc.env === 'neon' ? 3 : 1.5, 60);
    light.position.set(x, 17, z);
    scene.add(light);
  }
}

function buildRealisticTree(x, z) {
  // Brown trunk
  const trunkGeo = new THREE.CylinderGeometry(0.4, 0.6, 6, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3a1a, roughness: 0.9 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.set(x, 3, z);
  trunk.castShadow = true;
  scene.add(trunk);

  // Green canopy — big sphere
  const canopyGeo = new THREE.SphereGeometry(3.5 + Math.random() * 1.5, 10, 10);
  const canopyMat = new THREE.MeshStandardMaterial({
    color: 0x2d8a1a + Math.floor(Math.random() * 0x111111),
    roughness: 0.85,
  });
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.set(x, 8 + Math.random(), z);
  canopy.castShadow = true;
  scene.add(canopy);
}

function buildCityBuilding(x, z, tc) {
  const height = 20 + Math.random() * 50;
  const width = 5 + Math.random() * 8;
  const depth = 5 + Math.random() * 8;

  const geo = new THREE.BoxGeometry(width, height, depth);
  const mat = new THREE.MeshStandardMaterial({
    color: tc.env === 'neon' ? 0x151530 : 0x222233,
    roughness: 0.6,
    metalness: 0.2,
  });
  const building = new THREE.Mesh(geo, mat);
  building.position.set(x, height / 2, z);
  building.castShadow = true;
  building.receiveShadow = true;
  scene.add(building);

  // Lit windows
  const rows = Math.floor(height / 4);
  const cols = Math.floor(width / 3);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() < 0.25) continue;
      const wGeo = new THREE.PlaneGeometry(1.5, 2);
      const wColor = tc.env === 'neon'
        ? [0xffcc00, 0x00ffff, 0xff44ff, 0x44ff44, 0xff8800][Math.floor(Math.random() * 5)]
        : [0xffddaa, 0xffeebb, 0xffffcc][Math.floor(Math.random() * 3)];
      const wMat = new THREE.MeshStandardMaterial({
        color: wColor,
        emissive: wColor,
        emissiveIntensity: 0.7,
      });
      const win = new THREE.Mesh(wGeo, wMat);
      win.position.set(
        x - width / 2 + 1.5 + c * 2.8,
        2 + r * 4,
        z + depth / 2 + 0.05
      );
      scene.add(win);
    }
  }
}

function buildGrandstand(x, z, angle, tc) {
  // Tiered seating
  for (let tier = 0; tier < 4; tier++) {
    const w = 20;
    const h = 3;
    const d = 5;
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({
      color: [0x445566, 0x556677, 0x667788, 0x778899][tier],
      roughness: 0.6,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      x + Math.cos(angle + Math.PI) * tier * 2,
      tier * 3 + 1.5,
      z + Math.sin(angle + Math.PI) * tier * 2
    );
    mesh.rotation.y = -angle;
    mesh.castShadow = true;
    scene.add(mesh);
  }

  // Roof
  const roofGeo = new THREE.BoxGeometry(22, 0.5, 8);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.4, roughness: 0.3 });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(
    x + Math.cos(angle + Math.PI) * 4,
    14,
    z + Math.sin(angle + Math.PI) * 4
  );
  roof.rotation.y = -angle;
  scene.add(roof);

  // Colorful dots = spectators
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 10; col++) {
      const dotGeo = new THREE.SphereGeometry(0.45, 6, 6);
      const dotColor = [0xff3333, 0x3333ff, 0xffff33, 0xff33ff, 0x33ffff, 0xff8833, 0x33ff33][Math.floor(Math.random() * 7)];
      const dotMat = new THREE.MeshStandardMaterial({ color: dotColor });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      const localX = -9 + col * 2;
      const localY = row * 3 + 3;
      dot.position.set(
        x + Math.cos(-angle) * localX + Math.cos(angle + Math.PI) * (row * 2),
        localY,
        z + Math.sin(-angle) * localX + Math.sin(angle + Math.PI) * (row * 2)
      );
      scene.add(dot);
    }
  }
}

function buildBillboard(x, z, angle, tc) {
  // Two posts
  const postGeo = new THREE.CylinderGeometry(0.25, 0.25, 10, 6);
  const postMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.5, roughness: 0.4 });
  [-3, 3].forEach(offset => {
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(
      x + Math.cos(-angle + Math.PI / 2) * offset,
      5,
      z + Math.sin(-angle + Math.PI / 2) * offset
    );
    scene.add(post);
  });

  // Sign board
  const signGeo = new THREE.BoxGeometry(8, 4, 0.3);
  const signColors = [0xff4444, 0x4444ff, 0xffcc00, 0x44cc44];
  const signMat = new THREE.MeshStandardMaterial({
    color: signColors[Math.floor(Math.random() * 4)],
    roughness: 0.3,
    emissive: tc.env !== 'day' ? signColors[Math.floor(Math.random() * 4)] : 0x000000,
    emissiveIntensity: tc.env !== 'day' ? 0.3 : 0,
  });
  const sign = new THREE.Mesh(signGeo, signMat);
  sign.position.set(x, 11, z);
  sign.rotation.y = -angle;
  scene.add(sign);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CAR MODEL — Detailed, visible from behind
// ═══════════════════════════════════════════════════════════════════════════════
function createDetailedCar(preset, startPos, startAngle) {
  const group = new THREE.Group();
  const color = preset.color;
  const accent = preset.accent;

  const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.25, metalness: 0.7 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5, metalness: 0.3 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.9, roughness: 0.1 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x88bbee, transparent: true, opacity: 0.45, roughness: 0.05, metalness: 0.9 });

  // Lower body
  const lowerGeo = new THREE.BoxGeometry(5, 1, 10);
  const lower = new THREE.Mesh(lowerGeo, bodyMat);
  lower.position.y = 0.8;
  lower.castShadow = true;
  group.add(lower);

  // Upper body / cabin
  const upperGeo = new THREE.BoxGeometry(4.4, 0.9, 7);
  const upper = new THREE.Mesh(upperGeo, bodyMat);
  upper.position.set(0, 1.75, -0.3);
  upper.castShadow = true;
  group.add(upper);

  // Roof
  const roofGeo = new THREE.BoxGeometry(4, 0.3, 4);
  const roof = new THREE.Mesh(roofGeo, bodyMat);
  roof.position.set(0, 2.55, -0.5);
  group.add(roof);

  // Windshield front
  const windFGeo = new THREE.PlaneGeometry(3.8, 1.8);
  const windF = new THREE.Mesh(windFGeo, glassMat);
  windF.position.set(0, 2.1, 3.0);
  windF.rotation.x = -0.3;
  group.add(windF);

  // Windshield rear
  const windRGeo = new THREE.PlaneGeometry(3.8, 1.5);
  const windR = new THREE.Mesh(windRGeo, glassMat);
  windR.position.set(0, 2.1, -2.8);
  windR.rotation.x = 0.3;
  group.add(windR);

  // Side windows
  [-2.25, 2.25].forEach(sx => {
    const sideGeo = new THREE.PlaneGeometry(4, 1.3);
    const sideWin = new THREE.Mesh(sideGeo, glassMat);
    sideWin.position.set(sx, 2.0, -0.3);
    sideWin.rotation.y = sx > 0 ? -Math.PI / 2 : Math.PI / 2;
    group.add(sideWin);
  });

  // Hood scoop
  const scoopGeo = new THREE.BoxGeometry(1.8, 0.6, 2.5);
  const scoop = new THREE.Mesh(scoopGeo, darkMat);
  scoop.position.set(0, 1.6, 3);
  group.add(scoop);

  // Front bumper
  const bumperGeo = new THREE.BoxGeometry(5.2, 0.6, 0.8);
  const bumper = new THREE.Mesh(bumperGeo, darkMat);
  bumper.position.set(0, 0.5, 5.2);
  group.add(bumper);

  // Front splitter
  const splitterGeo = new THREE.BoxGeometry(4.5, 0.15, 1.2);
  const splitter = new THREE.Mesh(splitterGeo, darkMat);
  splitter.position.set(0, 0.2, 5);
  group.add(splitter);

  // Rear diffuser
  const diffuserGeo = new THREE.BoxGeometry(4.5, 0.4, 1);
  const diffuser = new THREE.Mesh(diffuserGeo, darkMat);
  diffuser.position.set(0, 0.4, -5);
  group.add(diffuser);

  // Spoiler
  const spoilerGeo = new THREE.BoxGeometry(5, 0.25, 1.5);
  const spoiler = new THREE.Mesh(spoilerGeo, darkMat);
  spoiler.position.set(0, 2.8, -4.5);
  group.add(spoiler);

  // Spoiler supports
  [-1.8, 1.8].forEach(sx => {
    const supGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.5, 6);
    const sup = new THREE.Mesh(supGeo, chromeMat);
    sup.position.set(sx, 2.1, -4.5);
    group.add(sup);
  });

  // Side skirts
  [-2.7, 2.7].forEach(sx => {
    const skirtGeo = new THREE.BoxGeometry(0.4, 0.5, 8.5);
    const skirt = new THREE.Mesh(skirtGeo, darkMat);
    skirt.position.set(sx, 0.5, 0);
    group.add(skirt);
  });

  // Wheels
  [[-2.6, 0, 3.2], [2.6, 0, 3.2], [-2.6, 0, -3.2], [2.6, 0, -3.2]].forEach(([wx, wy, wz]) => {
    // Tire
    const tireGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.9, 20);
    const tire = new THREE.Mesh(tireGeo, new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 }));
    tire.rotation.z = Math.PI / 2;
    tire.position.set(wx, wy + 0.7, wz);
    group.add(tire);
    // Rim
    const rimGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.92, 10);
    const rim = new THREE.Mesh(rimGeo, chromeMat);
    rim.rotation.z = Math.PI / 2;
    rim.position.set(wx, wy + 0.7, wz);
    group.add(rim);
    // Hub
    const hubGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.94, 6);
    const hubMat = new THREE.MeshStandardMaterial({ color: accent, metalness: 0.8, roughness: 0.2 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.rotation.z = Math.PI / 2;
    hub.position.set(wx, wy + 0.7, wz);
    group.add(hub);
  });

  // Headlights (bright emissive)
  const hlGeo = new THREE.SphereGeometry(0.5, 10, 10);
  const hlMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffdd,
    emissiveIntensity: 2,
  });
  [-1.7, 1.7].forEach(lx => {
    const hl = new THREE.Mesh(hlGeo, hlMat);
    hl.position.set(lx, 0.9, 5.3);
    group.add(hl);
  });

  // Taillights (red glow)
  const tlGeo = new THREE.BoxGeometry(1.5, 0.5, 0.3);
  const tlMat = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
    emissiveIntensity: 1.5,
  });
  [-1.5, 1.5].forEach(lx => {
    const tl = new THREE.Mesh(tlGeo, tlMat);
    tl.position.set(lx, 0.9, -5.2);
    group.add(tl);
  });

  // Exhaust pipes
  [-0.6, 0.6].forEach(ex => {
    const exGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.8, 8);
    const exMesh = new THREE.Mesh(exGeo, chromeMat);
    exMesh.rotation.x = Math.PI / 2;
    exMesh.position.set(ex, 0.4, -5.5);
    group.add(exMesh);
  });

  group.position.copy(startPos);
  group.rotation.y = startAngle;
  scene.add(group);
  return group;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PARTICLES
// ═══════════════════════════════════════════════════════════════════════════════
function createParticleSystem() {
  const count = 80;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = [];
  const lifetimes = [];

  for (let i = 0; i < count; i++) {
    positions[i * 3] = 0;
    positions[i * 3 + 1] = -200;
    positions[i * 3 + 2] = 0;
    velocities.push({ x: 0, y: 0, z: 0 });
    lifetimes.push(0);
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color: 0xcccccc, size: 2.5, transparent: true, opacity: 0.6 });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  return { geo, mat, points, velocities, lifetimes, index: 0, count };
}

function emitParticle(ps, x, y, z, color) {
  const i = ps.index % ps.count;
  const positions = ps.geo.attributes.position.array;
  positions[i * 3] = x;
  positions[i * 3 + 1] = y;
  positions[i * 3 + 2] = z;
  ps.velocities[i] = {
    x: (Math.random() - 0.5) * 3,
    y: 0.5 + Math.random() * 2,
    z: (Math.random() - 0.5) * 3,
  };
  ps.lifetimes[i] = 1.0;
  ps.mat.color.setHex(color);
  ps.index++;
  ps.geo.attributes.position.needsUpdate = true;
}

function updateParticles(ps, dt) {
  const positions = ps.geo.attributes.position.array;
  for (let i = 0; i < ps.count; i++) {
    if (ps.lifetimes[i] > 0) {
      ps.lifetimes[i] -= dt * 2;
      positions[i * 3] += ps.velocities[i].x * dt * 4;
      positions[i * 3 + 1] += ps.velocities[i].y * dt * 4;
      positions[i * 3 + 2] += ps.velocities[i].z * dt * 4;
      ps.velocities[i].y -= dt * 3;
    } else {
      positions[i * 3 + 1] = -200;
    }
  }
  ps.geo.attributes.position.needsUpdate = true;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  UPDATE — sync visuals + CHASE CAMERA
// ═══════════════════════════════════════════════════════════════════════════════
export function updateRenderer(state) {
  if (!carMeshes.length || !scene || !camera) return;

  // Update car positions
  state.cars.forEach((car, i) => {
    const mesh = carMeshes[i];
    if (!mesh) return;
    mesh.position.set(car.x, 0, car.z);
    mesh.rotation.y = car.angle - Math.PI / 2;

    // Slight body roll when turning
    const tilt = car.drifting ? 0.07 : 0.025;
    mesh.rotation.z = -car.speed * tilt;

    // Particles
    const ps = particleSystems[i];
    if (ps && car.speed > 0.15) {
      if (car.drifting) {
        emitParticle(ps, car.x, 0.5, car.z, 0x999999);
        emitParticle(ps, car.x, 0.5, car.z, 0xaaaaaa);
      }
      if (car.usingNitro) {
        const ex = car.x - Math.cos(car.angle) * 6;
        const ez = car.z + Math.sin(car.angle) * 6;
        emitParticle(ps, ex, 0.8, ez, 0xff4400);
        emitParticle(ps, ex, 0.8, ez, 0xff8800);
      }
    }
  });

  // ── CHASE CAMERA — follows behind the lead car ──
  const lead = state.cars[0]; // Follow P1
  const behindDist = 28;
  const heightAbove = 14;
  const lookAheadDist = 15;

  // Position behind the car
  const idealX = lead.x - Math.cos(lead.angle) * behindDist;
  const idealZ = lead.z + Math.sin(lead.angle) * behindDist;
  const idealY = heightAbove;

  // Smooth camera movement
  cameraPos.x += (idealX - cameraPos.x) * 0.06;
  cameraPos.y += (idealY - cameraPos.y) * 0.06;
  cameraPos.z += (idealZ - cameraPos.z) * 0.06;

  // Look-at point ahead of the car
  const lookX = lead.x + Math.cos(lead.angle) * lookAheadDist;
  const lookZ = lead.z - Math.sin(lead.angle) * lookAheadDist;
  cameraTarget.x += (lookX - cameraTarget.x) * 0.08;
  cameraTarget.y += (2 - cameraTarget.y) * 0.08;
  cameraTarget.z += (lookZ - cameraTarget.z) * 0.08;

  camera.position.copy(cameraPos);
  camera.lookAt(cameraTarget);
}

export function handleResize(container) {
  if (!renderer || !camera) return;
  const W = container.clientWidth;
  const H = container.clientHeight;
  camera.aspect = W / H;
  camera.updateProjectionMatrix();
  renderer.setSize(W, H);
}

export function cleanup() {
  if (animId) cancelAnimationFrame(animId);
  if (renderer) {
    renderer.dispose();
    renderer.domElement?.parentNode?.removeChild(renderer.domElement);
  }
  scene = null;
  camera = null;
  renderer = null;
  carMeshes = [];
  particleSystems = [];
  animId = null;
  trackConfig = null;
  carConfigs = [null, null];
}
