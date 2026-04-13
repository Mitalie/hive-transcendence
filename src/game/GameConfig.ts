export const GameConfig = {
  // --- PLAYER COLORS ---
  colors: {
    p1: "#0066ff",
    p2: "#ff3333",
  },

  // --- COURT BOUNDARIES & DIMENSIONS ---
  court: {
    width: 22,
    depth: 11,
    zLimit: 5, // The glass wall is here
    xLimit: 11,
    wallHeight: 2.0,
    floorHeight: 5.0,
    // --- RENDER SPECS ---
    // Standardized dimensions for arena decorative elements.
    wallThickness: 0.5,
    bezelInset: 0.1,
    bezelHeight: 0.01,
    netWidth: 0.15,
    frameThickness: 0.02,
    scoreboardHeightOffset: 0.3,
  },

  // --- ARENA VISUALS & THEME ---
  arena: {
    floorColor: "#2d2d3d",
    bezelColor: "#88889a",
    netColor: "#ffffff",
    netOpacity: 0.3,
    glassColor: "#ffffff",
    glassOpacity: 0.08,
    frameColor: "#ffffff",
    frameOpacity: 0.5,
    fontUrl: "/fonts/helvetiker_bold.typeface.json",
    // --- Z-FIGHTING OFFSETS ---
    // These micro-adjustments prevent "Moiré" flickering and texture bleeding by
    // ensuring no two surfaces occupy the exact same floating-point coordinate.
    offsets: {
      floor: -0.01,
      bezel: -0.005,
      net: 0.001,
      scoreboardDepth: 0.01,
    },
  },

  // --- PADDLE SETTINGS ---
  paddle: {
    width: 0.5,
    height: 1.6,
    depth: 2, // Half of this is 1.0
    zLimit: 4.0, // Center stops at 4.0. Tip reaches 5.0 and touches the glass perfectly.
    xMin: 0.25,
    xMax: 10.75,
    acceleration: 60,
    friction: 10,
    maxVelocity: 15,
  },

  // --- PADDLE VISUALS ---
  paddleVisuals: {
    emissiveIntensity: 0.4,
    roughness: 0.1,
    metalness: 0.5,
    tiltFactor: -0.02, // Visual lean intensity
    skirtExtension: 0.5, // Extra height to hide the gap when tilting
    fpsBase: 60, // Standardizes delta-based movement to a 60fps baseline
  },

  // --- PLAYER STARTING POSITIONS ---
  player1: { xPos: -8 },
  player2: { xPos: 8 },

  // --- BALL PHYSICS ---
  ball: {
    radius: 0.3,
    startVelocityX: 6,
    startVelocityZ: 5,
    deflectionBoost: 3,
    maxZVelocity: 11,
    swipeSpinFactor: 0.6,
    spinFriction: 0.1,
    gravity: 18,
    serveHeight: 2.5,
    paddleHitForceY: 6,
    bounceFriction: 0.8,
  },

  // --- BALL VISUALS ---
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

  // --- CAMERA SETTINGS ---
  camera: {
    position: [0, 17, 13] as [number, number, number],
    fov: 35,
  },

  // --- MATCH RULES ---
  rules: {
    winLimit: 11,
    winByTwo: true,
    serveDelay: 420,
  },
};
