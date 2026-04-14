/**
 * CORE CONFIGURATION
 * Single source of truth for the PongEngine physics, AIOpponent FSM,
 * React Three Fiber rendering pipeline, and GameState logic.
 */
export const GameConfig = {
  // --- BRANDING & THEMING ---
  colors: {
    p1: "#0066ff",
    p2: "#ff3333",
  },

  ui: {
    backgroundColor: "#050505",
    controls: {
      togglePauseKey: "Space",
    },
  },

  // --- MATCH DEFAULTS ---
  defaults: {
    mode: "advanced",
    opponent: "medium",
  },

  rules: {
    winLimit: 11,
    winByTwo: true,
    serveDelay: 420, // Physics engine suspension duration (ms) post-goal
  },

  // --- SPATIAL BOUNDARIES ---
  court: {
    width: 22,
    depth: 11,
    zLimit: 5,
    xLimit: 11,
    wallHeight: 2.0,
    floorHeight: 5.0,
    wallThickness: 0.5,
    bezelInset: 0.1,
    bezelHeight: 0.01,
    netWidth: 0.15,
    frameThickness: 0.02,
    scoreboardHeightOffset: 0.3,
  },

  // --- 3D MATERIAL PROPERTIES ---
  arena: {
    floorColor: "#2d2d3d",
    bezelColor: "#88889a",
    bezelRoughness: 0.1,
    bezelMetalness: 0.9,
    netColor: "#ffffff",
    netOpacity: 0.3,
    glassColor: "#ffffff",
    glassOpacity: 0.08,
    frameColor: "#ffffff",
    frameOpacity: 0.5,
    frameEmissiveIntensity: 0.5,
    frameMetalness: 0.8,
    frameRoughness: 0.2,
    scoreboardEmissive: 2.5, // Exceeds Bloom threshold (1.0) to enforce glowing
    vsTextColor: "#ffffff",
    fontUrl: "/fonts/helvetiker_bold.typeface.json",
    textStyle: {
      size: 2.2,
      height: 0.1,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
    },
    // Fractional coordinate offsets applied during mesh generation to
    // prevent Z-fighting and Moire rendering artifacts.
    offsets: {
      floor: -0.01,
      bezel: -0.005,
      net: 0.001,
      scoreboardDepth: 0.01,
      vertFrameY: -0.01,
    },
  },

  // --- PHYSICS ENGINE PARAMETERS ---
  physics: {
    maxDelta: 0.1, // Hard cap on physics step to prevent boundary tunneling during render stutters
    collisionNudge: 0.01, // Absolute spatial offset applied post-collision to prevent boundary trapping
    paddleVelocityTransfer: 0.5, // Coefficient of kinetic energy transfer upon paddle impact
    spinDecayOnHit: 0.5, // Coefficient of spin inversion and dampening upon paddle impact
  },

  ball: {
    radius: 0.3,
    startVelocityX: 12,
    startVelocityZ: 10,
    maxXVelocity: 28, // Thermodynamic cap: Terminal velocity (X-Axis)
    maxZVelocity: 14, // Thermodynamic cap: Terminal velocity (Z-Axis)
    maxSpin: 20, // Thermodynamic cap: Maximum rotational energy for Magnus effect calculation
    deflectionBoost: 3, // Momentum multiplier applied to off-center Z-axis collisions
    swipeSpinFactor: 0.6, // Ratio of paddle Z-velocity converted into ball rotational energy
    spinFriction: 0.1, // Simulated atmospheric drag applied per delta to rotational energy
    gravity: 18,
    serveHeight: 2.5,
    paddleHitForceY: 6, // Vertical velocity injection upon Advanced Mode paddle collisions
    bounceFriction: 0.8, // Coefficient of restitution for floor collisions
  },

  paddle: {
    width: 0.5,
    height: 1.6,
    depth: 2,
    zLimit: 4.0, // Absolute kinematic boundary for lateral movement
    xMin: 0.25, // Absolute kinematic boundary for forward net-approach
    xMax: 10.75, // Absolute kinematic boundary for baseline retreat
    acceleration: 60,
    friction: 10,
    maxVelocity: 15,
  },

  // --- ENTITY BINDINGS ---
  player1: {
    xPos: -8,
    controls: { up: "w", down: "s", left: "a", right: "d" },
  },

  player2: {
    xPos: 8,
    controls: {
      up: "arrowup",
      down: "arrowdown",
      left: "arrowleft",
      right: "arrowright",
    },
  },

  // --- AI FINITE STATE MACHINE PARAMETERS ---
  ai: {
    mistakeUpdateIntervalMs: 600, // Evaluation frequency for target recalculation
    lobBackpedalOffset: 2, // Baseline retreat offset triggered by overhead Y-axis tracking
    deadzone: { z: 0.3, x: 0.2 }, // Spatial threshold required to trigger kinematic output
    lerpSpeed: { base: 0.15, fast: 0.3 }, // Interpolation constants for tracking smoothing
    difficulties: {
      easy: { reactionDelayMs: 600, errorMargin: 1.5 },
      medium: { reactionDelayMs: 250, errorMargin: 0.5 },
      hard: { reactionDelayMs: 0, errorMargin: 0.05 },
    },
  },

  // --- 3D VISUALS & POST-PROCESSING ---
  paddleVisuals: {
    emissiveIntensity: 0.4,
    roughness: 0.1,
    metalness: 0.5,
    tiltFactor: -0.02, // Rotational transform multiplier derived from kinematic velocity
    skirtExtension: 0.5, // Sub-floor geometry extension to conceal gaps during extreme X/Z rotations
    fpsBase: 60, // Normalization constant ensuring frame-rate independent visual interpolation
  },

  ballVisuals: {
    showTrail: false,
    color: "#ffffff",
    emissive: "#ffffff",
    emissiveIntensity: 0.4,
    roughness: 0.2,
    metalness: 0.1,
    trailColor: "#ffffff",
    trailLength: 4,
    trailDecay: 5,
    showGlow: false,
    glowIntensity: 2.0,
    glowDistance: 8,
    segments: 32, // Sphere geometry subdivision resolution
    visualSpinMultiplier: 5.0, // Exaggerates rotational rendering independently of the physics engine
  },

  render: {
    bloom: {
      intensity: 0.5,
      luminanceThreshold: 1.0,
      luminanceSmoothing: 0.9,
    },
    lighting: {
      ambientIntensity: 0.6,
      directional: {
        position: [0, 30, 0] as [number, number, number],
        intensity: 2.5,
        shadowBias: 0.0005,
        shadowNormalBias: 0.02,
        shadowMapSize: 2048,
        cameraArgs: [-20, 20, 15, -15, 0.1, 50] as [
          number,
          number,
          number,
          number,
          number,
          number,
        ],
      },
      points: [
        {
          position: [15, 10, 15] as [number, number, number],
          intensity: 1.0,
          distance: 35,
        },
        {
          position: [-15, 10, 15] as [number, number, number],
          intensity: 1.0,
          distance: 35,
        },
        {
          position: [15, 10, -15] as [number, number, number],
          intensity: 1.0,
          distance: 35,
        },
        {
          position: [-15, 10, -15] as [number, number, number],
          intensity: 1.0,
          distance: 35,
        },
      ],
    },
    responsive: {
      targetAspect: 2.2, // Triggers dynamic FOV compensation if viewport ratio drops below this threshold
    },
  },

  camera: {
    position: [0, 17, 13] as [number, number, number],
    fov: 35,
    controls: {
      enablePan: false,
      maxPolarAngle: 1.52, // Clamps downward orbital rotation flush with the floor plane
      minDistance: 10,
      maxDistance: 45,
      mouseButtons: {
        left: 0, // Map Left-Click to Orbit Rotate
        middle: 1, // Map Middle-Click to Dolly Zoom
        right: 2, // Map Right-Click to Pan
      },
    },
  },
};
