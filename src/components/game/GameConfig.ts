export const GameConfig = {
  // --- COURT BOUNDARIES ---
  // Anssi: Ensure your 3D arena model scales to match these limits.
  court: {
    width: 22,
    depth: 11,
    zLimit: 5, // Top and bottom invisible walls
    xLimit: 11, // The score lines behind the paddles
  },

  // --- PADDLE SETTINGS ---
  paddle: {
    width: 0.5,
    height: 0.5,
    depth: 2, // The "length" of the paddle
    speed: 9,
    zLimit: 4, // Clamps the paddle so it can't move through the side walls
  },

  // --- PLAYER STARTING POSITIONS ---
  player1: { xPos: -8 }, // Blue (Left)
  player2: { xPos: 8 }, // Red (Right)

  // --- BALL SETTINGS ---
  ball: {
    radius: 0.3,
    startVelocityX: 6,
    startVelocityZ: 5,
    deflectionBoost: 3, // Additive spin per second
    maxZVelocity: 11, // Max Z speed per second
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
