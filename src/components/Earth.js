"use client";

import * as THREE from 'three';
import { useRef, Suspense } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { TextureLoader } from 'three';

export default function Earth(props) {
  const earthRef = useRef();
  const cloudsRef = useRef();

  // Preload textures
  const [colorMap, bumpMap, specularMap, cloudsMap] = useLoader(TextureLoader, [
    '/textures/earthmap.png',
    '/textures/earthbumps.jpg',
    '/textures/earthspecular.png',
    '/textures/earthclouds.jpg'
  ]);

  // Removed automatic rotation from useFrame
  // useFrame is kept in case you want to add other animations later

  return (
    <>
      <ambientLight intensity={1.2} /> {/* Increased ambient light */}
      <pointLight color="#f6f3ea" position={[2, 0, 5]} intensity={1.5} /> {/* Increased light intensity */}
      
      {/* Earth - scaled up to 1.5 units */}
      <mesh ref={earthRef} scale={[1.5, 1.5, 1.5]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          map={colorMap}
          bumpMap={bumpMap}
          bumpScale={0.05}
          specularMap={specularMap}
          specular={new THREE.Color('grey')}
          color={new THREE.Color(0xaaaaaa)} // Added base color to lighten
          emissive={new THREE.Color(0x222222)} // Subtle glow
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Clouds - scaled to match earth */}
      {/* <mesh ref={cloudsRef} scale={[1.5, 1.5, 1.5]}>
        <sphereGeometry args={[1.01, 64, 64]} />
        <meshPhongMaterial
          map={cloudsMap}
          transparent={true}
          opacity={0.4}
        />
      </mesh> */}
      
      {/* Interactive controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        zoomSpeed={0.6}
        panSpeed={0.5}
        rotateSpeed={0.4}
      />
      
      {/* Stars background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </>
  );
}