import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// 3D Glass Brain with Crown and Sunglasses
function CyberBrainModel() {
  const groupRef = useRef<THREE.Group>(null);
  const leftHemisphereRef = useRef<THREE.Mesh>(null);
  const rightHemisphereRef = useRef<THREE.Mesh>(null);
  const coreGlowRef = useRef<THREE.PointLight>(null);

  // Smooth mouse/touch tracking
  const targetRotation = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    if (!groupRef.current) return;

    // Follow pointer with smooth interpolation
    const { pointer } = state;
    targetRotation.current.x = pointer.y * 0.4;
    targetRotation.current.y = pointer.x * 0.7;

    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotation.current.x,
      0.08
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotation.current.y,
      0.08
    );

    // Subtle breathing pulse
    const time = state.clock.getElapsedTime();
    const scalePulse = 1 + Math.sin(time * 2.5) * 0.02;
    groupRef.current.scale.set(scalePulse, scalePulse, scalePulse);

    if (coreGlowRef.current) {
      coreGlowRef.current.intensity = 2.5 + Math.sin(time * 4) * 0.8;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      {/* Internal Brain Core Glowing Light */}
      <pointLight ref={coreGlowRef} color="#00d2ff" distance={3} intensity={3} />

      {/* --- BRAIN HEMISPHERES (Glass Morphic Physical Material) --- */}
      {/* Left Hemisphere */}
      <mesh ref={leftHemisphereRef} position={[-0.42, 0.15, 0]} castShadow>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshPhysicalMaterial
          color="#00d2ff"
          emissive="#005577"
          emissiveIntensity={0.25}
          roughness={0.15}
          metalness={0.1}
          transmission={0.88}
          ior={1.45}
          thickness={1.2}
          transparent
          opacity={0.92}
          wireframe={false}
        />
      </mesh>

      {/* Right Hemisphere */}
      <mesh ref={rightHemisphereRef} position={[0.42, 0.15, 0]} castShadow>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshPhysicalMaterial
          color="#00d2ff"
          emissive="#005577"
          emissiveIntensity={0.25}
          roughness={0.15}
          metalness={0.1}
          transmission={0.88}
          ior={1.45}
          thickness={1.2}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Frontal Lobes bump details */}
      <mesh position={[-0.35, -0.15, 0.35]}>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          transmission={0.85}
          roughness={0.2}
          thickness={0.8}
        />
      </mesh>
      <mesh position={[0.35, -0.15, 0.35]}>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          transmission={0.85}
          roughness={0.2}
          thickness={0.8}
        />
      </mesh>

      {/* Brain Stem / Cord base */}
      <mesh position={[0, -0.65, -0.1]}>
        <cylinderGeometry args={[0.18, 0.12, 0.45, 20]} />
        <meshStandardMaterial
          color="#0369a1"
          metalness={0.3}
          roughness={0.3}
          emissive="#0284c7"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* --- CYBER SUNGLASSES --- */}
      <group position={[0, 0.18, 0.55]}>
        {/* Left Lens */}
        <mesh position={[-0.32, 0, 0]}>
          <boxGeometry args={[0.4, 0.24, 0.08]} />
          <meshStandardMaterial
            color="#050811"
            metalness={0.95}
            roughness={0.05}
            envMapIntensity={2}
          />
        </mesh>
        {/* Right Lens */}
        <mesh position={[0.32, 0, 0]}>
          <boxGeometry args={[0.4, 0.24, 0.08]} />
          <meshStandardMaterial
            color="#050811"
            metalness={0.95}
            roughness={0.05}
            envMapIntensity={2}
          />
        </mesh>
        {/* Golden Neon Glasses Bridge */}
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[0.26, 0.06, 0.09]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Sunglasses Frames Accent */}
        <mesh position={[0, 0, 0.045]}>
          <boxGeometry args={[1.08, 0.04, 0.02]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} emissive="#f59e0b" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* --- GOLDEN CROWN ON TOP --- */}
      <group position={[0, 0.78, 0]}>
        {/* Base Ring */}
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.48, 0.52, 0.12, 28, 1, true]} />
          <meshStandardMaterial
            color="#fbbf24"
            metalness={0.85}
            roughness={0.2}
            emissive="#d97706"
            emissiveIntensity={0.25}
          />
        </mesh>

        {/* Crown Spikes (5 Golden Points) */}
        {[-0.36, -0.18, 0, 0.18, 0.36].map((xPos, idx) => (
          <mesh
            key={idx}
            position={[xPos, 0.12, idx % 2 === 0 ? 0.38 : 0.42]}
            rotation={[0, 0, (idx - 2) * -0.15]}
          >
            <coneGeometry args={[0.075, idx === 2 ? 0.32 : 0.24, 16]} />
            <meshStandardMaterial
              color="#fbbf24"
              metalness={0.9}
              roughness={0.2}
              emissive="#f59e0b"
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}

        {/* Center Crown Ruby Jewel */}
        <mesh position={[0, 0.08, 0.46]}>
          <octahedronGeometry args={[0.08, 0]} />
          <meshStandardMaterial
            color="#00d2ff"
            metalness={0.4}
            roughness={0.1}
            emissive="#38bdf8"
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>

      {/* Floating Idea Spark Orb (Electric Bulb effect) */}
      <mesh position={[0.9, 0.65, 0.2]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={1.8}
          roughness={0.1}
        />
      </mesh>
      <pointLight position={[0.9, 0.65, 0.2]} color="#fbbf24" intensity={2} distance={2} />
    </group>
  );
}

export const Brain3DCanvas: React.FC = () => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return null;
  }

  return (
    <div className="relative w-full h-[280px] sm:h-[340px] rounded-3xl overflow-hidden bg-gradient-to-b from-slate-900/60 to-slate-950/90 border border-cyan-500/30 shadow-2xl">
      {/* Ambient Cyber Light Accents */}
      <div className="absolute top-2 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 border border-cyan-400/40 text-[10px] font-mono text-cyan-300">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
        <span>3D INTELEKT GRAFIKASI (R3F)</span>
      </div>

      <div className="absolute bottom-2 right-3 z-10 text-[10px] font-mono text-slate-400">
        🖱️ Sichqoncha / sensor bilan aylantiring
      </div>

      <Canvas
        shadows
        camera={{ position: [0, 0.2, 2.7], fov: 45 }}
        onError={() => setHasError(true)}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 5, 4]} intensity={2.2} color="#38bdf8" />
        <directionalLight position={[-4, 3, -3]} intensity={1.8} color="#fbbf24" />
        <pointLight position={[0, -2, 2]} intensity={1.2} color="#00d2ff" />

        <Float speed={2.5} rotationIntensity={0.6} floatIntensity={0.5}>
          <CyberBrainModel />
        </Float>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 2.8}
        />
      </Canvas>
    </div>
  );
};
