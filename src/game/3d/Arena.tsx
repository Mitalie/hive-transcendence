import { GameConfig } from "@/game/GameConfig";

export default function Arena() {
  return (
    <>
      {/* FLOOR */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry
          args={[GameConfig.court.width, 0.1, GameConfig.court.depth]}
        />
        <meshStandardMaterial color="#3a3a50" />
      </mesh>

      {/* TOP WALL */}
      <mesh
        position={[
          0,
          GameConfig.court.wallHeight / 2,
          -(GameConfig.court.zLimit + 0.25),
        ]}
      >
        <boxGeometry
          args={[GameConfig.court.width, GameConfig.court.wallHeight, 0.5]}
        />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* BOTTOM WALL */}
      <mesh
        position={[
          0,
          GameConfig.court.wallHeight / 2,
          GameConfig.court.zLimit + 0.25,
        ]}
      >
        <boxGeometry
          args={[GameConfig.court.width, GameConfig.court.wallHeight, 0.5]}
        />
        <meshStandardMaterial color="white" />
      </mesh>
    </>
  );
}
