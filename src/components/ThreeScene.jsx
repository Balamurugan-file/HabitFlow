import React from "react";
import { Canvas } from "@react-three/fiber";
import { Float, Icosahedron, MeshDistortMaterial, Sparkles } from "@react-three/drei";

function Orb({ position, color, scale, speed, distort }) {
  return <Float speed={speed} rotationIntensity={0.5} floatIntensity={0.7}>
    <Icosahedron args={[1, 4]} position={position} scale={scale}>
      <MeshDistortMaterial color={color} roughness={0.2} metalness={0.25} distort={distort} speed={2} />
    </Icosahedron>
  </Float>;
}
export default function ThreeScene() {
  return <div className="three-scene" aria-hidden="true">
    <Canvas camera={{ position: [0, 0, 7], fov: 55 }}>
      <ambientLight intensity={1.4} />
      <directionalLight position={[4, 5, 5]} intensity={2} />
      <Orb position={[-3.2, 1.2, -1]} color="#8B83FF" scale={1.05} speed={1.2} distort={0.32} />
      <Orb position={[3.1, -1.3, -1.8]} color="#63DFC1" scale={1.35} speed={1.5} distort={0.24} />
      <Orb position={[1.1, 2.2, -2.5]} color="#FFB7D5" scale={0.48} speed={1.8} distort={0.2} />
      <Sparkles count={45} scale={10} size={2.2} speed={0.25} color="#8B83FF" />
    </Canvas>
  </div>;
}
