import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Text, Sparkles, PerspectiveCamera } from '@react-three/drei';
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
  Trophy,
  Coins,
  Shield,
  Magnet,
  Flame,
  Gauge,
  Sparkle
} from 'lucide-react';

interface LogicRunnerGameProps {
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
  { question: '14 × 5 = ?', leftAnswer: '70', rightAnswer: '65', correctLane: -1 },
  { question: '125 - 47 = ?', leftAnswer: '88', rightAnswer: '78', correctLane: 1 },
  { question: '6² + 8² = ?', leftAnswer: '100', rightAnswer: '96', correctLane: -1 },
  { question: '4, 8, 16, 32, ?', leftAnswer: '48', rightAnswer: '64', correctLane: 1 },
  { question: 'Kvadrat yuzi 81 bo\'lsa, tomoni?', leftAnswer: '9', rightAnswer: '8', correctLane: -1 },
  { question: '9 × 7 + 8 = ?', leftAnswer: '71', rightAnswer: '68', correctLane: -1 },
  { question: '3, 5, 9, 17, ?', leftAnswer: '31', rightAnswer: '33', correctLane: 1 },
  { question: '20% dan 450 = ?', leftAnswer: '90', rightAnswer: '85', correctLane: -1 },
  { question: 'Kubning nechta uchi bor?', leftAnswer: '6', rightAnswer: '8', correctLane: 1 },
];

const TRACK_LANES = [-2.4, 0, 2.4] as const;

// ==============================================================
// 1. CUSTOM SHADER MATERIALS FOR ULTRA NEON CYBERPUNK OBSTACLES
// ==============================================================

// Intense Pulsating Neon Obstacle Shader with 4D vertex micro-displacement
const NeonObstacleVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  uniform float uTime;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec3 pos = position;
    // 4D Cyber displacement ripple
    pos.x += sin(pos.y * 6.0 + uTime * 4.0) * 0.025;
    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const NeonObstacleFragmentShader = `
  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform vec3 uGlowColor;
  uniform float uPulseSpeed;
  uniform float uGlowIntensity;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    // Dynamic animated diagonal warning chevrons
    float chevron = sin((vUv.x * 14.0 + vUv.y * 14.0) - uTime * 7.0);
    float chevronPattern = smoothstep(-0.25, 0.25, chevron);

    // High-frequency cyberpunk holographic scanline pulse
    float scanline = sin(vUv.y * 55.0 - uTime * uPulseSpeed * 5.0) * 0.5 + 0.5;
    
    // 4D Fresnel edge glow for deep perspective volume
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
    fresnel = pow(fresnel, 2.4);

    // Chromatic glitch dispersion burst
    float glitch = step(0.96, sin(uTime * 16.0 + vUv.y * 25.0)) * 0.4;

    vec3 glow = mix(uBaseColor, uGlowColor, chevronPattern * 0.65 + scanline * 0.35);
    glow += vec3(glitch * 0.35, glitch * 0.1, glitch * 0.5);

    // Core white neon filament highlight
    float coreFilament = 1.0 - abs(vUv.x - 0.5) * 2.0;
    coreFilament = pow(clamp(coreFilament, 0.0, 1.0), 6.0);

    vec3 finalColor = glow * (1.3 + fresnel * uGlowIntensity * 2.2) + vec3(coreFilament * 0.85);

    gl_FragColor = vec4(finalColor, 0.96);
  }
`;

// Electric High-Beam Shader for Overhead Obstacles (Slide under)
const HighBeamFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;

  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    // Multi-frequency plasma electricity arcs
    float arc1 = sin(vUv.x * 32.0 + uTime * 18.0) * cos(vUv.y * 18.0 - uTime * 14.0);
    float arc2 = cos(vUv.x * 48.0 - uTime * 26.0) * sin(vUv.y * 28.0 + uTime * 16.0);
    float electric = smoothstep(0.18, 0.88, abs(arc1 + arc2 * 0.5));
    
    // Laser edge falloff
    float edge = 1.0 - abs(vUv.y - 0.5) * 2.0;
    float intensity = pow(edge, 1.8) * 3.0;

    // Blinding white-hot core
    float core = pow(clamp(edge, 0.0, 1.0), 8.0);
    vec3 col = uColor * (1.6 + electric * 2.8) * intensity + vec3(core * 1.6);

    gl_FragColor = vec4(col, 0.95);
  }
