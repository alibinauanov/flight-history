"use client";

import { Canvas } from '@react-three/fiber';
import Earth from '../components/Earth';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <meta name="description" content="A 3D Earth you can interact with" />
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-6xl h-[70vh] rounded-xl overflow-hidden shadow-2xl">
          <Canvas>
            <Earth />
          </Canvas>
        </div>
      </div>
    </>
  );
}