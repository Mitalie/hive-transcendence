export const GameConfig = {
  // Court boundaries
  court: {
    width: 22,
    depth: 11,
    zLimit: 5, // Top and bottom walls
    xLimit: 11, // The score lines
  },

  // Paddle settings
  paddle: {
    width: 0.5,
    height: 0.5,
    depth: 2, // How long the paddle is
    speed: 0.15,
    zLimit: 4, // How far up/down the paddle can go before hitting the wall
  },

  // Player starting positions
  player1: { xPos: -8 },
  player2: { xPos: 8 },

  // Ball settings
  ball: {
    radius: 0.3,
    startVelocityX: 0.1,
    startVelocityZ: 0.08,
  },

  // Camera settings (High-Angle Stadium View)
  camera: {
    position: [0, 20, 20],
    fov: 55, // Lower FOV acts like a "Zoom Lens" to keep the court large
  },
};
