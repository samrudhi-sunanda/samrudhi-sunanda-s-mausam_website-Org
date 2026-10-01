# Aakaash360: Spatial Atmospheric & Persona Intelligence Platform

Aakaash360 is a context-aware weather and environmental intelligence dashboard featuring a 28-persona routing matrix, adaptive Living Bento layout, 48-hour time machine scrubber, micro-climate route hazard analyzer, procedural ambient soundscapes, and Gemini AeroCopilot.

---

## 1. Quick Launch (Live in AI Studio)
The application is **already compiled and live** in your current AI Studio preview:
* **Development App**: Check the preview panel inside AI Studio.
* **Direct Web Access**: Open the development URL provided in your AI Studio header.

---

## 2. Launching Locally (Full-Stack React + Node.js)

### Prerequisites
* Node.js 18+ & npm

### Steps
```bash
# 1. Install dependencies
npm install

# 2. Start the development server (runs full-stack Express + Vite on port 3000)
npm run dev

# 3. Open in your browser
# http://localhost:3000
```

### Production Build
```bash
npm run build
npm start
```

---

## 3. Launching the Python Backend (FastAPI + APScheduler)

If you are integrating the Python backend into your architecture:

### Prerequisites
* Python 3.10+

### Steps
```bash
# 1. Navigate to the backend folder
cd backend

# 2. (Optional) Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install requirements
pip install -r requirements.txt

# 4. Start the FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
* **Interactive API Documentation (Swagger)**: Visit `http://localhost:8000/docs`
* **Health Endpoint**: `http://localhost:8000/api/v1/health`

### Starting the Background Notification Worker (APScheduler)
In a separate terminal:
```bash
cd backend
python scheduler.py
```
This starts the background daemon evaluating 20:00 night-before intelligence alerts and 06:00 morning readiness operational dispatches.

---

## 4. Key Endpoints & Architecture
* `GET /api/v1/personas`: 28-profile matrix with high-priority pinned parameters.
* `GET /api/v1/weather/telemetry`: Persona-weighted Open-Meteo atmospheric telemetry.
* `POST /api/v1/routes/analyze-hazard`: Micro-climate route crosswind and departure optimization.
* `GET /api/v1/simulation/time-machine`: 48-hour timeline scrubber simulation generator.
