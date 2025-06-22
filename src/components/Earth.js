"use client";

import * as THREE from 'three';
import { useRef, Suspense, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { TextureLoader } from 'three';

export default function Earth({ flightDetails }) {
  const earthRef = useRef();
  const cloudsRef = useRef();
  const lineRef = useRef();

  // Preload textures
  const [colorMap, bumpMap, specularMap, cloudsMap] = useLoader(TextureLoader, [
    '/textures/earthmap.png',
    '/textures/earthbumps.jpg',
    '/textures/earthspecular.png',
    '/textures/earthclouds.jpg'
  ]);

  useEffect(() => {
    if (flightDetails && lineRef.current) {
      const { from, to } = flightDetails;
      const points = [
        new THREE.Vector3(from.lng, from.lat, 1.5),
        new THREE.Vector3(to.lng, to.lat, 1.5)
      ];
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      lineRef.current.geometry = lineGeometry;
    }
  }, [flightDetails]);

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
      
      {/* Flight path line - appears only if flightDetails are provided */}
      {flightDetails && (
        <>
          {/* Line between cities */}
          <line ref={lineRef}>
            <bufferGeometry />
            <lineBasicMaterial color="red" linewidth={2} />
          </line>
          {/* Markers for cities */}
          <mesh position={latLngToSphere(flightDetails.from.lat, flightDetails.from.lng, 1.52)}>
            <sphereGeometry args={[0.06, 24, 24]} />
            <meshStandardMaterial color="lime" emissive="yellow" emissiveIntensity={0.7} />
          </mesh>
          <mesh position={latLngToSphere(flightDetails.to.lat, flightDetails.to.lng, 1.52)}>
            <sphereGeometry args={[0.06, 24, 24]} />
            <meshStandardMaterial color="orange" emissive="red" emissiveIntensity={0.7} />
          </mesh>
        </>
      )}
    </>
  );
}

// Helper function to convert lat/lng to 3D sphere coordinates
function latLngToSphere(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return [x, y, z];
}