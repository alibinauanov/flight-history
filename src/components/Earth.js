"use client";

import * as THREE from 'three';
import { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import { TextureLoader } from 'three';

export default function Earth({ flightDetails }) {
  const earthRef = useRef();

  // Load textures
  const [colorMap, bumpMap, specularMap, hdMap] = useLoader(TextureLoader, [
    '/textures/earthmap.png',
    '/textures/earthbumps.jpg',
    '/textures/earthspecular.png',
    '/textures/earth_hd.jpg',
  ]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight color="#ffffff" intensity={1} position={[5, 3, 5]} />
      <pointLight color="#ffffff" position={[10, 10, 10]} intensity={0.5} />
      
      {/* Earth */}
      <mesh ref={earthRef} scale={[1.5, 1.5, 1.5]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          map={hdMap}
          bumpMap={bumpMap}
          bumpScale={0.05}
          specularMap={specularMap}
          specular={new THREE.Color('grey')}
          shininess={100}
        />
        
        {/* Flight Path - as children of Earth so they rotate together */}
        {flightDetails && (
          <FlightPath flightDetails={flightDetails} />
        )}

        {/* Country borders overlay - as children of Earth */}
        <CountryBorders />
      </mesh>

      {/* Controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        zoomSpeed={0.6}
        panSpeed={0.5}
        rotateSpeed={0.4}
        minDistance={2}
        maxDistance={10}
      />

      {/* Stars */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </>
  );
}

// Flight path component with arc and markers
function FlightPath({ flightDetails }) {
  const { from, to } = flightDetails;
  const [hoveredPoint, setHoveredPoint] = useState(null);
  
  // Convert lat/lng to 3D coordinates (adjusted for being inside scaled Earth)
  const fromPos = latLngToSphere(from.lat, from.lng, 1.01); // Slightly above Earth surface
  const toPos = latLngToSphere(to.lat, to.lng, 1.01);
  
  // Create arc points
  const arcPoints = useMemo(() => {
    const points = [];
    const segments = 50;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      // Create great circle arc
      const start = new THREE.Vector3(...fromPos);
      const end = new THREE.Vector3(...toPos);
      
      // Calculate intermediate point on sphere surface
      const interpolated = new THREE.Vector3().lerpVectors(start, end, t);
      interpolated.normalize().multiplyScalar(1.02 + Math.sin(t * Math.PI) * 0.2); // Arc height
      
      points.push(interpolated);
    }
    return points;
  }, [fromPos, toPos]);

  return (
    <>
      {/* Flight Arc */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={arcPoints.length}
            array={new Float32Array(arcPoints.flatMap(p => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#00ffff" linewidth={3} />
      </line>

      {/* Departure Point */}
      <group position={fromPos}>
        <mesh
          onPointerEnter={() => setHoveredPoint('departure')}
          onPointerLeave={() => setHoveredPoint(null)}
        >
          <sphereGeometry args={[hoveredPoint === 'departure' ? 0.07 : 0.05, 16, 16]} />
          <meshStandardMaterial 
            color={hoveredPoint === 'departure' ? "#00ff88" : "#00ff00"}
            emissive={hoveredPoint === 'departure' ? "#00ff88" : "#00ff00"}
            emissiveIntensity={hoveredPoint === 'departure' ? 0.8 : 0.5}
          />
        </mesh>
        {(hoveredPoint === 'departure') && (
          <Html
            position={[0, 0.15, 0]}
            distanceFactor={8}
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#00ff00',
              fontWeight: 'bold',
              fontSize: '12px',
              textAlign: 'center',
              pointerEvents: 'none',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #00ff00',
              textShadow: '0 0 10px #000',
              whiteSpace: 'nowrap'
            }}
          >
            <div>
              <div style={{fontSize: '14px', marginBottom: '4px'}}>{from.code}</div>
              <div style={{fontSize: '11px'}}>{from.city}</div>
              <div style={{fontSize: '10px', opacity: 0.8}}>{from.airport}</div>
            </div>
          </Html>
        )}
      </group>

      {/* Arrival Point */}
      <group position={toPos}>
        <mesh
          onPointerEnter={() => setHoveredPoint('arrival')}
          onPointerLeave={() => setHoveredPoint(null)}
        >
          <sphereGeometry args={[hoveredPoint === 'arrival' ? 0.07 : 0.05, 16, 16]} />
          <meshStandardMaterial 
            color={hoveredPoint === 'arrival' ? "#ff6666" : "#ff4444"}
            emissive={hoveredPoint === 'arrival' ? "#ff6666" : "#ff4444"}
            emissiveIntensity={hoveredPoint === 'arrival' ? 0.8 : 0.5}
          />
        </mesh>
        {(hoveredPoint === 'arrival') && (
          <Html
            position={[0, 0.15, 0]}
            distanceFactor={8}
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#ff4444',
              fontWeight: 'bold',
              fontSize: '12px',
              textAlign: 'center',
              pointerEvents: 'none',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #ff4444',
              textShadow: '0 0 10px #000',
              whiteSpace: 'nowrap'
            }}
          >
            <div>
              <div style={{fontSize: '14px', marginBottom: '4px'}}>{to.code}</div>
              <div style={{fontSize: '11px'}}>{to.city}</div>
              <div style={{fontSize: '10px', opacity: 0.8}}>{to.airport}</div>
            </div>
          </Html>
        )}
      </group>

      {/* Direction Arrow */}
      <FlightArrow from={fromPos} to={toPos} />
    </>
  );
}

// Arrow showing flight direction
function FlightArrow({ from, to }) {
  const midPoint = useMemo(() => {
    const mid = new THREE.Vector3().addVectors(
      new THREE.Vector3(...from),
      new THREE.Vector3(...to)
    ).multiplyScalar(0.5);
    return mid.normalize().multiplyScalar(1.2);
  }, [from, to]);

  return (
    <group position={[midPoint.x, midPoint.y, midPoint.z]}>
      <mesh>
        <coneGeometry args={[0.03, 0.1, 8]} />
        <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.3} />
      </mesh>
    </group>
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

// Country borders overlay component
function CountryBorders() {
  const [geojson, setGeojson] = useState(null);
  useEffect(() => {
    fetch('/geo/countries.json')
      .then((res) => res.json())
      .then((data) => setGeojson(data));
  }, []);
  if (!geojson) return null;
  return geojson.features.map((feature, i) => (
    <CountryBorder key={i} feature={feature} />
  ));
}

function CountryBorder({ feature }) {
  let coords = [];
  if (feature.geometry.type === 'Polygon') {
    coords = feature.geometry.coordinates.flat(1);
  } else if (feature.geometry.type === 'MultiPolygon') {
    coords = feature.geometry.coordinates.flat(2);
  } else if (feature.geometry.type === 'LineString') {
    coords = feature.geometry.coordinates;
  }
  // Convert to 3D points (adjusted for being inside scaled Earth)
  const points = coords.map(([lng, lat]) => {
    const [x, y, z] = latLngToSphere(lat, lng, 1.001); // Just above Earth surface
    return new THREE.Vector3(x, y, z);
  });
  if (points.length < 2) return null;
  // Find a label position (first point)
  const labelPos = points[0];
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
        <lineBasicMaterial attach="material" color="#ffffff" linewidth={1} />
      </line>
      {/* Country name label */}
      {feature.properties && feature.properties.ADMIN && (
        <Html
          position={[labelPos.x, labelPos.y, labelPos.z]}
          distanceFactor={10}
          style={{
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '0.9em',
            textShadow: '0 0 6px #000',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
          occlude
        >
          {feature.properties.ADMIN}
        </Html>
      )}
    </>
  );
}
