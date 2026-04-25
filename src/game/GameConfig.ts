export const GameConfig = {
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

  defaults: {
    mode: "advanced",
    opponent: "medium",
  },

  rules: {
    winLimit: 11,
    winByTwo: true,
    serveDelay: 420,
  },

  court: {
    width: 22,
    depth: 11,
    zLimit: 5,
    xLimit: 11,
    centerX: 0,
    wallHeight: 2.0,
    // Physics ceiling is above the visible walls to allow high lob shots.
    physicsCeilingMultiplier: 3.0,
    floorHeight: 5.0,
    wallThickness: 0.5,
    netWidth: 0.15,
    frameThickness: 0.02,
    scoreboardHeightOffset: 0.3,
  },

  arena: {
    floorColor: "#2d2d3d",
    netColor: "#ffffff",
    netOpacity: 0.3,
    glassColor: "#ffffff",
    glassOpacity: 0.08,
    frameColor: "#ffffff",
    frameOpacity: 0.5,
    frameEmissiveIntensity: 0.5,
    frameMetalness: 0.8,
    frameRoughness: 0.2,
    scoreboardEmissive: 2.5,
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
    offsets: {
      floor: -0.01,
      net: 0.001,
      scoreboardDepth: 0.01,
      vertFrameY: -0.01,
      frameGeometryOversize: 0.01,
    },
  },

  physics: {
    maxDelta: 0.1,
    collisionNudge: 0.01,
    paddleVelocityTransfer: 0.5,
    spinDecayOnHit: 0.5,
  },

  ball: {
    radius: 0.3,
    startVelocityX: 12,
    startVelocityZ: 10,
    maxXVelocity: 28,
    maxZVelocity: 14,
    maxSpin: 20,
    deflectionBoost: 3,
    swipeSpinFactor: 0.6,
    spinFriction: 0.1,
    gravity: 18,
    serveHeight: 2.5,
    paddleHitForceY: 6,
    bounceFriction: 0.8,
  },

  paddle: {
    width: 0.5,
    height: 1.6,
    depth: 2,
    zLimit: 4.0,
    xMin: 0.25,
    xMax: 10.75,
    acceleration: 60,
    friction: 10,
    maxVelocity: 15,
  },

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

  ai: {
    lobBackpedalOffset: 2,
    deadzone: { z: 0.3, x: 0.2 },
    difficulties: {
      easy: {
        reactionDelayMs: 600,
        errorMargin: 1.0,
        mistakeIntervalSec: 2,
        lerpSpeed: 3.0,
      },
      medium: {
        reactionDelayMs: 250,
        errorMargin: 0.2,
        mistakeIntervalSec: 3,
        lerpSpeed: 12.0,
      },
      hard: {
        reactionDelayMs: 0,
        errorMargin: 0.0,
        mistakeIntervalSec: 99,
        lerpSpeed: 25.0,
      },
    },
  },

  difficultyModifiers: {
    easy: { paddleSizeMultiplier: 1.25 },
    medium: { paddleSizeMultiplier: 1.0 },
    hard: { paddleSizeMultiplier: 0.75 },
  },

  paddleVisuals: {
    emissiveIntensity: 0.4,
    roughness: 0.1,
    metalness: 0.5,
    tiltFactor: -1.2,
    skirtExtension: 0.5,
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
    segments: 32,
    visualSpinMultiplier: 5.0,
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
      targetAspect: 2.2,
    },
  },

  camera: {
    position: [0, 17, 13] as [number, number, number],
    fov: 35,
    controls: {
      enablePan: false,
      maxPolarAngle: 1.52,
      minDistance: 10,
      maxDistance: 45,
      flipAzimuthThreshold: Math.PI / 2,
      mouseButtons: { left: 0, middle: 1, right: 2 },
    },
  },

  matchHistory: {
    localPlayer2Id: "local-player-2",
    aiPrefix: "ai-",
    currentPlayer2: "",
  },
};
