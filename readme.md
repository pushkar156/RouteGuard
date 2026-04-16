# 🛡️ RouteGuard: AI-Powered Logistics Intelligence

> **"We convert real-world events into actionable logistics decisions in real time using AI."**

RouteGuard is not just another dashboard. It is a sophisticated **data pipeline + decision engine** designed to safeguard global supply chains. By transforming messy, unstructured real-world signals into structured, geolocated risks, RouteGuard provides logistics managers with the foresight and decision-making power needed to navigate a volatile world.

---

## 🧠 Core Philosophy
At its heart, RouteGuard processes the "Pulse of the World" through a specialized loop:

**World Events** → **AI Processing** → **Structured Risks** → **Geo-Intelligence** → **Risk Scoring** → **Autonomous Action**

---

## 🔁 The Full System Flow

The system operates in a continuous cycle, ensuring that every shipment is monitored against the latest global developments:

1.  **Ingestion**: Pulls raw data from GNews (unrest/strikes), OpenWeather (storms), and Port APIs (congestion).
2.  **AI Extraction**: Gemini converts unstructured text (articles/alerts) into precise JSON data.
3.  **Geo-Matching**: Evaluates if events are within a critical radius (e.g., 200km) of any shipment waypoint.
4.  **Risk Scoring**: Combines severity, proximity, and event type into a single "Risk Score" (0–100).
5.  **Decision & Action**: High-risk scores trigger automated alerts and AI-suggested rerouting options.

---

## 🧩 Architecture Layers

### 1. 🟢 Data Ingestion Layer
The "Nervous System" of the project. It scans the horizon every 15 minutes for signals:
- **Sources**: Global News feeds, Weather alerts, and Port disruption APIs.
- **Output**: A raw repository of potential disruptions.

### 2. 🟣 AI Risk Engine (The Heart)
Powered by **Google Gemini**, this layer replaces traditional, rigid NLP pipelines. 
- **The Innovation**: Gemini acts as a supply chain analyst, extracting meaning and context rather than just scanning for keywords.
- **Structured Output**:
  ```json
  {
    "location": "Rotterdam Port",
    "lat": 51.9,
    "lng": 4.5,
    "risk_type": "port_strike",
    "severity": 4,
    "summary": "Industrial action expected to halt operations for 48 hours."
  }
  ```

### 3. 🟠 Geo-Matching & Logic
The "Spatial Brain" that answers the critical question: *"Does this event affect MY shipments?"*
- **Mechanism**: Calculates distances between event coordinates and shipment polyline waypoints.

### 4. 🔴 Risk Scoring & Action Layer
The "Commander" that decides when to bark and when to bite.
- **Logic**: `Score = Severity * Weight * Proximity_Factor`
- **Actions**:
  - **Low/Medium Risk**: Visual updates on the dashboard.
  - **High Risk (>70)**: Immediate Email/SMS alerts + Gemini-generated rerouting recommendations.

### 5. 🔵 Frontend Visualization
A premium interface that brings backend intelligence to life:
- **Interactive Map**: Real-time routes overlaid with risk hot-spots.
- **Intelligence Panel**: Detailed event summaries and "What-If" simulations.
- **Shipment Table**: High-level status monitoring with dynamic risk indicators.

---

## 🔥 Technical Excellence

> [!IMPORTANT]
> **Gemini Extraction Pipeline**: By using Gemini for data extraction, we eliminate the need for costly ML training and massive datasets. This allows the system to work on messy, real-world data and adapt to any domain instantly.

- **Resilient AI**: Implements strict JSON validation and retry logic for AI outputs.
- **Production-Ready**: A clear three-layer separation ensures the backend can evolve independently of the UI.
- **Actionable Insight**: We don't just show data; we suggest the *next best action*.
