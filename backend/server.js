import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initialShipments, initialAlerts, initialRiskEvents } from './data/mockData.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data store (temporarily simulating a database)
let shipments = [...initialShipments];
let alerts = [...initialAlerts];
let events = [...initialRiskEvents];

// --- Routes ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'RouteGuard API is running' });
});

// Get all shipments
app.get('/api/shipments', (req, res) => {
  res.json(shipments);
});

// Get all alerts
app.get('/api/alerts', (req, res) => {
  res.json(alerts);
});

// Get all events
app.get('/api/events', (req, res) => {
  res.json(events);
});

// Future endpoint structure placeholder for Phase 1
// app.post('/api/ingest', async (req, res) => {
//   // Logic to trigger data ingestion from connectors
// });

app.listen(PORT, () => {
  console.log(`🚀 RouteGuard Backend Server running on port ${PORT}`);
});
