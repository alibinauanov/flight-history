"use client";

import { Canvas } from '@react-three/fiber';
import Earth from '../components/Earth';
import Head from 'next/head';
import { useState } from 'react';

export default function Home() {
  const [flightNumber, setFlightNumber] = useState('');
  const [date, setDate] = useState('');
  const [flightDetails, setFlightDetails] = useState(null);

  const fetchFlightDetails = async () => {
    try {
      const response = await fetch(
        `/api/getFlightDetails?flightNumber=${flightNumber}&date=${date}`
      );
      if (!response.ok) {
        throw new Error('Flight not found');
      }
      const data = await response.json();
      setFlightDetails(data);
    } catch (error) {
      console.error(error);
      setFlightDetails(null);
    }
  };

  return (
    <>
      <Head>
        <meta name="description" content="A 3D Earth you can interact with" />
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-6xl h-[70vh] rounded-xl overflow-hidden shadow-2xl">
          <Canvas>
            <Earth flightDetails={flightDetails} />
          </Canvas>
        </div>
        <div className="mt-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchFlightDetails();
            }}
            className="flex flex-col items-center space-y-4"
          >
            <input
              type="text"
              placeholder="Flight Number"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              className="p-2 border rounded"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="p-2 border rounded"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Get Flight Details
            </button>
          </form>
          {flightDetails && (
            <div className="mt-4 text-white">
              <p>From: {flightDetails.from.city}</p>
              <p>To: {flightDetails.to.city}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}