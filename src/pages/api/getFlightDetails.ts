import { NextApiRequest, NextApiResponse } from 'next';

// Mock database for flight details
const flightDatabase = [
  {
    flightNumber: 'AB123',
    date: '2025-06-22',
    from: { lat: 40.7128, lng: -74.0060, city: 'New York' },
    to: { lat: 51.5074, lng: -0.1278, city: 'London' },
  },
  {
    flightNumber: 'CD456',
    date: '2025-06-22',
    from: { lat: 34.0522, lng: -118.2437, city: 'Los Angeles' },
    to: { lat: 35.6895, lng: 139.6917, city: 'Tokyo' },
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { flightNumber, date } = req.query;

    if (!flightNumber || !date) {
      return res.status(400).json({ error: 'Flight number and date are required' });
    }

    const flight = flightDatabase.find(
      (f) => f.flightNumber === flightNumber && f.date === date
    );

    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    return res.status(200).json(flight);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
