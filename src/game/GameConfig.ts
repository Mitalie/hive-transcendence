export const GameConfig = {
  // --- COURT BOUNDARIES ---
  // Anssi: Ensure your 3D arena model scales to match these limits.
  court: {
    width: 22,
    depth: 11,
    zLimit: 5, // Top and bottom walls
    xLimit: 11, // The score lines behind the paddles
    wallHeight: 2.0,
  },

  // --- PADDLE SETTINGS ---
  paddle: {
    width: 0.5,
    height: 2.0,
    depth: 2,
    zLimit: 4,
    // --- PADDLE MOMENTUM ---
    acceleration: 60, // How fast the paddle speeds up when holding W/S
    friction: 10, // How fast it slides to a stop when you let go
    maxVelocity: 15, // The absolute top speed of a "full wind-up" swipe
  },

  // --- PLAYER STARTING POSITIONS ---
  player1: { xPos: -8 }, // Blue (Left)
  player2: { xPos: 8 }, // Red (Right)

  // --- BALL SETTINGS ---
  ball: {
    radius: 0.3,
    startVelocityX: 6,
    startVelocityZ: 5,
    deflectionBoost: 3,
    maxZVelocity: 11,

    // --- THE MAGNUS EFFECT ---
    swipeSpinFactor: 0.6, // Acceleration
    spinFriction: 0.1, // Spin airtime

    // --- 3D GRAVITY ---
    gravity: 18, // Downward pull on the Y-axis
    serveHeight: 2.5, // Height the ball drops from on a serve
    paddleHitForceY: 6, // The upward "pop" when the paddle hits the ball
    bounceFriction: 0.8, // Retains % of its bounce height when hitting the table
  },

  // --- CAMERA SETTINGS ---
  // The 'as [number, number, number]' tells TypeScript this array will
  // ALWAYS have exactly 3 elements, satisfying React Three Fiber's strict types.
  camera: {
    position: [0, 17, 13] as [number, number, number],
    fov: 35,
  },

  // --- MATCH RULES ---
  // Dimi: These dictate when a match is officially recorded to the database.
  rules: {
    winLimit: 11, // Points required to win (Ping Pong standard)
    winByTwo: true, // Enable deuce/overtime rules
    serveDelay: 420, // Milliseconds the ball waits in the center before serving
  },
};
