import React, { useState } from 'react';
import {
  Calendar,
  CloudSun,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  Wind,
  Droplets,
  ArrowUp,
  Clock,
  ChevronRight
} from 'lucide-react';
import {
  DailyTelemetryPoint,
  HourlyTelemetryPoint,
  UnitSystem,
} from '../types/weather';
import {
  formatSpeed,
  formatTemp,
  getWindCardinal,
  getWmoWeatherDetails,
} from '../services/openMeteo';

interface SynopticForecastProps {
  daily: DailyTelemetryPoint[];
  hourly: HourlyTelemetryPoint[];
  unitSystem: UnitSystem;
}

export const SynopticForecast: React.FC<SynopticForecastProps> = ({
  daily,
  hourly,
  unitSystem,
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'hourly'>('daily');

  const getWeatherIcon = (category: string) => {
    switch (category) {
      case 'clear':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'clouds':
        return <CloudSun className="w-5 h-5 text-cyan-300" />;
      case 'rain':
        return <CloudRain className="w-5 h-5 text-blue-400" />;
      case 'thunderstorm':
        return <CloudLightning className="w-5 h-5 text-yellow-400" />;
      case 'snow':
        return <Snowflake className="w-5 h-5 text-teal-300" />;
      default:
        return <Cloud className="w-5 h-5 text-slate-400" />;
    }
  };

  const formatDayName = (dateStr: string, index: number) => {
    if (index === 0) return 'Today';
    if (index === 1) return 'Tomorrow';
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatHourTime = (timeStr: string) => {
    const d = new Date(timeStr);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-5 shadow-xl">
      
      {/* Header with Tab switcher */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 font-sans">
              Synoptic & Hourly Telemetry Timeline
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Numerical Weather Prediction (NWP) Models
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('daily')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'daily'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            7-Day Synoptic
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hourly')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'hourly'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            24-Hour Micro-Vectors
          </button>
        </div>
      </div>

      {/* 7-Day Synoptic View */}
      {activeTab === 'daily' && (
        <div className="space-y-2">
          {daily.map((day, i) => {
            const wmo = getWmoWeatherDetails(day.weatherCode, true);
            return (
              <div
                key={day.date}
                className="p-3 rounded-xl bg-slate-950/40 hover:bg-slate-950/70 border border-slate-800/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Day & Condition */}
                <div className="flex items-center gap-3 min-w-[200px]">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                    {getWeatherIcon(wmo.category)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100 font-sans">
                      {formatDayName(day.date, i)}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {wmo.label}
                    </div>
                  </div>
                </div>

                {/* Rain probability & Wind Gusts */}
                <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-1.5" title="Precipitation Probability">
                    <Droplets className="w-3.5 h-3.5 text-blue-400" />
                    <span>{day.precipitationProbabilityMax}%</span>
                  </div>

                  <div className="flex items-center gap-1.5" title="Max Wind Gusts">
                    <Wind className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{formatSpeed(day.windGustsMax, unitSystem)}</span>
                  </div>

                  <div className="hidden md:flex items-center gap-1.5 text-amber-400" title="Max UV Index">
                    <Sun className="w-3.5 h-3.5" />
                    <span>UV {day.uvIndexMax}</span>
                  </div>
                </div>

                {/* Temperature Range Bar */}
                <div className="flex items-center gap-3 font-mono text-xs shrink-0 sm:min-w-[160px] justify-end">
                  <span className="text-slate-400 w-10 text-right">
                    {formatTemp(day.temperatureMin, unitSystem)}
                  </span>
                  
                  {/* Visual Bar */}
                  <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden relative">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-amber-500 w-full" />
                  </div>

                  <span className="text-white font-bold w-10 text-left">
                    {formatTemp(day.temperatureMax, unitSystem)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 24-Hour Micro-Vectors View */}
      {activeTab === 'hourly' && (
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-2.5 min-w-[900px]">
            {hourly.slice(0, 24).map((hour, i) => {
              const wmo = getWmoWeatherDetails(hour.weatherCode, hour.uvIndex > 0);
              const cardinal = getWindCardinal(hour.windDirection);
              return (
                <div
                  key={hour.time}
                  className="flex-1 min-w-[100px] p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col items-center text-center font-mono"
                >
                  <span className="text-[11px] text-slate-400 mb-2">
                    {i === 0 ? 'Now' : formatHourTime(hour.time)}
                  </span>

                  <div className="my-1">
                    {getWeatherIcon(wmo.category)}
                  </div>

                  <span className="text-sm font-bold text-white my-1">
                    {formatTemp(hour.temperature, unitSystem)}
                  </span>

                  {/* Wind Arrow & Direction */}
                  <div className="flex flex-col items-center gap-1 my-2">
                    <div
                      className="p-1 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-400"
                      style={{ transform: `rotate(${hour.windDirection}deg)` }}
                      title={`Wind heading ${hour.windDirection}° (${cardinal})`}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] text-slate-400">{cardinal}</span>
                    <span className="text-[10px] font-semibold text-slate-300">
                      {formatSpeed(hour.windSpeed, unitSystem)}
                    </span>
                  </div>

                  {/* Precip Probability */}
                  <div className="flex items-center gap-1 text-[10px] text-blue-400 mt-1">
                    <Droplets className="w-3 h-3" />
                    <span>{hour.precipitationProbability}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
