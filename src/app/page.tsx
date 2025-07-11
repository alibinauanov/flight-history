"use client";

import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Earth from '../components/Earth';
import Head from 'next/head';

export default function Home() {
  const [flightDetails, setFlightDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [date, setDate] = useState('2024-07-11');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `/api/getFlightDetails?flightNumber=${flightNumber}&date=${date}`
      );
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Flight not found');
      }
      
      const data = await response.json();
      setFlightDetails(data);
    } catch (error: any) {
      setError(error.message);
      setFlightDetails(null);
    }
    
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Flight History Globe</title>
        <meta name="description" content="Interactive 3D flight tracking visualization" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* Header */}
        <div className="relative z-10 p-6">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            ✈️ Flight History Globe
          </h1>
          
          {/* Search Form */}
          <div className="max-w-md mx-auto mb-6">
            <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl">
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Flight Number
                  </label>
                  <input
                    type="text"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                    placeholder="e.g., AA1234, BA123, LH456"
                    className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Flight Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? '🔍 Searching...' : '🚀 Track Flight'}
                </button>
              </div>
            </form>
            
            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                {error}
              </div>
            )}
            
            {/* Sample Flights */}
            <div className="mt-4 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
              <p className="text-blue-200 text-sm font-medium mb-2">Try these sample flights:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-blue-300">AA1234 - NYC → LA</div>
                <div className="text-blue-300">BA123 - London → NYC</div>
                <div className="text-blue-300">LH456 - Frankfurt → Tokyo</div>
                <div className="text-blue-300">QF1 - Sydney → London</div>
                <div className="text-blue-300">EK215 - Dubai → NYC</div>
              </div>
            </div>
          </div>
        </div>

        {/* Globe Container */}
        <div className="relative w-full h-[70vh]">
          <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
            <Earth flightDetails={flightDetails} />
          </Canvas>
          
          {/* Flight Info Overlay */}
          {flightDetails && (
            <div className="absolute top-6 left-6 bg-black/70 backdrop-blur-sm rounded-xl p-4 text-white shadow-2xl border border-white/20">
              <h3 className="text-xl font-bold mb-3 text-cyan-300">
                Flight {flightDetails.flightNumber}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-green-300 font-medium">From:</span>
                  <span>{flightDetails.from.city} ({flightDetails.from.code})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span className="text-red-300 font-medium">To:</span>
                  <span>{flightDetails.to.city} ({flightDetails.to.code})</span>
                </div>
                <div className="text-gray-300 text-sm">
                  Date: {flightDetails.date}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-center text-white/60 p-6">
          <p>🖱️ Click and drag to rotate • 🔍 Scroll to zoom • 📱 Use mouse/touch to explore</p>
        </div>
      </div>
    </>
  );
}