# 🚚 FleetSafety Monitor: Real-Time Driver Drowsiness Detection System

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Java](https://img.shields.io/badge/Java-17-orange.svg) ![Spring
Boot](https://img.shields.io/badge/Spring%20Boot-3.3.2-brightgreen.svg)
![React](https://img.shields.io/badge/React-18.0-cyan.svg)
![Python](https://img.shields.io/badge/Python-3.11-yellow.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green.svg)

**FleetSafety Monitor** is an end-to-end industrial platform designed
for accident prevention in transport fleets. The system processes video
in real time from the vehicle cabin using Edge AI (Computer Vision) to
detect fatigue/drowsiness patterns through Eye Aspect Ratio (EAR)
calculations, persists incidents in MongoDB, and streams alerts in real
time to a web control tower via WebSockets.

------------------------------------------------------------------------

## 📐 System Architecture

``` text
 ┌─────────────────────────────────────────────────────────────────┐
 │                        VEHICLE (EDGE)                           │
 │                                                                 │
 │   [ IR Camera ] ──► [ Python Script + OpenCV / MediaPipe ]      │
 │                                   │                             │
 │                         EAR Calculation < Threshold             │
 │                                   │                             │
 │                            POST /api/v1/events                  │
 └───────────────────────────────────┬─────────────────────────────┘
                                     │ HTTP / JSON (UTC)
                                     ▼
 ┌─────────────────────────────────────────────────────────────────┐
 │                      CENTRAL BACKEND (CLOUD)                    │
 │                                                                 │
 │             [ Spring Boot 3.3.2 + Spring Data MongoDB ]         │
 │                                   │                             │
 │                            STOMP over WebSocket                 │
 │                                   │                             │
 └───────────────────────────────────┬─────────────────────────────┘
                                     │ /topic/alerts
                                     ▼
 ┌─────────────────────────────────────────────────────────────────┐
 │                        CONTROL TOWER (WEB)                      │
 │                                                                 │
 │          [ React + Vite + Tailwind CSS + Web Audio API ]        │
 │              (Live visual & emergency audio alerts)             │
 └─────────────────────────────────────────────────────────────────┘
```

------------------------------------------------------------------------

## ✨ Key Features

-   **Edge Computer Vision:** Lightweight video processing using OpenCV
    and MediaPipe to detect facial landmarks and monitor prolonged eye
    closure.
-   **Real-Time Responsiveness:** Instant event broadcasting through
    WebSockets (STOMP broker) without requiring page reloads.
-   **NoSQL Persistence:** Optimized incident history stored in MongoDB
    for post-incident analysis and driver risk profiling.
-   **Visual & Audio Alerts:** Reactive dashboard built with Tailwind
    CSS that displays emergency banners and plays browser alarms using
    the Web Audio API.
-   **Flexible REST API:** REST endpoints for fleet metrics, event
    registration, and historical incident management.

------------------------------------------------------------------------

## 🛠️ Tech Stack

### Edge / Computer Vision (Python)

-   Python 3.11+
-   OpenCV
-   MediaPipe / Dlib
-   Requests
-   Datetime (UTC)

### Backend (Java)

-   Java 17
-   Spring Boot 3.3.2
-   Spring Data MongoDB
-   Spring WebSocket (STOMP + SockJS)
-   Gradle 8.10
-   Lombok

### Frontend (React)

-   React 18 + Vite
-   Tailwind CSS
-   STOMPjs
-   SockJS Client
-   Lucide React

------------------------------------------------------------------------

## 📂 Repository Structure

``` text
fleet-safety-monitor/
├── vision-edge/               # Camera & Computer Vision script (Python)
├── fleet-backend/             # REST API & WebSocket Broker (Spring Boot)
└── vision-frontend/           # Real-Time Dashboard (React + Vite + Tailwind)
```

------------------------------------------------------------------------

## ⚙️ Setup & Installation

### 1. Prerequisites

-   Java Development Kit (JDK) 17
-   Node.js v18+ and npm
-   Python 3.10+
-   MongoDB Community Server running on `localhost:27017`

### 2. Database Setup (MongoDB)

Create the `fleet_safety_db` database and import the `drowsiness_events`
collection using the provided JSON sample.

### 3. Run Backend (Spring Boot)

``` bash
cd fleet-backend
./gradlew bootRun
```

Server: `http://localhost:8080`

WebSocket endpoint:

``` text
ws://localhost:8080/ws-fleet
```

### 4. Run Frontend (React)

``` bash
cd vision-frontend
npm install
npm run dev
```

Open:

``` text
http://localhost:5173
```

Click **🔔 Test Alarm** once to allow browser audio permissions.

### 5. Run Computer Vision Module (Python)

``` bash
cd vision-edge
pip install opencv-python mediapipe requests
python detector.py
```

Closing your eyes longer than the configured threshold (1.5 seconds)
automatically sends an HTTP POST request to the backend and instantly
broadcasts an alert to every connected dashboard.

------------------------------------------------------------------------

## 📡 Sample Event Payload

``` json
{
  "vehicleId": "BUS-104",
  "driverId": "DRIVER-882",
  "earValue": 0.142,
  "durationSeconds": 2.15,
  "timestamp": "2026-08-02T03:15:22Z",
  "status": "CRITICAL"
}
```
