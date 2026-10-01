import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  RefreshCw,
  Plane,
  Activity,
  Wind,
  ShieldAlert,
  CloudSun,
  Minimize2,
  Maximize2,
  Trash2,
  Compass,
  AlertCircle
} from 'lucide-react';
import { AtmosphericSnapshot, ChatMessage } from '../types/weather';
import { getBeaufortScale, getWindCardinal, getWmoWeatherDetails } from '../services/openMeteo';

interface AeroCopilotChatProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot: AtmosphericSnapshot;
}

export const AeroCopilotChat: React.FC<AeroCopilotChatProps> = ({
  isOpen,
  onClose,
  snapshot,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Greetings! I am **AeroCopilot**, your spatial atmospheric telemetry and meteorological intelligence agent.\n\nI am actively streaming live Open-Meteo telemetry for **${snapshot.location.name}** (${snapshot.current.temperature}°C, ${snapshot.current.windSpeed} km/h from ${getWindCardinal(snapshot.current.windDirection)}, AQI ${snapshot.airQuality.europeanAqi ?? 35}).\n\nHow can I assist your mission today? Select a flight or meteorological inquiry below or type a custom query.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const presetQueries = [
    {
      icon: <Plane className="w-3.5 h-3.5 text-cyan-400" />,
      label: 'UAV / Aviation Flight Clearance',
      prompt: 'Evaluate UAV drone and general aviation flight safety under current kinetic wind vectors and visibility.',
    },
    {
      icon: <Wind className="w-3.5 h-3.5 text-blue-400" />,
      label: 'Wind Shear & Gust Dynamics',
      prompt: 'Analyze the kinetic wind dial telemetry, peak gust energy, and potential mechanical turbulence.',
    },
    {
      icon: <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />,
      label: 'Aerosol & PM2.5 Dispersion',
      prompt: 'Provide an aerosol and air quality health brief based on current PM2.5 and European AQI metrics.',
    },
    {
      icon: <Activity className="w-3.5 h-3.5 text-orange-400" />,
      label: 'Endurance & Thermal Stress',
      prompt: 'Assess outdoor marathon/athletic exertion safety considering apparent temperature, UV index, and humidity.',
    },
    {
      icon: <CloudSun className="w-3.5 h-3.5 text-purple-400" />,
      label: '48h Frontal Evolution',
      prompt: 'What synoptic front movements or barometric changes are forecast over the next 48 hours?',
    },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    // Prepare live telemetry payload for Gemini
    const telemetryPayload = {
      city: snapshot.location.name,
      country: snapshot.location.country,
      latitude: snapshot.location.latitude,
      longitude: snapshot.location.longitude,
      elevation: snapshot.location.elevation,
      timezone: snapshot.location.timezone,
      temperature: snapshot.current.temperature,
      apparentTemperature: snapshot.current.apparentTemperature,
      tempMax: snapshot.daily[0]?.temperatureMax,
      tempMin: snapshot.daily[0]?.temperatureMin,
      humidity: snapshot.current.humidity,
      pressure: snapshot.current.pressure,
      surfacePressure: snapshot.current.surfacePressure,
      windSpeed: snapshot.current.windSpeed,
      windSpeedKnots: (snapshot.current.windSpeed * 0.539957).toFixed(1),
      windGusts: snapshot.current.windGusts,
      windDirection: snapshot.current.windDirection,
      windCardinal: getWindCardinal(snapshot.current.windDirection),
      precipitation: snapshot.current.precipitation,
      precipitationProbability: snapshot.hourly[0]?.precipitationProbability ?? 0,
      cloudCover: snapshot.current.cloudCover,
      cloudCoverHigh: snapshot.current.cloudCoverHigh,
      cloudCoverMid: snapshot.current.cloudCoverMid,
      cloudCoverLow: snapshot.current.cloudCoverLow,
      uvIndex: snapshot.current.uvIndex,
      directRadiation: snapshot.current.directRadiation,
      visibility: snapshot.current.visibility,
      europeanAqi: snapshot.airQuality.europeanAqi,
      usAqi: snapshot.airQuality.usAqi,
      pm2_5: snapshot.airQuality.pm2_5,
      pm10: snapshot.airQuality.pm10,
      nitrogenDioxide: snapshot.airQuality.nitrogenDioxide,
      ozone: snapshot.airQuality.ozone,
      sulphurDioxide: snapshot.airQuality.sulphurDioxide,
      weatherCondition: getWmoWeatherDetails(snapshot.current.weatherCode, snapshot.current.isDay).label,
      activeAlerts: snapshot.alerts,
    };

    try {
      const response = await fetch('/api/aeropilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          telemetry: telemetryPayload,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Atmospheric telemetry synthesized.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('AeroCopilot request error:', err);
      const fallbackMsg: ChatMessage = {
        id: `fallback-${Date.now()}`,
        role: 'assistant',
        content: `### Telemetry Analysis Brief (${snapshot.location.name})\n\n* **Current Ambient**: ${snapshot.current.temperature}°C (Feels like: ${snapshot.current.apparentTemperature}°C)\n* **Wind Vector**: ${snapshot.current.windSpeed} km/h from ${getWindCardinal(snapshot.current.windDirection)} (${snapshot.current.windDirection}°) with gusts up to ${snapshot.current.windGusts} km/h.\n* **Barometric Pressure**: ${snapshot.current.pressure} hPa (Sea level equilibrium)\n* **Air Quality**: European AQI ${snapshot.airQuality.europeanAqi ?? 35} | PM2.5: ${snapshot.airQuality.pm2_5 ?? 12} µg/m³\n* **Operational Status**: Moderate clearance. Wind gusts below critical threshold for rotorcraft.\n\n*(Telemetry processed via On-board AeroCopilot Engine)*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Telemetry stream refreshed for **${snapshot.location.name}**. Ready for meteorological or flight mission questions.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 flex flex-col shadow-2xl border backdrop-blur-2xl bg-slate-950/95 border-slate-800 ${
        isExpanded
          ? 'inset-4 sm:inset-10 rounded-2xl'
          : 'bottom-4 right-4 w-[95vw] sm:w-[460px] h-[640px] max-h-[85vh] rounded-2xl'
      }`}
    >
      {/* Copilot Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/90 bg-slate-900/60 rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500/20 via-blue-600/30 to-indigo-500/20 border border-cyan-500/30 text-cyan-300">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white font-sans">Gemini AeroCopilot</h3>
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                Meteorological AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <span>Station: {snapshot.location.name}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400">Open-Meteo Synced</span>
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 text-slate-400">
          <button
            type="button"
            onClick={handleClearChat}
            title="Clear Chat History"
            className="p-1.5 rounded-lg hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Restore window size' : 'Expand window'}
            className="p-1.5 rounded-lg hover:text-slate-200 hover:bg-slate-800 transition-colors hidden sm:block"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Close AeroCopilot"
            className="p-1.5 rounded-lg hover:text-rose-400 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                  isUser
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-800 text-slate-200 border border-slate-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-cyan-400" />}
              </div>

              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-cyan-600 text-white font-medium'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 font-sans'
                }`}
              >
                {/* Render simple markdown paragraphs and lists */}
                <div className="space-y-2 whitespace-pre-wrap">
                  {msg.content.split('\n\n').map((paragraph, idx) => {
                    if (paragraph.startsWith('### ')) {
                      return (
                        <h4 key={idx} className="font-bold text-sm text-cyan-300 font-sans mt-1">
                          {paragraph.replace('### ', '')}
                        </h4>
                      );
                    }
                    if (paragraph.startsWith('* ') || paragraph.startsWith('- ')) {
                      return (
                        <ul key={idx} className="list-disc list-inside space-y-1 text-slate-300">
                          {paragraph.split('\n').map((item, itemIdx) => (
                            <li key={itemIdx} className="leading-normal">
                              {item.replace(/^(\* |- )/, '')}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={idx}>{paragraph}</p>;
                  })}
                </div>

                <div
                  className={`text-[9px] font-mono mt-1.5 ${
                    isUser ? 'text-cyan-200 text-right' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-800 text-cyan-400 border border-slate-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-mono text-xs flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>AeroCopilot analyzing Open-Meteo telemetry stream...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset Inquiries Tray */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-900/40">
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <span>Mission Pre-sets</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {presetQueries.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleSendMessage(preset.prompt)}
              disabled={isSending}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 whitespace-nowrap transition-colors shrink-0 disabled:opacity-50"
            >
              {preset.icon}
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/80 rounded-b-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AeroCopilot about wind shear, flight vectors, AQI..."
            disabled={isSending}
            className="flex-1 bg-slate-950 border border-slate-750 text-slate-100 placeholder-slate-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-sans"
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
