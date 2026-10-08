# 🚚 FleetSafety Monitor: Sistema de Detección de Somnolencia de Conductores en Tiempo Real

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Java](https://img.shields.io/badge/Java-17-orange.svg) ![Spring
Boot](https://img.shields.io/badge/Spring%20Boot-3.3.2-brightgreen.svg)
![React](https://img.shields.io/badge/React-18.0-cyan.svg)
![Python](https://img.shields.io/badge/Python-3.11-yellow.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green.svg)

**FleetSafety Monitor** es una plataforma industrial de extremo a extremo
diseñada para la prevención de accidentes en flotas de transporte. El
sistema procesa video en tiempo real desde la cabina del vehículo usando
Edge AI (Visión por Computadora) para detectar patrones de fatiga y
somnolencia mediante el cálculo del Eye Aspect Ratio (EAR, relación de
aspecto del ojo), guarda los incidentes en MongoDB y transmite alertas en
tiempo real a una torre de control web mediante WebSockets.

------------------------------------------------------------------------

## 📐 Arquitectura del Sistema

``` text
 ┌─────────────────────────────────────────────────────────────────┐
 │                        VEHÍCULO (EDGE)                          │
 │                                                                 │
 │   [ Cámara IR ] ──► [ Script Python + OpenCV / MediaPipe ]      │
 │                                   │                             │
 │                      Cálculo de EAR < Umbral                    │
 │                                   │                             │
 │                            POST /api/v1/events                  │
 └───────────────────────────────────┬─────────────────────────────┘
                                     │ HTTP / JSON (UTC)
                                     ▼
 ┌─────────────────────────────────────────────────────────────────┐
 │                   BACKEND CENTRAL (NUBE)                        │
 │                                                                 │
 │             [ Spring Boot 3.3.2 + Spring Data MongoDB ]         │
 │                                   │                             │
 │                            STOMP sobre WebSocket                │
 │                                   │                             │
 └───────────────────────────────────┬─────────────────────────────┘
                                     │ /topic/alerts
                                     ▼
 ┌─────────────────────────────────────────────────────────────────┐
 │                    TORRE DE CONTROL (WEB)                       │
 │                                                                 │
 │          [ React + Vite + Tailwind CSS + Web Audio API ]        │
 │       (Alertas visuales y de audio de emergencia en vivo)       │
 └─────────────────────────────────────────────────────────────────┘
```

------------------------------------------------------------------------

## ✨ Características Principales

-   **Visión por Computadora en el Edge:** Procesamiento de video ligero
    usando OpenCV y MediaPipe para detectar puntos de referencia faciales
    y monitorear el cierre prolongado de los ojos.
-   **Respuesta en Tiempo Real:** Transmisión instantánea de eventos
    mediante WebSockets (broker STOMP) sin necesidad de recargar la
    página.
-   **Persistencia NoSQL:** Historial de incidentes optimizado y
    almacenado en MongoDB para el análisis posterior a los incidentes y
    la elaboración de perfiles de riesgo de los conductores.
-   **Alertas Visuales y de Audio:** Panel reactivo construido con
    Tailwind CSS que muestra banners de emergencia y reproduce alarmas en
    el navegador mediante la Web Audio API.
-   **API REST Flexible:** Endpoints REST para métricas de la flota,
    registro de eventos y gestión del historial de incidentes.

------------------------------------------------------------------------

## 🛠️ Stack Tecnológico

### Edge / Visión por Computadora (Python)

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

## 📂 Estructura del Repositorio

``` text
fleet-safety-monitor/
├── vision-edge/               # Cámara y script de visión por computadora (Python)
├── fleet-backend/             # API REST y broker WebSocket (Spring Boot)
└── vision-frontend/           # Panel en tiempo real (React + Vite + Tailwind)
```

------------------------------------------------------------------------

## ⚙️ Configuración e Instalación

### 1. Requisitos Previos

-   Java Development Kit (JDK) 17
-   Node.js v18+ y npm
-   Python 3.10+
-   MongoDB Community Server ejecutándose en `localhost:27017`

### 2. Configuración de la Base de Datos (MongoDB)

Crea la base de datos `fleet_safety_db` e importa la colección
`drowsiness_events` usando el JSON de ejemplo incluido.

### 3. Ejecutar el Backend (Spring Boot)

``` bash
cd fleet-backend
./gradlew bootRun
```

Servidor: `http://localhost:8080`

Endpoint de WebSocket:

``` text
ws://localhost:8080/ws-fleet
```

### 4. Ejecutar el Frontend (React)

``` bash
cd vision-frontend
npm install
npm run dev
```

Abre:

``` text
http://localhost:5173
```

Haz clic una vez en **🔔 Test Alarm** para permitir los permisos de audio
del navegador.

### 5. Ejecutar el Módulo de Visión por Computadora (Python)

``` bash
cd vision-edge
pip install opencv-python mediapipe requests
python detector.py
```

Si cierras los ojos por más tiempo que el umbral configurado (1.5
segundos), se envía automáticamente una petición HTTP POST al backend y se
transmite al instante una alerta a todos los paneles conectados.

------------------------------------------------------------------------

## 📡 Ejemplo de Payload de Evento

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
