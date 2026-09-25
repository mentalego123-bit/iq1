import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { soundManager } from '../utils/audio';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Play,
  RotateCcw,
  Zap,
  Sparkles,
  Trophy,
  Coins,
  Shield,
  Magnet,
  Flame,
  HelpCircle
} from 'lucide-react';

interface LogicRunner3DProps {
  onEarnTickets: (tickets: number) => void;
  onBack: () => void;
}

interface RunnerQuestion {
  question: string;
  leftAnswer: string;
  rightAnswer: string;
  correctLane: -1 | 1;
}

const RUNNER_QUESTIONS: RunnerQuestion[] = [
  { question: '12 × 4 = ?', leftAnswer: '48', rightAnswer: '44', correctLane: -1 },
  { question: '100 - 37 = ?', leftAnswer: '73', rightAnswer: '63', correctLane: 1 },
  { question: '5² + 12² = ?', leftAnswer: '169', rightAnswer: '144', correctLane: -1 },
  { question: '3, 6, 12, 24, ?', leftAnswer: '36', rightAnswer: '48', correctLane: 1 },
  { question: 'Kvadrat perimetri 36 bo\'lsa, tomoni?', leftAnswer: '9', rightAnswer: '6', correctLane: -1 },
  { question: '7 × 8 + 4 = ?', leftAnswer: '60', rightAnswer: '56', correctLane: -1 },
  { question: '2, 3, 5, 7, 11, ?', leftAnswer: '12', rightAnswer: '13', correctLane: 1 },
  { question: '15% dan 200 = ?', leftAnswer: '30', rightAnswer: '25', correctLane: -1 },
  { question: 'Kubning nechta qirrasi bor?', leftAnswer: '8', rightAnswer: '12', correctLane: 1 },
];

const TRACK_LANES = [-2.4, 0, 2.4] as const;

// ==============================================================
// CUSTOM SHADER MATERIALS FOR INTENSE NEON CYBER PARTICLES
// ==============================================================
const NeonParticleVertexShader = `
  uniform float uTime;
  uniform float uSpeed;
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;
    vec3 pos = position;
    
    // Wave motion along Z axis
    pos.x += sin(uTime * 4.0 + pos.z * 0.1) * 0.15;
    pos.y += cos(uTime * 3.0 + pos.z * 0.15) * 0.12;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Dynamic point sizing based on distance and speed
    gl_PointSize = (aSize * (1.0 + uSpeed * 0.6)) * (180.0 / -mvPosition.z);
    
    // Distance alpha falloff
    vAlpha = smoothstep(120.0, 10.0, -pos.z);
  }
`;

const NeonParticleFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // High-fidelity radial neon bloom
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;

    // Glowing core with intense outer aura
    float core = smoothstep(0.18, 0.0, dist);
    float halo = smoothstep(0.5, 0.0, dist) * 0.7;
    float intensity = core * 1.5 + halo;

    vec3 finalColor = vColor * intensity;
    gl_FragColor = vec4(finalColor, vAlpha * (halo + core));
  }
