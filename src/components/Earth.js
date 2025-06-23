"use client";

import * as THREE from 'three';
import { useRef, Suspense, useEffect, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { TextureLoader } from 'three';
import { CatmullRomCurve3 } from 'three';
import { ArrowHelper } from 'three';

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
          {/* Arc line between cities */}
          <LineArc from={flightDetails.from} to={flightDetails.to} radius={1.5} />
          {/* Markers for cities */}
          <mesh position={latLngToSphere(flightDetails.from.lat, flightDetails.from.lng, 1.52)}>
            <sphereGeometry args={[0.07, 32, 32]} />
            <meshStandardMaterial color="#00ffea" emissive="#00fff7" emissiveIntensity={1.2} />
            <pointLight color="#00fff7" intensity={1.5} distance={0.5} />
          </mesh>
          <mesh position={latLngToSphere(flightDetails.to.lat, flightDetails.to.lng, 1.52)}>
            <sphereGeometry args={[0.07, 32, 32]} />
            <meshStandardMaterial color="#ffb300" emissive="#ffb300" emissiveIntensity={1.2} />
            <pointLight color="#ffb300" intensity={1.5} distance={0.5} />
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

// Draws a 3D arc (great circle) between two lat/lng points
function LineArc({ from, to, radius }) {
  const segments = 2; // Only start and end
  const points = useMemo(() => {
    const start = latLngToSphere(from.lat, from.lng, radius + 0.01);
    const end = latLngToSphere(to.lat, to.lng, radius + 0.01);
    return [
      new THREE.Vector3(...start),
      new THREE.Vector3(...end)
    ];
  }, [from, to, radius]);

  // Arrow for direction
  const arrowStart = points[0];
  const arrowEnd = points[1];
  const arrowDir = new THREE.Vector3().subVectors(arrowEnd, arrowStart).normalize();
  const arrowLength = arrowStart.distanceTo(arrowEnd) * 0.8;

  return (
    <>
      <line>
        <bufferGeometry attach="geometry" {...{attributes: undefined}}>
          <bufferAttribute
            attachObject={["attributes", "position"]}
            count={points.length}
            array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="#ff3c00" linewidth={6} />
      </line>
      <Arrow3D position={arrowStart} direction={arrowDir} length={arrowLength} color="#00fff7" />
    </>
  );
}

// Arrow3D renders a 3D arrow at a given position and direction
function Arrow3D({ position, direction, length, color }) {
  const ref = useRef();
  useEffect(() => {
    if (ref.current) {
      ref.current.setDirection(direction);
      ref.current.setLength(length, 0.12, 0.08);
    }
  }, [direction, length]);
  return (
    <primitive
      object={new ArrowHelper(direction, new THREE.Vector3(...position), length, color)}
      ref={ref}
      dispose={null}
    />
  );
}