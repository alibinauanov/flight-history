import type { NextApiRequest, NextApiResponse } from 'next';
import { mockFlights } from '../../data/flightDatabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { flightNumber, date } = req.query;
  if (!flightNumber || !date) {
    return res.status(400).json({ error: 'Flight number and date are required' });
  }

  // First try mock database
  const mockFlight = (mockFlights as any)[flightNumber as string]?.[date as string];
  if (mockFlight) {
    return res.status(200).json({
      from: mockFlight.departure,
      to: mockFlight.arrival,
      flightNumber,
      date,
      source: 'mock'
    });
  }

  // Fallback to real API
  const apiKey = '83b3e836f0383db4391101a2e5a28ccb';
  const apiUrl = `http://api.aviationstack.com/v1/flights?flight_iata=${flightNumber}&flight_date=${date}&access_key=${apiKey}`;
  
  try {
    console.log('Fetching from URL:', apiUrl);
    const response = await fetch(apiUrl);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      return res.status(404).json({
        error: `Flight ${flightNumber} not found for ${date}. Try: AA1234, BA123, LH456, QF1, or EK215`,
        availableFlights: Object.keys(mockFlights)
      });
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));

    if (data.error || !data.data || !data.data.length) {
      return res.status(404).json({ 
        error: `Flight ${flightNumber} not found for ${date}. Try: AA1234, BA123, LH456, QF1, or EK215`,
        availableFlights: Object.keys(mockFlights)
      });
    }

    const flight = data.data[0];
    if (!flight.departure || !flight.arrival || !flight.departure.latitude || !flight.arrival.latitude) {
      return res.status(404).json({ 
        error: "Flight coordinates not found",
        details: flight
      });
    }

    return res.status(200).json({
      from: {
        lat: parseFloat(flight.departure.latitude),
        lng: parseFloat(flight.departure.longitude),
        city: flight.departure.city,
        airport: flight.departure.airport,
        code: flight.departure.iata
      },
      to: {
        lat: parseFloat(flight.arrival.latitude),
        lng: parseFloat(flight.arrival.longitude),
        city: flight.arrival.city,
        airport: flight.arrival.airport,
        code: flight.arrival.iata
      },
      flightNumber,
      date,
      source: 'api'
    });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ 
      error: `Flight ${flightNumber} not found. Try: AA1234, BA123, LH456, QF1, or EK215`,
      availableFlights: Object.keys(mockFlights)
    });
  }
}
