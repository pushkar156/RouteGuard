import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initialShipments, initialAlerts, initialRiskEvents } from './data/mockData.js';
import { fetchGNewsArticles } from './connectors/gnews.js';
import { isRelevant } from './utils/filter.js';
import { extractRiskFromArticle } from './services/gemini.js';

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
// To store raw filtered articles ready to be sent to Gemini in Phase 2
let pendingRawSignals = [];

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
  
  res.json({
    message: 'Finished AI processing.',
    processed: processedCount,
    extracted_events: newEvents.length,
    newEvents
  });
});

app.listen(PORT, () => {
  console.log(`🚀 RouteGuard Backend Server running on port ${PORT}`);
});
