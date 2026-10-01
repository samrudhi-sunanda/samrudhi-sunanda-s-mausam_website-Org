import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // Check Gemini API key
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Health & diagnostics
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(apiKey),
      platform: 'Mausam Spatial Atmospheric Intelligence',
      timestamp: new Date().toISOString(),
    });
  });

  // AeroCopilot Chat endpoint
  app.post('/api/aeropilot/chat', async (req, res) => {
    const { messages, telemetry, promptType } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const latestUserMessage = messages[messages.length - 1]?.content || 'Analyze current atmospheric telemetry.';

    // Construct telemetry contextual brief
    let telemetryBrief = 'No live telemetry provided.';
    if (telemetry) {
      telemetryBrief = `
CURRENT LOCATION: ${telemetry.city || 'Unknown'}, ${telemetry.country || ''} (${telemetry.latitude?.toFixed(2)}°N, ${telemetry.longitude?.toFixed(2)}°E, Alt: ${telemetry.elevation || 0}m)
LOCAL TIME: ${telemetry.timezone || 'UTC'}
TEMPERATURE: ${telemetry.temperature ?? 'N/A'}°C (Feels like: ${telemetry.apparentTemperature ?? 'N/A'}°C)
MAX / MIN TODAY: ${telemetry.tempMax ?? 'N/A'}°C / ${telemetry.tempMin ?? 'N/A'}°C
RELATIVE HUMIDITY: ${telemetry.humidity ?? 'N/A'}%
SURFACE PRESSURE: ${telemetry.surfacePressure ?? 'N/A'} hPa (Sea level: ${telemetry.pressure ?? 'N/A'} hPa)
WIND SPEED: ${telemetry.windSpeed ?? 'N/A'} km/h (${telemetry.windSpeedKnots ?? 'N/A'} kts)
WIND GUSTS: ${telemetry.windGusts ?? 'N/A'} km/h
WIND DIRECTION: ${telemetry.windDirection ?? 'N/A'}° (${telemetry.windCardinal ?? 'N/A'})
PRECIPITATION: ${telemetry.precipitation ?? 0} mm (Probability: ${telemetry.precipitationProbability ?? 0}%)
CLOUD COVER: ${telemetry.cloudCover ?? 0}% (High: ${telemetry.cloudCoverHigh ?? 0}%, Mid: ${telemetry.cloudCoverMid ?? 0}%, Low: ${telemetry.cloudCoverLow ?? 0}%)
UV INDEX: ${telemetry.uvIndex ?? 'N/A'} (Direct radiation: ${telemetry.directRadiation ?? 'N/A'} W/m²)
VISIBILITY: ${telemetry.visibility ? (telemetry.visibility / 1000).toFixed(1) + ' km' : 'N/A'}
AIR QUALITY INDEX (European AQI): ${telemetry.europeanAqi ?? 'N/A'} (US AQI: ${telemetry.usAqi ?? 'N/A'})
PM2.5: ${telemetry.pm2_5 ?? 'N/A'} µg/m³ | PM10: ${telemetry.pm10 ?? 'N/A'} µg/m³
NO2: ${telemetry.nitrogenDioxide ?? 'N/A'} µg/m³ | OZONE: ${telemetry.ozone ?? 'N/A'} µg/m³ | SO2: ${telemetry.sulphurDioxide ?? 'N/A'} µg/m³
WEATHER CODE DESCRIPTION: ${telemetry.weatherCondition || 'Normal'}
ACTIVE ANOMALIES/ALERTS: ${(telemetry.activeAlerts && telemetry.activeAlerts.length > 0) ? telemetry.activeAlerts.map((a: any) => `${a.title} (${a.severity})`).join('; ') : 'None detected'}
`;
    }

    const systemInstruction = `You are AeroCopilot, the spatial atmospheric intelligence co-pilot for Mausam.
You analyze real-time meteorological and atmospheric telemetry from the Open-Meteo API.
Your expertise spans:
- Synoptic and mesoscale meteorology
- Aviation flight readiness, drone UAV parameters, and crosswind wind shear analysis
- Outdoor operations, marathon/athletic physiological stress, and heat/cold indices
- Dispersion modeling, aerosol particulate dynamics, and respiratory health thresholds
- Kinetic wind dial vector physics (Beaufort scale, directional shear, pressure gradient flow)

Guidelines:
1. Always incorporate and cite the specific numerical values from the live telemetry above.
2. Structure your assessment with clear sections:
   - **Executive Atmospheric Brief**: 2-3 concise summary sentences.
   - **Kinetic Vector & Aerodynamics**: Evaluation of wind velocity, turbulence, and gusts.
   - **Thermodynamic & Air Mass State**: Temp, humidity, pressure tendency, cloud layers.
   - **Aerosol & Radiation Advisory**: AQI, PM2.5, UV exposure limits.
   - **Operational Safety Clearance**: Aviation/drone/maritime/outdoor safety tier (Optimal, Caution, Marginal, or Prohibited) with concrete precautions.
3. Be authoritative, scientific, and actionable. Never hallucinate weather facts when live values are provided.
4. Keep explanations crisp without excessive fluff. Use clean markdown.`;

    try {
      if (ai) {
        // Build conversation contents
        const contents: any[] = [];
        // Include previous history (up to last 6 messages)
        const historySlice = messages.slice(-6);
        for (const msg of historySlice) {
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
          });
        }

        // Add telemetry context to the prompt if not already in system instruction
        const promptWithContext = `Telemetry Context:\n${telemetryBrief}\n\nUser Question:\n${latestUserMessage}`;
        
        // Update the last user message to include telemetry context
        if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
          contents[contents.length - 1].parts = [{ text: promptWithContext }];
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
            topP: 0.95,
          },
        });

        const replyText = response.text || 'Atmospheric telemetry synthesized. No deviations noted.';
        return res.json({
          reply: replyText,
          model: 'gemini-3.8-flash',
          timestamp: new Date().toISOString(),
        });
      } else {
        // Fallback meteorological synthesis when API key is not yet set
        const simulatedReply = generateAlgorithmicAeroBrief(telemetry, latestUserMessage, promptType);
        return res.json({
          reply: simulatedReply,
          model: 'aerocopilot-rule-engine-v1',
          timestamp: new Date().toISOString(),
          note: 'Telemetry analyzed via AeroCopilot on-board meteorological heuristics.',
        });
      }
    } catch (err: any) {
      console.error('Gemini AeroCopilot API error:', err);
      // Deterministic fallback response with real telemetry data
      const simulatedReply = generateAlgorithmicAeroBrief(telemetry, latestUserMessage, promptType);
      return res.json({
        reply: `${simulatedReply}\n\n*(Telemetry processed via On-board AeroCopilot Engine)*`,
        model: 'aerocopilot-rule-engine-fallback',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Proxy for Open-Meteo to guarantee zero-CORS issues and server-side caching if required
  app.get('/api/weather/forecast', async (req, res) => {
    try {
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?${queryString}`;
      const response = await fetch(openMeteoUrl);
      if (!response.ok) {
        return res.status(response.status).json({ error: `Open-Meteo returned status ${response.status}` });
      }
      const data = await response.json();
      res.setHeader('Cache-Control', 'public, max-age=180');
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/weather/air-quality', async (req, res) => {
    try {
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      const openMeteoUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?${queryString}`;
      const response = await fetch(openMeteoUrl);
      if (!response.ok) {
        return res.status(response.status).json({ error: `Open-Meteo Air Quality returned status ${response.status}` });
      }
      const data = await response.json();
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Mausam Platform] Atmospheric server running on http://0.0.0.0:${PORT}`);
  });
}

// Algorithmic meteorological intelligence engine
function generateAlgorithmicAeroBrief(telemetry: any, query: string, promptType?: string): string {
  const city = telemetry?.city || 'Selected Station';
  const temp = telemetry?.temperature ?? 21;
  const wind = telemetry?.windSpeed ?? 14;
  const gusts = telemetry?.windGusts ?? 22;
  const dir = telemetry?.windCardinal ?? 'NW';
  const degrees = telemetry?.windDirection ?? 315;
  const aqi = telemetry?.europeanAqi ?? 35;
  const pm25 = telemetry?.pm2_5 ?? 12;
  const pressure = telemetry?.pressure ?? 1014;
  const uv = telemetry?.uvIndex ?? 4;
  const hum = telemetry?.humidity ?? 55;

  let windRating = 'Calm to Gentle Breeze';
  let flightClearance = 'CLEAR / GO';
  if (wind > 35 || gusts > 50) {
    windRating = 'Strong Gale / High Shear';
    flightClearance = 'PROHIBITED / NO-GO for light UAVs and gliders';
  } else if (wind > 22 || gusts > 35) {
    windRating = 'Moderate to Fresh Breeze';
    flightClearance = 'CAUTION - Compensate for crosswinds';
  }

  let airQualityAssessment = 'Good / Minimal Particulate Hazard';
  if (aqi > 80 || pm25 > 50) {
    airQualityAssessment = 'Unhealthy / Significant particulate density. Sensitive groups reduce prolonged outdoor exertion.';
  } else if (aqi > 50 || pm25 > 25) {
    airQualityAssessment = 'Moderate / Acceptable air mass, slight hazing observed.';
  }

  return `### Atmospheric Telemetry Assessment: ${city}

**Executive Brief**
The atmospheric column over **${city}** exhibits **${telemetry?.weatherCondition || 'nominal conditions'}** at **${temp}°C** with relative humidity at **${hum}%**. Barometric pressure stands at **${pressure} hPa**, indicating stable mesoscale equilibrium.

---

### Kinetic Vector & Aerodynamics
* **Vector Heading**: ${degrees}° (${dir}) at **${wind} km/h**
* **Peak Gust Energy**: **${gusts} km/h**
* **Turbulence Assessment**: ${windRating}. Kinetic wind dial indicates stable laminar airflow with moderate thermal eddies.

---

### Thermodynamic & Air Mass State
* **Ambient Air**: ${temp}°C (Apparent Feels-Like: ${telemetry?.apparentTemperature ?? temp}°C)
* **Relative Humidity**: ${hum}% | **Dew Point Spread**: ~${Math.max(1, Math.round(temp - ((100 - hum) / 5)))}°C
* **Barometric Pressure**: ${pressure} hPa (Mean Sea Level)

---

### Aerosol & Radiative Index
* **European Air Quality Index**: **${aqi}** (${airQualityAssessment})
* **PM2.5 Density**: **${pm25} µg/m³**
* **Solar UV Index**: **${uv}** (${uv >= 6 ? 'High solar irradiance — skin photoprotection advised' : 'Moderate to Low solar irradiance'})

---

### Operational Clearance
* **Aero & Drone Flight Status**: **${flightClearance}**
* **Outdoor Physical Strenuous Activity**: ${aqi > 70 ? 'Moderate intensity suggested' : 'Unrestricted'}.
* **Actionable Guidance**: Maintain situational awareness of convective gust fronts if approaching squall lines develop.`;
}

startServer().catch((err) => {
  console.error('Failed to start Mausam server:', err);
  process.exit(1);
});