`;

// ==============================================================
// 1. NEON SHADER PARTICLES COMPONENT (WARP TUNNEL & EXHAUST)
// ==============================================================
interface ShaderTunnelProps {
  speedRef: React.MutableRefObject<number>;
  isPlaying: boolean;
}

const NeonShaderTunnel: React.FC<ShaderTunnelProps> = ({ speedRef, isPlaying }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 350;

  const [geo, material] = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const palette = [
      new THREE.Color(0x00d2ff), // Electric Cyan
      new THREE.Color(0x38bdf8), // Glowing Sky Blue
      new THREE.Color(0xfbbf24), // Gold Neon
      new THREE.Color(0xec4899), // Cyber Pink
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = Math.random() * 11 + 0.3;
      positions[i * 3 + 2] = -Math.random() * 130;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      sizes[i] = Math.random() * 1.6 + 0.6;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: NeonParticleVertexShader,
      fragmentShader: NeonParticleFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 0.38 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return [geometry, mat];
  }, []);

  useFrame((_, delta) => {
    if (!material) return;
    material.uniforms.uTime.value += delta;
    material.uniforms.uSpeed.value = speedRef.current;

    if (pointsRef.current && isPlaying) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      const speed = speedRef.current * 2.8;

      for (let i = 2; i < positions.length; i += 3) {
        positions[i] += speed;
        if (positions[i] > 10) {
          positions[i] = -125 - Math.random() * 15;
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return <points ref={pointsRef} geometry={geo} material={material} />;
};

// ==============================================================
// 2. SUBWAY SCENE INTERIOR (TRACKS, SKYLINE, OBSTACLES, PLAYER)
// ==============================================================
interface GameLoopProps {
  isPlaying: boolean;
  gameOver: boolean;
  currentLane: -1 | 0 | 1;
  isJumping: boolean;
  isSliding: boolean;
  hasShield: boolean;
  hasMagnet: boolean;
  speedRef: React.MutableRefObject<number>;
  onCoinCollect: (count: number) => void;
  onDistanceUpdate: (meters: number) => void;
  onCrash: () => void;
  onShieldConsumed: () => void;
  onMagnetCollect: () => void;
  onShieldCollect: () => void;
  onGateTrigger: (q: RunnerQuestion) => void;
  onGateResolved: (correct: boolean) => void;
}

interface ObstacleData {
  id: number;
  lane: number;
  type: 'train' | 'low' | 'high' | 'barrier';
  z: number;
  passed: boolean;
}

interface CoinData {
  id: number;
  lane: number;
  z: number;
  y: number;
  collected: boolean;
}

interface PowerupData {
  id: number;
  lane: number;
  z: number;
  type: 'magnet' | 'shield';
  collected: boolean;
}

const SubwayScene: React.FC<GameLoopProps> = ({
  isPlaying,
  gameOver,
  currentLane,
  isJumping,
  isSliding,
  hasShield,
  hasMagnet,
  speedRef,
  onCoinCollect,
  onDistanceUpdate,
  onCrash,
  onShieldConsumed,
  onMagnetCollect,
  onShieldCollect,
  onGateTrigger,
  onGateResolved,
}) => {
  const { camera } = useThree();

  // Internal physics refs
  const playerXRef = useRef(0);
  const playerYRef = useRef(0);
  const jumpVelocityRef = useRef(0);
  const playerScaleYRef = useRef(1);
  const distanceRef = useRef(0);
  const nextGateDistanceRef = useRef(35);
  const activeGateQRef = useRef<RunnerQuestion | null>(null);
  const cameraShakeRef = useRef(0);

  // Character group ref
  const playerGroupRef = useRef<THREE.Group>(null);
  const boardRef = useRef<THREE.Mesh>(null);
  const thrustersRef = useRef<THREE.Points>(null);

  // Entities state
  const [obstacles, setObstacles] = useState<ObstacleData[]>(() => {
    const types: ('train' | 'low' | 'high' | 'barrier')[] = ['low', 'high', 'train', 'barrier'];
    return Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      lane: TRACK_LANES[Math.floor(Math.random() * TRACK_LANES.length)],
      type: types[i % types.length],
      z: -25 - i * 18,
      passed: false,
    }));
  });

  const [coins, setCoins] = useState<CoinData[]>(() => {
    return Array.from({ length: 26 }, (_, i) => ({
      id: i + 1,
      lane: TRACK_LANES[Math.floor(Math.random() * TRACK_LANES.length)],
      z: -12 - i * 5.8,
      y: Math.random() > 0.75 ? 1.65 : 0.65,
      collected: false,
    }));
  });

  const [powerups, setPowerups] = useState<PowerupData[]>([
    { id: 1, lane: 0, z: -55, type: 'magnet', collected: false },
    { id: 2, lane: 2.4, z: -115, type: 'shield', collected: false },
  ]);

  // Overhead Metro Arches data
  const metroArches = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => -i * 18);
  }, []);

  // Cyber Skyline Buildings
  const buildings = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => {
      const height = 24 + Math.random() * 20;
      const side = i % 2 === 0 ? -1 : 1;
      return {
        id: i,
        x: side * (10 + Math.random() * 6),
        z: -i * 12,
        height,
        color: i % 2 === 0 ? '#00d2ff' : '#ec4899',
      };
    });
  }, []);

  // Jump trigger listener
  useEffect(() => {
    if (isJumping && playerYRef.current <= 0.05) {
      jumpVelocityRef.current = 0.54;
    }
  }, [isJumping]);

  // Main 4D Physics & Game Loop inside R3F
  useFrame((state, delta) => {
    if (!isPlaying || gameOver) return;

    // 1. Distance & Progressive Speed Acceleration
    distanceRef.current += speedRef.current;
    onDistanceUpdate(Math.floor(distanceRef.current));
    speedRef.current = 0.38 + Math.min(0.34, distanceRef.current * 0.0006);

    const speed = speedRef.current;
    const targetX = currentLane * 2.4;

    // 2. Smooth Spring Lateral Lane Interpolation (Subway Feel)
    playerXRef.current = THREE.MathUtils.lerp(playerXRef.current, targetX, 0.22);

    // 3. Jump Arc Physics
    if (jumpVelocityRef.current > 0 || playerYRef.current > 0) {
      playerYRef.current += jumpVelocityRef.current;
      jumpVelocityRef.current -= 0.046; // Gravity
      if (playerYRef.current <= 0) {
        playerYRef.current = 0;
        jumpVelocityRef.current = 0;
      }
    }

    // 4. Slide Squashing
    if (isSliding) {
      playerScaleYRef.current = THREE.MathUtils.lerp(playerScaleYRef.current, 0.42, 0.35);
      // Fast-drop if mid-air
      if (playerYRef.current > 0.1) {
        playerYRef.current = 0;
        jumpVelocityRef.current = 0;
      }
    } else {
      playerScaleYRef.current = THREE.MathUtils.lerp(playerScaleYRef.current, 1.0, 0.2);
    }

    // 5. Update Player Character Transform & Dynamic Banking
    if (playerGroupRef.current) {
      playerGroupRef.current.position.x = playerXRef.current;
      playerGroupRef.current.position.y = playerYRef.current;
      playerGroupRef.current.scale.y = playerScaleYRef.current;

      // Banking & Hoverboard Tilt
      const rollAngle = (targetX - playerXRef.current) * -0.28;
      playerGroupRef.current.rotation.z = THREE.MathUtils.lerp(playerGroupRef.current.rotation.z, rollAngle, 0.2);
      playerGroupRef.current.rotation.y = THREE.MathUtils.lerp(playerGroupRef.current.rotation.y, rollAngle * 0.5, 0.15);

      if (boardRef.current) {
        boardRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 9.0) * 0.05;
      }
    }

    // 6. 4D Perspective Dynamic Camera Following with Speed FOV Warp
    let shake = (Math.random() - 0.5) * cameraShakeRef.current;
    cameraShakeRef.current = Math.max(0, cameraShakeRef.current - 0.04);

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX * 0.35 + shake, 0.14);
    camera.position.y = 3.3 + playerYRef.current * 0.38 + shake;
    camera.position.z = 6.2;

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, 68 + (speed - 0.38) * 40, 0.06);
      camera.updateProjectionMatrix();
    }

    // 7. Update Thruster Particle Stream
    if (thrustersRef.current) {
      const tPos = thrustersRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < tPos.length; i += 3) {
        tPos[i] = playerXRef.current + (Math.random() - 0.5) * 0.35;
        tPos[i + 1] = playerYRef.current + 0.18 + (Math.random() - 0.5) * 0.1;
        tPos[i + 2] -= 0.16;
        if (tPos[i + 2] < -2.2) {
          tPos[i + 2] = -0.4;
        }
      }
      thrustersRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // 8. Move Obstacles & Check Collisions
    setObstacles((prev) =>
      prev.map((obs) => {
        let nextZ = obs.z + speed;
        if (obs.type === 'train') {
          nextZ += speed * 0.4; // Oncoming fast train!
        }

        const zDiff = Math.abs(nextZ - 0);
        const xDiff = Math.abs(obs.lane - playerXRef.current);

        // Check Collision Hitbox
        if (zDiff < 0.85 && xDiff < 0.95 && !obs.passed) {
          let collided = false;

          if (obs.type === 'low') {
            // Must Jump
            if (playerYRef.current < 0.6) {
              collided = true;
            }
          } else if (obs.type === 'high') {
            // Must Slide
            if (!isSliding && playerYRef.current > 0.25) {
              collided = true;
            }
          } else {
            // Solid Train or Barrier
            collided = true;
          }

          if (collided) {
            if (hasShield) {
              cameraShakeRef.current = 0.5;
              soundManager.playSuccessChime();
              onShieldConsumed();
              return { ...obs, passed: true, z: nextZ };
            } else {
              cameraShakeRef.current = 0.9;
              soundManager.playErrorBuzz();
              onCrash();
              return { ...obs, passed: true, z: nextZ };
            }
          } else {
            return { ...obs, passed: true, z: nextZ };
          }
        }

        // Recycle Obstacle Ahead
        if (nextZ > 10) {
          const newLane = TRACK_LANES[Math.floor(Math.random() * TRACK_LANES.length)];
          return {
            ...obs,
            lane: newLane,
            z: -110 - Math.random() * 25,
            passed: false,
          };
        }

        return { ...obs, z: nextZ };
      })
    );

    // 9. Move Coins & Magnetic Attraction
    setCoins((prev) =>
      prev.map((c) => {
        let nextZ = c.z + speed;
        let nextLane = c.lane;
        let nextY = c.y;

        // Magnet Pull
        if (hasMagnet && Math.abs(nextZ - 0) < 18) {
          nextLane = THREE.MathUtils.lerp(nextLane, playerXRef.current, 0.2);
          nextY = THREE.MathUtils.lerp(nextY, playerYRef.current + 0.6, 0.2);
        }

        // Pickup detection
        const dist = Math.sqrt(
          Math.pow(nextLane - playerXRef.current, 2) +
            Math.pow(nextY - (playerYRef.current + 0.5), 2) +
            Math.pow(nextZ - 0, 2)
        );

        if (dist < 1.35 && !c.collected) {
          soundManager.playSuccessChime();
          onCoinCollect(1);
          return { ...c, collected: true, z: nextZ, lane: nextLane, y: nextY };
        }

        // Recycle Coin
        if (nextZ > 8) {
          const freshLane = TRACK_LANES[Math.floor(Math.random() * TRACK_LANES.length)];
          return {
            ...c,
            lane: freshLane,
            z: -100 - Math.random() * 30,
            y: Math.random() > 0.75 ? 1.65 : 0.65,
            collected: false,
          };
        }

        return { ...c, z: nextZ, lane: nextLane, y: nextY };
      })
    );

    // 10. Move Powerups
    setPowerups((prev) =>
      prev.map((p) => {
        const nextZ = p.z + speed;
        const dist = Math.sqrt(
          Math.pow(p.lane - playerXRef.current, 2) + Math.pow(nextZ - 0, 2)
        );

        if (dist < 1.4 && !p.collected) {
          soundManager.playVictoryFanfare();
          if (p.type === 'magnet') onMagnetCollect();
          if (p.type === 'shield') onShieldCollect();
          return { ...p, collected: true, z: nextZ };
        }

        if (nextZ > 8) {
          return {
            ...p,
            lane: TRACK_LANES[Math.floor(Math.random() * TRACK_LANES.length)],
            z: -120 - Math.random() * 50,
            collected: false,
          };
        }

        return { ...p, z: nextZ };
      })
    );

    // 11. Logic Gate Question Checking
    if (distanceRef.current >= nextGateDistanceRef.current && !activeGateQRef.current) {
      const q = RUNNER_QUESTIONS[Math.floor(Math.random() * RUNNER_QUESTIONS.length)];
      activeGateQRef.current = q;
      onGateTrigger(q);
      soundManager.playCyberClick();
    }

    if (activeGateQRef.current && distanceRef.current >= nextGateDistanceRef.current + 16) {
      const isCorrect =
        (activeGateQRef.current.correctLane === -1 && currentLane <= -1) ||
        (activeGateQRef.current.correctLane === 1 && currentLane >= 1);

      onGateResolved(isCorrect);
      activeGateQRef.current = null;
      nextGateDistanceRef.current = distanceRef.current + 42;
    }
  });

  return (
    <>
      {/* Dynamic Lighting */}
      <ambientLight intensity={0.8} color="#38bdf8" />
      <directionalLight position={[8, 22, 12]} intensity={2.2} color="#00d2ff" />
      <pointLight position={[0, 4, -8]} intensity={3} distance={35} color="#fbbf24" />

      {/* Track Bed */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -80]}>
        <planeGeometry args={[10, 180]} />
        <meshStandardMaterial color="#080d1a" roughness={0.4} metalness={0.85} />
      </mesh>

      {/* Glowing Neon Subway Rails */}
      {TRACK_LANES.map((laneX) => (
        <group key={laneX}>
          {/* Left Rail */}
          <mesh position={[laneX - 0.55, 0.06, -80]}>
            <boxGeometry args={[0.1, 0.12, 180]} />
            <meshStandardMaterial
              color="#00d2ff"
              emissive="#00d2ff"
              emissiveIntensity={0.85}
              metalness={0.9}
            />
          </mesh>
          {/* Right Rail */}
          <mesh position={[laneX + 0.55, 0.06, -80]}>
            <boxGeometry args={[0.1, 0.12, 180]} />
            <meshStandardMaterial
              color="#00d2ff"
              emissive="#00d2ff"
              emissiveIntensity={0.85}
              metalness={0.9}
            />
          </mesh>
        </group>
      ))}

      {/* Overhead Metro Arches */}
      {metroArches.map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh position={[-5.4, 3.5, 0]}>
            <boxGeometry args={[0.3, 7, 0.3]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          <mesh position={[5.4, 3.5, 0]}>
            <boxGeometry args={[0.3, 7, 0.3]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          <mesh position={[0, 6.9, 0]}>
            <boxGeometry args={[11.1, 0.35, 0.35]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>
      ))}

      {/* Cyberpunk Skyscrapers */}
      {buildings.map((b) => (
        <group key={b.id} position={[b.x, 0, b.z]}>
          <mesh position={[0, b.height / 2, 0]}>
            <boxGeometry args={[6, b.height, 8]} />
            <meshStandardMaterial color="#070b15" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[3.05, b.height * 0.45, 0]}>
            <boxGeometry args={[0.1, b.height * 0.7, 0.1]} />
            <meshBasicMaterial color={b.color} />
          </mesh>
        </group>
      ))}

      {/* Dynamic Obstacles */}
      {obstacles.map((obs) => (
        <group key={obs.id} position={[obs.lane, 0, obs.z]}>
          {obs.type === 'train' && (
            <group>
              {/* Subway Train Car */}
              <mesh position={[0, 1.25, 0]}>
                <boxGeometry args={[1.8, 2.5, 7.5]} />
                <meshStandardMaterial
                  color="#0f172a"
                  emissive="#0284c7"
                  emissiveIntensity={0.3}
                  metalness={0.9}
                  roughness={0.2}
                />
              </mesh>
              {/* Headlights */}
              <mesh position={[-0.6, 0.8, 3.8]}>
                <sphereGeometry args={[0.2, 8, 8]} />
                <meshBasicMaterial color="#fbbf24" />
              </mesh>
              <mesh position={[0.6, 0.8, 3.8]}>
                <sphereGeometry args={[0.2, 8, 8]} />
                <meshBasicMaterial color="#fbbf24" />
              </mesh>
              {/* Neon Side Stripe */}
              <mesh position={[0, 1.6, 0]}>
                <boxGeometry args={[1.82, 0.15, 7.4]} />
                <meshBasicMaterial color="#00d2ff" />
              </mesh>
            </group>
          )}

          {obs.type === 'low' && (
            <group>
              {/* Low Hurdle - Jump */}
              <mesh position={[0, 0.25, 0]}>
                <boxGeometry args={[1.7, 0.48, 0.35]} />
                <meshStandardMaterial color="#f59e0b" emissive="#d97706" metalness={0.6} />
              </mesh>
              <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[1.6, 0.08, 0.1]} />
                <meshBasicMaterial color="#fef08a" />
              </mesh>
            </group>
          )}

          {obs.type === 'high' && (
            <group>
              {/* High Beam - Slide under */}
              <mesh position={[-0.88, 1.15, 0]}>
                <cylinderGeometry args={[0.06, 0.06, 2.3, 8]} />
                <meshStandardMaterial color="#475569" />
              </mesh>
              <mesh position={[0.88, 1.15, 0]}>
                <cylinderGeometry args={[0.06, 0.06, 2.3, 8]} />
                <meshStandardMaterial color="#475569" />
              </mesh>
              <mesh position={[0, 1.75, 0]}>
                <boxGeometry args={[1.85, 0.4, 0.3]} />
                <meshBasicMaterial color="#f43f5e" />
              </mesh>
            </group>
          )}

          {obs.type === 'barrier' && (
            <group>
              {/* Solid Concrete Barrier */}
              <mesh position={[0, 0.9, 0]}>
                <boxGeometry args={[1.8, 1.8, 0.6]} />
                <meshStandardMaterial color="#dc2626" emissive="#7f1d1d" roughness={0.3} />
              </mesh>
              <mesh position={[0, 1.0, 0]}>
                <boxGeometry args={[1.82, 0.3, 0.62]} />
                <meshBasicMaterial color="#fbbf24" />
              </mesh>
            </group>
          )}
        </group>
      ))}

      {/* Rotating Gold Coins */}
      {coins.map(
        (c) =>
          !c.collected && (
            <mesh
              key={c.id}
              position={[c.lane, c.y, c.z]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.26, 0.26, 0.08, 16]} />
              <meshStandardMaterial
                color="#fbbf24"
                emissive="#f59e0b"
                emissiveIntensity={0.65}
                metalness={0.95}
                roughness={0.1}
              />
            </mesh>
          )
      )}

      {/* Powerups (Magnet & Shield) */}
      {powerups.map(
        (p) =>
          !p.collected && (
            <group key={p.id} position={[p.lane, 1.0, p.z]}>
              <mesh>
                <octahedronGeometry args={[0.38, 0]} />
                <meshBasicMaterial
                  color={p.type === 'magnet' ? '#ef4444' : '#06b6d4'}
                  wireframe
                />
              </mesh>
            </group>
          )
      )}

      {/* Player Cyber Character */}
      <group ref={playerGroupRef} position={[0, 0, 0]}>
        {/* Torso */}
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.32, 0.22, 0.85, 16]} />
          <meshStandardMaterial
            color="#0ea5e9"
            emissive="#0284c7"
            emissiveIntensity={0.4}
            metalness={0.9}
            roughness={0.15}
          />
        </mesh>

        {/* Chest Arc Reactor Core */}
        <mesh position={[0, 0.95, 0.26]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>

        {/* Head */}
        <mesh position={[0, 1.48, 0]}>
          <sphereGeometry args={[0.25, 20, 20]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Cyber Visor */}
        <mesh position={[0, 1.48, 0.16]}>
          <boxGeometry args={[0.34, 0.12, 0.2]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>

        {/* Crown on top */}
        <mesh position={[0, 1.82, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.16, 0.18, 5]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>

        {/* Hoverboard */}
        <mesh ref={boardRef} position={[0, 0.22, 0]}>
          <boxGeometry args={[0.8, 0.1, 1.6]} />
          <meshStandardMaterial
            color="#ec4899"
            emissive="#db2777"
            emissiveIntensity={0.8}
            metalness={0.8}
            roughness={0.1}
          />
        </mesh>

        {/* Twin Thruster Jets */}
        <mesh position={[-0.28, 0.15, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.15, 0.35, 12]} />
          <meshBasicMaterial color="#00f2fe" />
        </mesh>
        <mesh position={[0.28, 0.15, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.15, 0.35, 12]} />
          <meshBasicMaterial color="#00f2fe" />
        </mesh>

        {/* Shield Sphere */}
        {hasShield && (
          <mesh position={[0, 1.0, 0]}>
            <sphereGeometry args={[1.2, 16, 16]} />
            <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.4} />
          </mesh>
        )}
      </group>

      {/* Thruster Jet Exhaust Particle Stream */}
      <points ref={thrustersRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(
                Array.from({ length: 45 * 3 }, (_, i) =>
                  i % 3 === 2 ? -Math.random() * 1.5 : (Math.random() - 0.5) * 0.3
                )
              ),
              3,
            ]}
          />
        </bufferGeometry>
        <pointsMaterial color="#38bdf8" size={0.18} transparent opacity={0.9} />
      </points>

      {/* Neon Shader Particles Warp Tunnel */}
      <NeonShaderTunnel speedRef={speedRef} isPlaying={isPlaying} />
    </>
  );
};

// ==============================================================
// 3. MAIN EXPORTED COMPONENT WITH TOUCH CONTROLS & HUD
// ==============================================================
export const LogicRunner3D: React.FC<LogicRunner3DProps> = ({ onEarnTickets, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [currentLane, setCurrentLane] = useState<-1 | 0 | 1>(0);
  const [isJumping, setIsJumping] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [hasShield, setHasShield] = useState(false);
  const [hasMagnet, setHasMagnet] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<RunnerQuestion | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [swipeIndicator, setSwipeIndicator] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null>(null);

  const speedRef = useRef(0.38);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Gesture Controls: Lane Switching
  const changeLane = useCallback(
    (dir: -1 | 1) => {
      if (!isPlaying || gameOver) return;
      soundManager.playCyberClick();
      setCurrentLane((prev) => {
        const next = Math.max(-1, Math.min(1, prev + dir)) as -1 | 0 | 1;
        return next;
      });
      setSwipeIndicator(dir === 1 ? 'RIGHT' : 'LEFT');
      setTimeout(() => setSwipeIndicator(null), 300);
    },
    [isPlaying, gameOver]
  );

  // Gesture Controls: Jumping
  const handleJump = useCallback(() => {
    if (!isPlaying || gameOver) return;
    if (!isJumping) {
      soundManager.playCyberClick();
      setIsJumping(true);
      setIsSliding(false);
      setSwipeIndicator('UP');
      setTimeout(() => setSwipeIndicator(null), 300);
      setTimeout(() => setIsJumping(false), 650);
    }
  }, [isPlaying, gameOver, isJumping]);

  // Gesture Controls: Sliding
  const handleSlide = useCallback(() => {
    if (!isPlaying || gameOver) return;
    if (!isSliding) {
      soundManager.playCyberClick();
      setIsSliding(true);
      setIsJumping(false);
      setSwipeIndicator('DOWN');
      setTimeout(() => setSwipeIndicator(null), 300);
      setTimeout(() => setIsSliding(false), 700);
    }
  }, [isPlaying, gameOver, isSliding]);

  // Touch Swipe Handlers (Sensitivity: 16px)
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const diffX = touch.clientX - touchStartRef.current.x;
    const diffY = touch.clientY - touchStartRef.current.y;
    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);

    if (Math.max(absX, absY) > 16) {
      if (absX > absY) {
        if (diffX > 0) changeLane(1);
        else changeLane(-1);
      } else {
        if (diffY < 0) handleJump();
        else handleSlide();
      }
    }
    touchStartRef.current = null;
  };

  // Keyboard Controls (W/A/S/D and Arrow Keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        changeLane(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        changeLane(1);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        e.preventDefault();
        handleJump();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeLane, handleJump, handleSlide]);

  const handleStartGame = () => {
    soundManager.playCyberClick();
    setScore(0);
    setCoinsCollected(0);
    setDistanceMeters(0);
    setGameOver(false);
    setCurrentLane(0);
    setHasShield(false);
    setHasMagnet(false);
    setCurrentQuestion(null);
    speedRef.current = 0.38;
    setIsPlaying(true);
  };

  const handleFinishGameOver = () => {
    soundManager.playVictoryFanfare();
    if (score >= 250 || distanceMeters >= 300) {
      onEarnTickets(3);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-2 sm:p-4 space-y-3 animate-fade-in select-none">
      {/* Top HUD Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1 active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>O'yinlar</span>
        </button>

        <div className="text-center">
          <h2 className="text-sm sm:text-base font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300 flex items-center justify-center gap-1.5 filter drop-shadow(0 0 10px rgba(0,210,255,0.4))">
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>SUBWAY 4D KIBER RUNNER (R3F)</span>
          </h2>
          <div className="text-[10px] font-mono text-cyan-300 flex items-center justify-center gap-2">
            <span>{distanceMeters} m</span>
            <span>•</span>
            <span className="text-amber-400">Tezlik x{(speedRef.current / 0.38).toFixed(1)}</span>
          </div>
        </div>

        {/* Coins & Score HUD */}
        <div className="flex items-center gap-2">
          {hasMagnet && (
            <div className="p-1 rounded-lg bg-rose-500/20 border border-rose-400 text-rose-300 text-[10px] font-mono flex items-center gap-1 animate-pulse">
              <Magnet className="w-3.5 h-3.5" />
            </div>
          )}
          {hasShield && (
            <div className="p-1 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-[10px] font-mono flex items-center gap-1 animate-pulse">
              <Shield className="w-3.5 h-3.5" />
            </div>
          )}
          <div className="flex items-center gap-1 font-mono text-xs font-bold text-amber-400 bg-amber-400/15 px-2.5 py-1 rounded-xl border border-amber-400/40 shadow-[0_0_10px_rgba(251,191,36,0.2)]">
            <Coins className="w-3.5 h-3.5 fill-current animate-bounce" />
            <span>{coinsCollected}</span>
          </div>
          <div className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950 px-2.5 py-1 rounded-xl border border-cyan-500/40">
            {score}
          </div>
        </div>
      </div>

      {/* R3F 4D Canvas Container with Touch Handlers */}
      <div
        className="relative rounded-3xl overflow-hidden border-2 border-cyan-400/60 shadow-[0_0_35px_rgba(0,210,255,0.25)] bg-[#060913] touch-none select-none h-[380px] sm:h-[440px]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Canvas
          camera={{ position: [0, 3.3, 6.2], fov: 68 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.35 }}
          className="w-full h-full"
        >
          <color attach="background" args={['#060913']} />
          <fogExp2 attach="fog" args={['#060913', 0.018]} />
          <SubwayScene
            isPlaying={isPlaying}
            gameOver={gameOver}
            currentLane={currentLane}
            isJumping={isJumping}
            isSliding={isSliding}
            hasShield={hasShield}
            hasMagnet={hasMagnet}
            speedRef={speedRef}
            onCoinCollect={() => {
              setScore((s) => s + 25);
              setCoinsCollected((c) => c + 1);
            }}
            onDistanceUpdate={setDistanceMeters}
            onCrash={() => {
              setGameOver(true);
              setIsPlaying(false);
            }}
            onShieldConsumed={() => setHasShield(false)}
            onMagnetCollect={() => {
              setHasMagnet(true);
              setTimeout(() => setHasMagnet(false), 10000);
            }}
            onShieldCollect={() => setHasShield(true)}
            onGateTrigger={setCurrentQuestion}
            onGateResolved={(correct) => {
              if (correct) {
                soundManager.playVictoryFanfare();
                setScore((s) => s + 250);
                setCoinsCollected((c) => c + 6);
              } else {
                soundManager.playErrorBuzz();
                setScore((s) => Math.max(0, s - 60));
              }
              setCurrentQuestion(null);
            }}
          />
        </Canvas>

        {/* Swipe Feedback Overlay */}
        {swipeIndicator && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="px-5 py-2.5 rounded-full bg-cyan-500/30 border border-cyan-400 text-white font-mono font-extrabold text-sm backdrop-blur-md shadow-[0_0_20px_#00d2ff] animate-ping">
              {swipeIndicator === 'UP' && '🦘 SAKRASH'}
              {swipeIndicator === 'DOWN' && '⚡ SIRG\'ALISH'}
              {swipeIndicator === 'LEFT' && '⬅️ CHAP'}
              {swipeIndicator === 'RIGHT' && '➡️ O\'NG'}
            </div>
          </div>
        )}

        {/* Live Question Gate Overlay */}
        {currentQuestion && isPlaying && (
          <div className="absolute top-3 left-3 right-3 z-30 p-3 rounded-2xl bg-slate-900/95 border-2 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.4)] backdrop-blur-md text-center animate-bounce">
            <div className="text-[10px] font-mono text-amber-400 tracking-wider font-extrabold flex items-center justify-center gap-1">
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              <span>MANTIQIY DARVOZA — TO'G'RI QATORGA BURILING!</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-white mt-0.5">
              {currentQuestion.question}
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-bold">
              <div
                className={`p-2 rounded-xl border transition-all ${
                  currentLane === -1
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 scale-105 shadow-[0_0_15px_#00d2ff]'
                    : 'bg-slate-950/90 border-slate-700 text-slate-300'
                }`}
              >
                ⬅️ Chap: <span className="text-sm font-mono">{currentQuestion.leftAnswer}</span>
              </div>
              <div
                className={`p-2 rounded-xl border transition-all ${
                  currentLane === 1
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 scale-105 shadow-[0_0_15px_#00d2ff]'
                    : 'bg-slate-950/90 border-slate-700 text-slate-300'
                }`}
              >
                O'ng: <span className="text-sm font-mono">{currentQuestion.rightAnswer}</span> ➡️
              </div>
            </div>
          </div>
        )}

        {/* Pre-Game Start Overlay */}
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-black/85 backdrop-blur-md text-center">
            <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 mb-3 shadow-[0_0_25px_#00d2ff]">
              <Zap className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-xl font-display font-extrabold text-white tracking-wide">
              SUBWAY 4D KIBER RUNNER
            </h3>
            <p className="text-xs text-slate-300 max-w-xs mt-2 leading-relaxed">
              React Three Fiber va Custom Shader Materials asosidagi haqiqiy Subway Surfers tajribasi!
            </p>

            <div className="mt-4 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 max-w-xs space-y-1 text-left">
              <div>🦘 <strong>Sakrash:</strong> Ekranni yuqoriga surish (Swipe Up / W)</div>
              <div>⚡ <strong>Sirg'alish:</strong> Ekranni pastga surish (Swipe Down / S)</div>
              <div>↔️ <strong>Burilish:</strong> Chap yoki O'ng (Swipe Left/Right / A, D)</div>
            </div>

            <button
              onClick={handleStartGame}
              className="mt-5 h-12 px-8 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-slate-950 font-display font-extrabold text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(0,210,255,0.5)] active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Poygani Boshlash</span>
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-black/90 backdrop-blur-md text-center space-y-3">
            <Trophy className="w-14 h-14 text-amber-400 animate-bounce" />
            <h3 className="text-xl font-display font-extrabold text-white">TO'QNAShUV! O'YIN TUGADI</h3>

            <div className="grid grid-cols-2 gap-3 w-full max-w-xs p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <div>
                <div className="text-[10px] text-slate-400">Masofa</div>
                <div className="text-xl font-bold font-mono text-cyan-400">{distanceMeters} m</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Tangalar</div>
                <div className="text-xl font-bold font-mono text-amber-400">{coinsCollected} ta</div>
              </div>
            </div>

            <div className="text-2xl font-mono font-extrabold text-white">
              Jami Ball: <span className="text-amber-400">{score}</span>
            </div>

            {distanceMeters >= 300 && (
              <p className="text-xs text-emerald-400 font-bold">
                🎉 +3 Bilet va "Subway Kiber Runner" nishoni ochildi!
              </p>
            )}

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleStartGame}
                className="h-11 px-5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_#00d2ff] active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Qayta O'ynash</span>
              </button>

              <button
                onClick={handleFinishGameOver}
                className="h-11 px-4 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs"
              >
                Biletlarni Olish
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Touch Action Bar (4 Big Tactile Buttons) */}
      {isPlaying && (
        <div className="space-y-1.5">
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => changeLane(-1)}
              disabled={currentLane === -1}
              className={`h-14 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1 border transition-all active:scale-90 ${
                currentLane === -1
                  ? 'bg-slate-900/50 border-slate-800 text-slate-600'
                  : 'bg-slate-900 border-cyan-500/60 text-cyan-300 hover:bg-slate-800 shadow-[0_0_12px_rgba(0,210,255,0.2)]'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>CHAP</span>
            </button>

            <button
              onClick={handleJump}
              className="h-14 rounded-2xl bg-gradient-to-t from-amber-500/25 to-amber-500/40 border border-amber-400 text-amber-300 font-extrabold text-xs flex flex-col items-center justify-center gap-1 shadow-[0_0_15px_rgba(251,191,36,0.3)] active:scale-90"
            >
              <ArrowUp className="w-5 h-5 animate-pulse" />
              <span>SAKRASH</span>
            </button>

            <button
              onClick={handleSlide}
              className="h-14 rounded-2xl bg-gradient-to-t from-rose-500/25 to-rose-500/40 border border-rose-400 text-rose-300 font-extrabold text-xs flex flex-col items-center justify-center gap-1 shadow-[0_0_15px_rgba(244,63,94,0.3)] active:scale-90"
            >
              <ArrowDown className="w-5 h-5" />
              <span>SIRG'ALISH</span>
            </button>

            <button
              onClick={() => changeLane(1)}
              disabled={currentLane === 1}
              className={`h-14 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1 border transition-all active:scale-90 ${
                currentLane === 1
                  ? 'bg-slate-900/50 border-slate-800 text-slate-600'
                  : 'bg-slate-900 border-cyan-500/60 text-cyan-300 hover:bg-slate-800 shadow-[0_0_12px_rgba(0,210,255,0.2)]'
              }`}
            >
              <ArrowRight className="w-5 h-5" />
              <span>O'NG</span>
            </button>
          </div>

          <div className="text-center text-[10px] text-slate-400 font-mono">
            Ekranda barmoq bilan (Swipe Up / Down / Left / Right) yoki klaviaturada (W, A, S, D) boshqarish mumkin
          </div>
        </div>
      )}
    </div>
  );
};