`;

// ==============================================================
// 2. SHADER-POWERED NEON OBSTACLE COMPONENT
// ==============================================================
interface ObstacleMeshProps {
  type: 'train' | 'low' | 'high' | 'barrier';
  lane: number;
  z: number;
}

const NeonObstacleMesh: React.FC<ObstacleMeshProps> = ({ type, lane, z }) => {
  const shaderMatRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => {
    // Theme: Oq (White #ffffff), Shaffof Moviy (#00d2ff), To'q Sabzirang (#ea580c / #c2410c)
    let base = new THREE.Color(0xea580c); // To'q sabzirang (Deep carrot orange)
    let glow = new THREE.Color(0xf97316);

    if (type === 'low') {
      base = new THREE.Color(0xea580c); // To'q sabzirang hurdle
      glow = new THREE.Color(0xffffff); // White glow chevrons
    } else if (type === 'train') {
      base = new THREE.Color(0xc2410c); // To'q sabzirang cyber train
      glow = new THREE.Color(0x00d2ff); // Shaffof moviy laser windshield
    } else if (type === 'barrier') {
      base = new THREE.Color(0xea580c); // To'q sabzirang
      glow = new THREE.Color(0xffedd5); // Warm white glow
    }

    return {
      uTime: { value: 0 },
      uBaseColor: { value: base },
      uGlowColor: { value: glow },
      uPulseSpeed: { value: 2.5 },
      uGlowIntensity: { value: 2.0 },
    };
  }, [type]);

  useFrame((state) => {
    if (shaderMatRef.current) {
      shaderMatRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  if (type === 'train') {
    return (
      <group position={[lane, 0, z]}>
        {/* Futuristic Cyber Train Front Body */}
        <mesh position={[0, 1.35, 0]}>
          <boxGeometry args={[1.85, 2.6, 7.8]} />
          <meshStandardMaterial
            color="#090d1a"
            emissive="#0284c7"
            emissiveIntensity={0.35}
            metalness={0.95}
            roughness={0.15}
          />
        </mesh>

        {/* Shader Glow Warning Shield on Train Front */}
        <mesh position={[0, 1.35, 3.92]}>
          <planeGeometry args={[1.75, 2.4]} />
          <shaderMaterial
            ref={shaderMatRef}
            vertexShader={NeonObstacleVertexShader}
            fragmentShader={NeonObstacleFragmentShader}
            uniforms={uniforms}
            transparent
          />
        </mesh>

        {/* Powerful Dual Glowing Headlights */}
        <mesh position={[-0.62, 0.85, 3.95]}>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.62, 0.85, 3.95]}>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    );
  }

  if (type === 'low') {
    return (
      <group position={[lane, 0, z]}>
        {/* Low Hurdle: Must JUMP over */}
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[1.8, 0.52, 0.35]} />
          <shaderMaterial
            ref={shaderMatRef}
            vertexShader={NeonObstacleVertexShader}
            fragmentShader={NeonObstacleFragmentShader}
            uniforms={uniforms}
            transparent
          />
        </mesh>
        <mesh position={[0, 0.56, 0]}>
          <boxGeometry args={[1.82, 0.08, 0.36]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    );
  }

  if (type === 'high') {
    return (
      <group position={[lane, 0, z]}>
        {/* Support Steel Poles */}
        <mesh position={[-0.92, 1.15, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 2.3, 8]} />
          <meshStandardMaterial color="#ffffff" metalness={0.9} />
        </mesh>
        <mesh position={[0.92, 1.15, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 2.3, 8]} />
          <meshStandardMaterial color="#ffffff" metalness={0.9} />
        </mesh>

        {/* High Voltage Plasma Beam: Must SLIDE under (Shaffof moviy + White core) */}
        <mesh position={[0, 1.82, 0]}>
          <boxGeometry args={[1.9, 0.42, 0.28]} />
          <shaderMaterial
            ref={shaderMatRef}
            vertexShader={NeonObstacleVertexShader}
            fragmentShader={HighBeamFragmentShader}
            uniforms={{
              uTime: { value: 0 },
              uColor: { value: new THREE.Color(0x00d2ff) },
            }}
            transparent
          />
        </mesh>
      </group>
    );
  }

  // Barrier: Must switch lane
  return (
    <group position={[lane, 0, z]}>
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[1.8, 1.85, 0.55]} />
        <shaderMaterial
          ref={shaderMatRef}
          vertexShader={NeonObstacleVertexShader}
          fragmentShader={NeonObstacleFragmentShader}
          uniforms={uniforms}
          transparent
        />
      </mesh>
    </group>
  );
};

// ==============================================================
// 3. SUBWAY SCENE ENVIRONMENT & PHYSICS DRIVER
// ==============================================================
interface GameEntitiesState {
  obstacles: { id: number; lane: number; type: 'train' | 'low' | 'high' | 'barrier'; z: number; passed: boolean }[];
  coins: { id: number; lane: number; z: number; y: number; collected: boolean }[];
  powerups: { id: number; lane: number; z: number; type: 'magnet' | 'shield'; collected: boolean }[];
}

interface RunnerSceneProps {
  isPlaying: boolean;
  gameOver: boolean;
  currentLane: -1 | 0 | 1;
  isJumping: boolean;
  isSliding: boolean;
  hasShield: boolean;
  hasMagnet: boolean;
  speedRef: React.MutableRefObject<number>;
  onScoreGain: (pts: number) => void;
  onCoinGain: () => void;
  onDistanceGain: (meters: number) => void;
  onCrash: () => void;
  onShieldAbsorbed: () => void;
  onMagnetGrab: () => void;
  onShieldGrab: () => void;
  onQuestionTrigger: (q: RunnerQuestion) => void;
  onQuestionResolved: (correct: boolean) => void;
}

const RunnerScene: React.FC<RunnerSceneProps> = ({
  isPlaying,
  gameOver,
  currentLane,
  isJumping,
  isSliding,
  hasShield,
  hasMagnet,
  speedRef,
  onScoreGain,
  onCoinGain,
  onDistanceGain,
  onCrash,
  onShieldAbsorbed,
  onMagnetGrab,
  onShieldGrab,
  onQuestionTrigger,
  onQuestionResolved,
}) => {
  const { camera } = useThree();

  // Smooth Player Physics Interpolation
  const playerXRef = useRef(0);
  const playerYRef = useRef(0);
  const laneVelocityRef = useRef(0);
  const jumpVelocityRef = useRef(0);
  const playerScaleYRef = useRef(1);
  const totalDistanceRef = useRef(0);
  const nextGateDistRef = useRef(42);
  const activeGateQRef = useRef<RunnerQuestion | null>(null);
  const cameraShakeRef = useRef(0);

  // Mesh & Particle References
  const characterGroupRef = useRef<THREE.Group>(null);
  const hoverboardRef = useRef<THREE.Mesh>(null);
  const thrustersParticlesRef = useRef<THREE.Points>(null);
  const warpStreaksRef = useRef<THREE.Points>(null);

  // Dynamic Obstacles & Coins Entities
  const [entities, setEntities] = useState<GameEntitiesState>(() => {
    const types: ('train' | 'low' | 'high' | 'barrier')[] = ['low', 'high', 'train', 'barrier'];
    const initialObs = Array.from({ length: 9 }, (_, i) => ({
      id: i + 1,
      lane: TRACK_LANES[i % TRACK_LANES.length],
      type: types[i % types.length],
      z: -26 - i * 18,
      passed: false,
    }));

    const initialCoins = Array.from({ length: 28 }, (_, i) => ({
      id: i + 1,
      lane: TRACK_LANES[Math.floor(Math.random() * TRACK_LANES.length)],
      z: -14 - i * 5.5,
      y: Math.random() > 0.75 ? 1.6 : 0.65,
      collected: false,
    }));

    const initialPowerups = [
      { id: 1, lane: 0, z: -60, type: 'magnet' as const, collected: false },
      { id: 2, lane: 2.4, z: -125, type: 'shield' as const, collected: false },
    ];

    return { obstacles: initialObs, coins: initialCoins, powerups: initialPowerups };
  });

  // Physics Jump impulse trigger (Snappy Subway Surfers jump launch)
  useEffect(() => {
    if (isJumping && playerYRef.current <= 0.12) {
      jumpVelocityRef.current = 0.64;
    }
  }, [isJumping]);

  // Fast dive-drop if slide is pressed while airborne
  useEffect(() => {
    if (isSliding && playerYRef.current > 0.1) {
      jumpVelocityRef.current = -0.72; // Instant dive-drop to clear obstacles
    }
  }, [isSliding]);

  // Main 4D Animation Frame (60+ FPS)
  useFrame((state, delta) => {
    if (!isPlaying || gameOver) return;

    // 1. Acceleration & Distance
    totalDistanceRef.current += speedRef.current;
    onDistanceGain(Math.floor(totalDistanceRef.current));
    speedRef.current = 0.38 + Math.min(0.38, totalDistanceRef.current * 0.0005);

    const speed = speedRef.current;
    const targetX = currentLane * 2.4;

    // 2. High-End Spring-Damped Lane Switching (Subway Surfers feel)
    const springK = 0.32;
    const damping = 0.7;
    laneVelocityRef.current += (targetX - playerXRef.current) * springK;
    laneVelocityRef.current *= damping;
    playerXRef.current += laneVelocityRef.current;

    // 3. Realistic Parabolic Jump Arc with Apex Float & Landing Squish
    if (jumpVelocityRef.current !== 0 || playerYRef.current > 0) {
      playerYRef.current += jumpVelocityRef.current;
      // Apex Float: near velocity peak, reduce gravity for satisfying airtime
      const isApex = Math.abs(jumpVelocityRef.current) < 0.12 && playerYRef.current > 1.1;
      const gravity = isApex ? 0.024 : 0.052;
      jumpVelocityRef.current -= gravity;

      if (playerYRef.current <= 0) {
        playerYRef.current = 0;
        jumpVelocityRef.current = 0;
        // Landing squash bounce
        playerScaleYRef.current = 0.74;
        cameraShakeRef.current = 0.18;
      }
    }

    // 4. Slide & Dynamic Scale Squash
    if (isSliding) {
      playerScaleYRef.current = THREE.MathUtils.lerp(playerScaleYRef.current, 0.38, 0.42);
    } else {
      playerScaleYRef.current = THREE.MathUtils.lerp(playerScaleYRef.current, 1.0, 0.22);
    }

    // 5. Update Player Mesh & Dynamic 4D Banking, Yaw and Pitch
    if (characterGroupRef.current) {
      characterGroupRef.current.position.x = playerXRef.current;
      characterGroupRef.current.position.y = playerYRef.current;
      characterGroupRef.current.scale.y = playerScaleYRef.current;

      // Realistic banking roll and yaw in direction of lateral velocity
      const rollAngle = -laneVelocityRef.current * 0.48;
      const yawAngle = -laneVelocityRef.current * 0.24;
      characterGroupRef.current.rotation.z = rollAngle;
      characterGroupRef.current.rotation.y = yawAngle;

      // Hoverboard jump pitch: tilt up on ascent, level at peak, tip forward on descent
      let pitch = 0;
      if (playerYRef.current > 0.05) {
        pitch = jumpVelocityRef.current > 0 ? -0.26 : 0.22;
      }
      characterGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        characterGroupRef.current.rotation.x,
        pitch,
        0.2
      );

      if (hoverboardRef.current) {
        hoverboardRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 9.0) * 0.07;
      }
    }

    // 6. Dynamic 4D Camera Following with Dutch roll banking, swooping slide and speed FOV warp
    let shake = (Math.random() - 0.5) * cameraShakeRef.current;
    cameraShakeRef.current = Math.max(0, cameraShakeRef.current - 0.035);

    const targetCamX = playerXRef.current * 0.36 + shake;
    const targetCamY = (isSliding ? 2.65 : 3.45) + playerYRef.current * 0.42 + shake;
    const targetCamZ = isSliding ? 5.8 : 6.4;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.16);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.18);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.14);

    // 4D Camera horizon tilt banking and slide swoop pitch
    camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, -laneVelocityRef.current * 0.08, 0.15);
    camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, -0.22 - (isSliding ? 0.08 : 0), 0.15);

    if (camera instanceof THREE.PerspectiveCamera) {
      const targetFov = 68 + Math.min(22, (speed - 0.38) * 45) + (isSliding ? 7 : 0);
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.08);
      camera.updateProjectionMatrix();
    }

    // 7. Update Thruster Particle Stream with dual nozzles
    if (thrustersParticlesRef.current) {
      const pos = thrustersParticlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i] = playerXRef.current + (Math.random() - 0.5) * 0.4;
        pos[i + 1] = playerYRef.current + 0.18 + (Math.random() - 0.5) * 0.12;
        pos[i + 2] -= 0.22 + speed * 0.2;
        if (pos[i + 2] < -3.2) {
          pos[i + 2] = -0.3;
        }
      }
      thrustersParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // 8. Update 4D Hyperspace Warp Speed Streaks
    if (warpStreaksRef.current) {
      const pos = warpStreaksRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 2] += speed * 3.2; // Zoom towards camera
        if (pos[i + 2] > 10) {
          pos[i + 2] = -130 - Math.random() * 40;
          pos[i] = (Math.random() - 0.5) * 16;
          pos[i + 1] = Math.random() * 7.5 + 0.4;
        }
      }
      warpStreaksRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // 8. Obstacle Movement & Collision Detection
    setEntities((prev) => {
      const updatedObs = prev.obstacles.map((obs) => {
        let nextZ = obs.z + speed;
        if (obs.type === 'train') {
          nextZ += speed * 0.38; // Oncoming bullet train speed!
        }

        const zDiff = Math.abs(nextZ - 0);
        const xDiff = Math.abs(obs.lane - playerXRef.current);

        // Hitbox check
        if (zDiff < 0.85 && xDiff < 0.95 && !obs.passed) {
          let collided = false;

          if (obs.type === 'low') {
            // Jump check
            if (playerYRef.current < 0.6) collided = true;
          } else if (obs.type === 'high') {
            // Slide check
            if (!isSliding && playerYRef.current > 0.25) collided = true;
          } else {
            // Solid barrier or train
            collided = true;
          }

          if (collided) {
            if (hasShield) {
              cameraShakeRef.current = 0.5;
              soundManager.playSuccessChime();
              onShieldAbsorbed();
              return { ...obs, passed: true, z: nextZ };
            } else {
              cameraShakeRef.current = 0.95;
              soundManager.playErrorBuzz();
              onCrash();
              return { ...obs, passed: true, z: nextZ };
            }
          } else {
            onScoreGain(30);
            return { ...obs, passed: true, z: nextZ };
          }
        }

        // Recycle Obstacle ahead
        if (nextZ > 12) {
          const freshLane = TRACK_LANES[Math.floor(Math.random() * TRACK_LANES.length)];
          return {
            ...obs,
            lane: freshLane,
            z: -115 - Math.random() * 25,
            passed: false,
          };
        }

        return { ...obs, z: nextZ };
      });

      // 9. Move Coins & Magnetic Pull
      const updatedCoins = prev.coins.map((c) => {
        let nextZ = c.z + speed;
        let nextLane = c.lane;
        let nextY = c.y;

        // Magnet attraction
        if (hasMagnet && Math.abs(nextZ - 0) < 19) {
          nextLane = THREE.MathUtils.lerp(nextLane, playerXRef.current, 0.22);
          nextY = THREE.MathUtils.lerp(nextY, playerYRef.current + 0.65, 0.22);
        }

        const dist = Math.sqrt(
          Math.pow(nextLane - playerXRef.current, 2) +
            Math.pow(nextY - (playerYRef.current + 0.5), 2) +
            Math.pow(nextZ - 0, 2)
        );

        if (dist < 1.35 && !c.collected) {
          soundManager.playSuccessChime();
          onCoinGain();
          onScoreGain(25);
          return { ...c, collected: true, z: nextZ, lane: nextLane, y: nextY };
        }

        if (nextZ > 10) {
          const freshLane = TRACK_LANES[Math.floor(Math.random() * TRACK_LANES.length)];
          return {
            ...c,
            lane: freshLane,
            z: -105 - Math.random() * 30,
            y: Math.random() > 0.75 ? 1.6 : 0.65,
            collected: false,
          };
        }

        return { ...c, z: nextZ, lane: nextLane, y: nextY };
      });

      // 10. Move Powerups
      const updatedPowerups = prev.powerups.map((p) => {
        const nextZ = p.z + speed;
        const dist = Math.sqrt(
          Math.pow(p.lane - playerXRef.current, 2) + Math.pow(nextZ - 0, 2)
        );

        if (dist < 1.4 && !p.collected) {
          soundManager.playVictoryFanfare();
          if (p.type === 'magnet') onMagnetGrab();
          if (p.type === 'shield') onShieldGrab();
          return { ...p, collected: true, z: nextZ };
        }

        if (nextZ > 10) {
          return {
            ...p,
            lane: TRACK_LANES[Math.floor(Math.random() * TRACK_LANES.length)],
            z: -125 - Math.random() * 50,
            collected: false,
          };
        }

        return { ...p, z: nextZ };
      });

      return { obstacles: updatedObs, coins: updatedCoins, powerups: updatedPowerups };
    });

    // 11. Logic Gate Question Checking
    if (totalDistanceRef.current >= nextGateDistRef.current && !activeGateQRef.current) {
      const q = RUNNER_QUESTIONS[Math.floor(Math.random() * RUNNER_QUESTIONS.length)];
      activeGateQRef.current = q;
      onQuestionTrigger(q);
      soundManager.playCyberClick();
    }

    if (activeGateQRef.current && totalDistanceRef.current >= nextGateDistRef.current + 16) {
      const isCorrect =
        (activeGateQRef.current.correctLane === -1 && currentLane <= -1) ||
        (activeGateQRef.current.correctLane === 1 && currentLane >= 1);

      onQuestionResolved(isCorrect);
      activeGateQRef.current = null;
      nextGateDistRef.current = totalDistanceRef.current + 45;
    }
  });

  return (
    <>
      {/* 4D Lighting Environment: Oq, Shaffof Moviy, To'q Sabzirang */}
      <ambientLight intensity={0.9} color="#38bdf8" />
      <directionalLight position={[10, 24, 15]} intensity={2.6} color="#ffffff" />
      <pointLight position={[0, 4.5, -6]} intensity={3.5} distance={38} color="#ea580c" />

      {/* Subway Surfers Track Bed & Wooden Sleepers */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -85]}>
        <planeGeometry args={[10.5, 190]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Wooden Railroad Sleepers (Ties) spaced along tracks */}
      {Array.from({ length: 65 }, (_, i) => -i * 2.8).map((sleeperZ) => (
        <group key={sleeperZ} position={[0, 0.02, sleeperZ]}>
          <mesh>
            <boxGeometry args={[8.8, 0.08, 0.45]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          {/* White glowing safety pinstripe on sleeper */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[8.82, 0.01, 0.06]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.65} />
          </mesh>
        </group>
      ))}

      {/* 3 Glowing Steel Subway Rails (Shaffof Moviy + White) */}
      {TRACK_LANES.map((laneX) => (
        <group key={laneX}>
          <mesh position={[laneX - 0.55, 0.1, -85]}>
            <boxGeometry args={[0.1, 0.12, 190]} />
            <meshStandardMaterial
              color="#00d2ff"
              emissive="#38bdf8"
              emissiveIntensity={0.8}
              metalness={0.95}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[laneX + 0.55, 0.1, -85]}>
            <boxGeometry args={[0.1, 0.12, 190]} />
            <meshStandardMaterial
              color="#00d2ff"
              emissive="#38bdf8"
              emissiveIntensity={0.8}
              metalness={0.95}
              roughness={0.1}
            />
          </mesh>
        </group>
      ))}

      {/* Subway Surfers Concrete Canyon Trench Walls (Left & Right) with Oq, Moviy & To'q Sabzirang Graffiti */}
      {/* Left Wall */}
      <mesh position={[-5.3, 3.2, -85]}>
        <boxGeometry args={[0.6, 6.4, 190]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} />
      </mesh>
      {/* Right Wall */}
      <mesh position={[5.3, 3.2, -85]}>
        <boxGeometry args={[0.6, 6.4, 190]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} />
      </mesh>

      {/* Colorful Graffiti Street Art Tags on Walls */}
      {Array.from({ length: 16 }, (_, i) => ({
        id: i,
        z: -i * 12 - 4,
        side: i % 2 === 0 ? -4.95 : 4.95,
        rotY: i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2,
        color: ['#00d2ff', '#ea580c', '#ffffff', '#38bdf8', '#f97316', '#ffffff'][i % 6],
      })).map((g) => (
        <group key={g.id} position={[g.side, 2.2 + (g.id % 3) * 0.4, g.z]} rotation={[0, g.rotY, 0]}>
          <mesh>
            <planeGeometry args={[3.2, 1.8]} />
            <meshStandardMaterial color={g.color} emissive={g.color} emissiveIntensity={0.4} />
          </mesh>
        </group>
      ))}

      {/* Overhead Subway Gantry Arches & Signal Lights (To'q Sabzirang Steel + White/Cyan) */}
      {Array.from({ length: 12 }, (_, i) => -i * 16).map((z) => (
        <group key={z} position={[0, 0, z]}>
          {/* Vertical To'q Sabzirang Industrial Steel Trusses */}
          <mesh position={[-4.9, 3.2, 0]}>
            <boxGeometry args={[0.3, 6.4, 0.3]} />
            <meshStandardMaterial color="#ea580c" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[4.9, 3.2, 0]}>
            <boxGeometry args={[0.3, 6.4, 0.3]} />
            <meshStandardMaterial color="#ea580c" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Top Cross Beam */}
          <mesh position={[0, 6.2, 0]}>
            <boxGeometry args={[10.2, 0.35, 0.35]} />
            <meshStandardMaterial color="#ea580c" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Signal Indicator Lights (Oq & Shaffof Moviy) */}
          <mesh position={[-2.4, 5.8, 0]}>
            <sphereGeometry args={[0.16, 12, 12]} />
            <meshBasicMaterial color="#00d2ff" />
          </mesh>
          <mesh position={[0, 5.8, 0]}>
            <sphereGeometry args={[0.16, 12, 12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[2.4, 5.8, 0]}>
            <sphereGeometry args={[0.16, 12, 12]} />
            <meshBasicMaterial color="#ea580c" />
          </mesh>
        </group>
      ))}

      {/* Cyber Skyscrapers in Background */}
      {Array.from({ length: 18 }, (_, i) => {
        const height = 25 + (i * 3) % 20;
        const side = i % 2 === 0 ? -1 : 1;
        return {
          id: i,
          x: side * (10.5 + (i * 2) % 6),
          z: -i * 12,
          height,
          color: i % 2 === 0 ? '#00d2ff' : '#f43f5e',
        };
      }).map((b) => (
        <group key={b.id} position={[b.x, 0, b.z]}>
          <mesh position={[0, b.height / 2, 0]}>
            <boxGeometry args={[6.5, b.height, 8.5]} />
            <meshStandardMaterial color="#060914" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[3.3, b.height * 0.45, 0]}>
            <boxGeometry args={[0.1, b.height * 0.7, 0.1]} />
            <meshBasicMaterial color={b.color} />
          </mesh>
        </group>
      ))}

      {/* Render Dynamic Shader-Driven Obstacles */}
      {entities.obstacles.map((obs) => (
        <NeonObstacleMesh key={obs.id} type={obs.type} lane={obs.lane} z={obs.z} />
      ))}

      {/* Render Gold Coins */}
      {entities.coins.map(
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
                emissiveIntensity={0.7}
                metalness={0.95}
                roughness={0.1}
              />
            </mesh>
          )
      )}

      {/* Render Powerups */}
      {entities.powerups.map(
        (p) =>
          !p.collected && (
            <group key={p.id} position={[p.lane, 1.05, p.z]}>
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

      {/* Cyber Surfer Character (Oq, Shaffof Moviy & To'q Sabzirang) */}
      <group ref={characterGroupRef} position={[0, 0, 0]}>
        {/* Torso: Pure White High-Tech Armor with Shaffof Moviy Glow */}
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.32, 0.22, 0.85, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#00d2ff"
            emissiveIntensity={0.5}
            metalness={0.9}
            roughness={0.15}
          />
        </mesh>

        {/* Chest Arc Reactor Core: Shaffof Moviy */}
        <mesh position={[0, 0.95, 0.26]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshBasicMaterial color="#00d2ff" />
        </mesh>

        {/* Head: High-gloss white helmet with dark accents */}
        <mesh position={[0, 1.48, 0]}>
          <sphereGeometry args={[0.25, 20, 20]} />
          <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.15} />
        </mesh>

        {/* Cyber Visor: To'q Sabzirang */}
        <mesh position={[0, 1.48, 0.16]}>
          <boxGeometry args={[0.34, 0.12, 0.2]} />
          <meshBasicMaterial color="#ea580c" />
        </mesh>

        {/* Cyber Crown / Fin: To'q Sabzirang */}
        <mesh position={[0, 1.82, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.16, 0.18, 5]} />
          <meshBasicMaterial color="#ea580c" />
        </mesh>

        {/* Neon Cyber Hoverboard: To'q Sabzirang with Shaffof Moviy & White edge trim */}
        <mesh ref={hoverboardRef} position={[0, 0.22, 0]}>
          <boxGeometry args={[0.84, 0.1, 1.68]} />
          <meshStandardMaterial
            color="#ea580c"
            emissive="#c2410c"
            emissiveIntensity={0.9}
            metalness={0.85}
            roughness={0.1}
          />
        </mesh>
        {/* Hoverboard White edge neon trim */}
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[0.88, 0.04, 1.72]} />
          <meshBasicMaterial color="#00d2ff" wireframe />
        </mesh>

        {/* Twin Plasma Jet Nozzles (Shaffof Moviy + White) */}
        <mesh position={[-0.28, 0.15, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.15, 0.35, 12]} />
          <meshBasicMaterial color="#00d2ff" />
        </mesh>
        <mesh position={[0.28, 0.15, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.15, 0.35, 12]} />
          <meshBasicMaterial color="#00d2ff" />
        </mesh>

        {/* Forcefield Shield (Shaffof Moviy Aura) */}
        {hasShield && (
          <mesh position={[0, 1.0, 0]}>
            <sphereGeometry args={[1.25, 16, 16]} />
            <meshBasicMaterial color="#00d2ff" wireframe transparent opacity={0.45} />
          </mesh>
        )}
      </group>

      {/* Thruster Jet Exhaust Particle Stream */}
      <points ref={thrustersParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(
                Array.from({ length: 45 * 3 }, (_, i) =>
                  i % 3 === 2 ? -Math.random() * 1.6 : (Math.random() - 0.5) * 0.35
                )
              ),
              3,
            ]}
          />
        </bufferGeometry>
        <pointsMaterial color="#38bdf8" size={0.18} transparent opacity={0.9} />
      </points>

      {/* 4D Hyperspace Warp Speed Streaks */}
      <points ref={warpStreaksRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(
                Array.from({ length: 140 * 3 }, (_, i) => {
                  if (i % 3 === 0) return (Math.random() - 0.5) * 16;
                  if (i % 3 === 1) return Math.random() * 8 + 0.4;
                  return -Math.random() * 140;
                })
              ),
              3,
            ]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#38bdf8"
          size={0.18}
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* R3F Drei Ambient Sparkles */}
      <Sparkles count={90} scale={[14, 8, 40]} color="#00d2ff" size={2.4} speed={1.4} />
    </>
  );
};

// ==============================================================
// 4. MAIN EXPORTED COMPONENT WITH TOUCH GESTURES & HUD
// ==============================================================
export const LogicRunnerGame: React.FC<LogicRunnerGameProps> = ({ onEarnTickets, onBack }) => {
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

  // Touch Swipe Handlers (Sensitivity: 15px)
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

    if (Math.max(absX, absY) > 15) {
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

  const [ticketsClaimed, setTicketsClaimed] = useState(false);

  const handleStartGame = () => {
    soundManager.playCyberClick();
    setScore(0);
    setCoinsCollected(0);
    setDistanceMeters(0);
    setGameOver(false);
    setTicketsClaimed(false);
    setCurrentLane(0);
    setHasShield(false);
    setHasMagnet(false);
    setCurrentQuestion(null);
    speedRef.current = 0.38;
    setIsPlaying(true);
  };

  const handleFinishGameOver = () => {
    if (ticketsClaimed) return;
    soundManager.playVictoryFanfare();
    // Reduced ticket rewards: only 1 ticket for high mastery run
    if (score >= 400 && distanceMeters >= 450) {
      onEarnTickets(1);
    }
    setTicketsClaimed(true);
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
            <span>SUBWAY 4D RUNNER (DREI)</span>
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

      {/* R3F + Drei 4D Subway Canvas */}
      <div
        className="relative rounded-3xl overflow-hidden border-2 border-cyan-400/60 shadow-[0_0_35px_rgba(0,210,255,0.25)] bg-[#050811] touch-none select-none h-[380px] sm:h-[440px]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Canvas
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.35 }}
          className="w-full h-full"
        >
          <PerspectiveCamera makeDefault position={[0, 3.4, 6.4]} fov={68} />
          <color attach="background" args={['#050811']} />
          <fogExp2 attach="fog" args={['#050811', 0.018]} />
          <RunnerScene
            isPlaying={isPlaying}
            gameOver={gameOver}
            currentLane={currentLane}
            isJumping={isJumping}
            isSliding={isSliding}
            hasShield={hasShield}
            hasMagnet={hasMagnet}
            speedRef={speedRef}
            onScoreGain={(pts) => setScore((s) => s + pts)}
            onCoinGain={() => setCoinsCollected((c) => c + 1)}
            onDistanceGain={setDistanceMeters}
            onCrash={() => {
              setGameOver(true);
              setIsPlaying(false);
            }}
            onShieldAbsorbed={() => setHasShield(false)}
            onMagnetGrab={() => {
              setHasMagnet(true);
              setTimeout(() => setHasMagnet(false), 10000);
            }}
            onShieldGrab={() => setHasShield(true)}
            onQuestionTrigger={setCurrentQuestion}
            onQuestionResolved={(correct) => {
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
              @react-three/fiber va @react-three/drei asosidagi haqiqiy 4D Subway Surfers kiber poygasi!
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

            {distanceMeters >= 450 && score >= 400 ? (
              <p className="text-xs text-orange-400 font-bold flex items-center justify-center gap-1">
                🎉 Yuqori natija! +1 Energiya Bileti yutdingiz!
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 max-w-xs">
                Bilet yutish uchun kamida 450m yuguring va 400 ball to'plang (Sizda: {distanceMeters}m / {score} ball)
              </p>
            )}

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleStartGame}
                className="h-11 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_#00d2ff] active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Qayta O'ynash</span>
              </button>

              <button
                onClick={handleFinishGameOver}
                disabled={ticketsClaimed || !(distanceMeters >= 450 && score >= 400)}
                className={`h-11 px-4 rounded-xl text-xs transition-all ${
                  distanceMeters >= 450 && score >= 400 && !ticketsClaimed
                    ? 'bg-orange-500 hover:bg-orange-400 text-white font-bold shadow-[0_0_15px_#ea580c]'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {ticketsClaimed ? 'Bilet olindi ✓' : "Biletni Olish (+1)"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* On-Screen Mobile Arcade Buttons */}
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

export default LogicRunnerGame;
