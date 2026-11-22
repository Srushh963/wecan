import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Icosahedron, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

interface CapabilitySphereProps {
  score: number; // 0 - 100
}

export default function CapabilitySphere({ score }: CapabilitySphereProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const intensity = useMemo(() => score / 100, [score]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = t * 0.2;
    meshRef.current.rotation.z = t * 0.1;
  });

  return (
    <Float speed={5} rotationIntensity={2} floatIntensity={2}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.5, 15]} />
        <MeshDistortMaterial
          color={new THREE.Color(0.2, 0.7, 1.0)}
          speed={3}
          distort={0.4 * intensity}
          radius={1}
          metalness={0.9}
          roughness={0.05}
          transmission={0.8}
          thickness={2}
          ior={1.5}
          clearcoat={1}
          emissive={new THREE.Color(0.1, 0.4, 0.8)}
          emissiveIntensity={intensity * 2}
        />
        
        {/* Core Glow */}
        <pointLight intensity={5 * intensity} distance={5} color="#38BDF8" />
        
        {/* Rim Light Effect */}
        <mesh scale={1.05}>
          <icosahedronGeometry args={[1.5, 15]} />
          <meshBasicMaterial 
            color="#38BDF8" 
            wireframe 
            transparent 
            opacity={0.1 * intensity} 
          />
        </mesh>
      </mesh>
    </Float>
  );
}
