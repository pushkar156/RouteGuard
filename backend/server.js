import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialShipments, initialAlerts, initialRiskEvents } from './data/mockData.js';
import { fetchGNewsArticles } from './connectors/gnews.js';
import { isRelevant } from './utils/filter.js';
import { extractRiskFromArticle } from './services/gemini.js';
import { updateAllShipmentScores } from './services/scoring.js';
import { evaluateShipmentAlerts } from './services/alerts.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATE_FILE = path.join(__dirname, 'data', 'state.json');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data store (Initialised from state.json if exists)
let shipments = [...initialShipments];
let alerts = [...initialAlerts];
let events = [...initialRiskEvents];
let pendingRawSignals = [];

// Persistence Helpers
const saveState = () => {
  try {
    const data = JSON.stringify({ events, alerts }, null, 2);
    // Ensure data directory exists
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STATE_FILE, data);
  } catch (err) {
    console.error('Failed to save state:', err);
  }
};

const loadState = () => {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      events = data.events || [...initialRiskEvents];
      alerts = data.alerts || [...initialAlerts];
      console.log(`✅ Loaded ${events.length} events and ${alerts.length} alerts from state.json`);
    }
  } catch (err) {
    console.warn('Could not load state, using defaults:', err);
  }
};

// Start the engine with saved data
loadState();

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

// Get all pending raw signals (for debugging/visibility)
app.get('/api/signals/pending', (req, res) => {
  res.json({ count: pendingRawSignals.length, signals: pendingRawSignals });
});

// ✅ Bug #5 Fixed: Persist alert resolution to backend
app.patch('/api/alerts/:id/resolve', (req, res) => {
  const alert = alerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found.' });
  alert.resolved = true;
  saveState();
  res.json({ success: true, alertId: req.params.id });
});

// ✅ Demo Super-Button: One click to rule them all
app.post('/api/run-pipeline', async (req, res) => {
  try {
    console.log("🚀 Manual Pipeline Triggered...");
    // 1. Ingest
    const ingestRes = await fetch(`http://localhost:${PORT}/api/ingest`, { method: 'POST' });
    // 2. Process
    const processRes = await fetch(`http://localhost:${PORT}/api/process-signals`, { method: 'POST' });
    const data = await processRes.json();
    
    res.json({ 
      success: true, 
      message: "End-to-end pipeline finished.",
      stats: data.metadata 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ingest', async (req, res) => {
  // ... (ingestion logic remains intact) ...
  try {
    console.log('🔄 Triggering ingestion pipeline...');
    const rawArticles = await fetchGNewsArticles();
    console.log(`📰 Fetched ${rawArticles.length} raw articles from GNews.`);

    const filteredArticles = rawArticles.filter(isRelevant);
    console.log(`🎯 ${filteredArticles.length} articles passed relevance filter.`);

    let newSignalsCount = 0;
    filteredArticles.forEach(article => {
      const isDuplicate = pendingRawSignals.some(s => s.title === article.title);
      if (!isDuplicate) {
        pendingRawSignals.push(article);
        newSignalsCount++;
      }
    });

    console.log(`✅ Queued ${newSignalsCount} new signals for AI extraction.`);
    res.json({
      message: 'Ingestion completed successfully.',
      metadata: { raw_fetched: rawArticles.length, passed_filter: filteredArticles.length, new_queued: newSignalsCount }
    });
  } catch (err) {
    console.error('❌ Ingestion Error:', err);
    res.status(500).json({ error: 'Failed to complete ingestion process' });
  }
});

// Phase 2: Process Pending Signals through Gemini
app.post('/api/process-signals', async (req, res) => {
  if (pendingRawSignals.length === 0) {
    return res.json({ message: 'No pending signals to process.', processed: 0 });
  }

  console.log(`🧠 Sending ${pendingRawSignals.length} signals to Gemini for extraction...`);
  
  let processedCount = 0;
  let newEvents = [];

  // For MVP, we process them sequentially to avoid rate limits
  for (const article of pendingRawSignals) {
    try {
        const riskData = await extractRiskFromArticle(article);
        
        // If Gemini determined it's actually relevant and successfully extracted data
        if (riskData.relevant !== false && riskData.lat !== undefined) {
             const newEvent = {
                 id: `E-AI-${Date.now()}-${Math.floor(Math.random()*1000)}`,
                 lat: riskData.lat,
                 lng: riskData.lng,
                 type: riskData.risk_type || 'unknown',
                 severity: riskData.severity === 5 ? 'critical' : riskData.severity >= 4 ? 'high' : riskData.severity >= 3 ? 'medium' : 'low',
                 title: article.title,
                 desc: riskData.summary,
                 source: article.source?.name,
             };
             newEvents.push(newEvent);
             events.push(newEvent); // Add to our simulated database
        }
        processedCount++;
    } catch (error) {
        console.error(`Skipping article due to AI parsing error.`);
    }
  }

  // Clear the queue
  pendingRawSignals = [];
  
  // Phase 3: Spatial Intelligence triggering!
  // Run the geo-matching and scoring algorithm on all active shipments
  console.log('🌍 Activating Spatial Brain: Re-scoring all shipments against live events...');
  shipments = updateAllShipmentScores(shipments, events);
  console.log('✅ Shipment risk scores updated successfully.');

  // Check if the rescored shipments breached the threshold to generate an alert
  console.log('🔔 Evaluating shipments for threshold breaches...');
  const alertEvaluation = await evaluateShipmentAlerts(shipments, alerts);
  if (alertEvaluation.newAlerts.length > 0) {
    alerts = alertEvaluation.updatedAlertsList;
    shipments = alertEvaluation.updatedShipments; // Capture the AI-suggested paths
    console.log(`📡 Broadcasted ${alertEvaluation.newAlerts.length} new actionable alerts.`);
  }

  saveState();

  res.json({
    message: 'Finished AI processing and Geo-Matching.',
    processed: processedCount,
    extracted_events: newEvents.length,
    newEvents,
    shipments_updated: true,
    alerts_generated: alertEvaluation.newAlerts.length
  });
});

// Phase 4: What-If Simulator Hook
// Accepts a manual mock event, computes its risk on the fly without saving to DB permanently
app.post('/api/simulate', async (req, res) => {
  const manualEvent = req.body.event;
  if (!manualEvent) return res.status(400).json({ error: 'Missing event payload.' });

  console.log(`🕹️ Running What-If Simulation for: ${manualEvent.type} at ${manualEvent.lat}, ${manualEvent.lng}`);
  
  // Clone current shipments to avoid mutating live data
  let simShipments = JSON.parse(JSON.stringify(shipments));
  
  // Run the geo score against ONLY this simulated event
  simShipments = updateAllShipmentScores(simShipments, [manualEvent]);
  
  // We don't save the simEvent or simAlerts to the real system, just return what WOULD happen
  const simAlertsData = await evaluateShipmentAlerts(simShipments, alerts);

  res.json({
    simulatedShipments: simShipments,
    simulatedNewAlerts: simAlertsData.newAlerts
  });
});

app.listen(PORT, () => {
  console.log(`🚀 RouteGuard Backend Server running on port ${PORT}`);
});
