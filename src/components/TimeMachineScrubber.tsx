import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Sun,
  Moon,
  Wind,
  Droplets,
  Thermometer,
  FastForward
} from 'lucide-react';
import { HourlyTelemetryPoint, UnitSystem } from '../types/weather';
import { formatSpeed, formatTemp, getWindCardinal } from '../services/openMeteo';

interface TimeMachineScrubberProps {
  hourly: HourlyTelemetryPoint[];
  currentHourOffset: number;
  onHourOffsetChange: React.Dispatch<React.SetStateAction<number>>;
  unitSystem: UnitSystem;
  personaName: string;
}

export const TimeMachineScrubber: React.FC<TimeMachineScrubberProps> = ({
  hourly,
  currentHourOffset,
  onHourOffsetChange,
  unitSystem,
  personaName,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const maxHours = Math.min(48, hourly.length > 0 ? hourly.length - 1 : 48);

  // Play animation loop
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        onHourOffsetChange((prev) => {
          if (prev >= maxHours) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1200); // Step every 1.2s for smooth inspection
    }
    return () => clearInterval(timer);
  }, [isPlaying, maxHours, onHourOffsetChange]);

  const activePoint = hourly[currentHourOffset] || hourly[0];

  const formatScrubTime = (timeStr?: string) => {
    if (!timeStr) return 'Now';
    const d = new Date(timeStr);
    return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-950/90 backdrop-blur-xl p-5 shadow-2xl">
      
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800/80 mb-4 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            <Clock className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white font-sans">
                The Persona Time-Machine
              </h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                48-Hour Simulation
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Scrub cursor to watch {personaName} environmental vectors morph in real-time
            </p>
          </div>
        </div>

        {/* Play / Pause / Reset & Quick Jump Controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/40'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Simulate 48h'}</span>
          </button>

          {currentHourOffset > 0 && (
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                onHourOffsetChange(0);
              }}
              title="Reset to Present"
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Quick jump pills */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[6, 12, 24, 48].map((offset) => (
              <button
                key={offset}
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  onHourOffsetChange(Math.min(offset, maxHours));
                }}
                className={`px-2 py-0.5 rounded-lg text-[11px] transition-colors ${
                  currentHourOffset === offset
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                +{offset}h
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrubber Track & Cursor */}
      <div className="space-y-3">
        
        {/* Scrubber Value Indicator Card */}
        {activePoint && (
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">
                {currentHourOffset === 0 ? 'Present State (Now)' : `+${currentHourOffset} Hours Ahead`}
              </span>
              <span className="text-slate-400">· {formatScrubTime(activePoint.time)}</span>
            </div>

            {/* Quick Micro-telemetry snapshot */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1 text-cyan-300">
                <Thermometer className="w-3.5 h-3.5" />
                <span>{formatTemp(activePoint.temperature, unitSystem)}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-300">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                <span>{formatSpeed(activePoint.windSpeed, unitSystem)} ({getWindCardinal(activePoint.windDirection)})</span>
              </div>
              <div className="flex items-center gap-1 text-blue-400">
                <Droplets className="w-3.5 h-3.5" />
                <span>{activePoint.precipitationProbability}% precip</span>
              </div>
              <div className="flex items-center gap-1 text-amber-400">
                <Sun className="w-3.5 h-3.5" />
                <span>UV {activePoint.uvIndex}</span>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Range Slider */}
        <div className="relative pt-1 pb-1">
          <input
            type="range"
            min="0"
            max={maxHours}
            step="1"
            value={currentHourOffset}
            onChange={(e) => {
              setIsPlaying(false);
              onHourOffsetChange(parseInt(e.target.value, 10));
            }}
            className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />

          {/* Time markers across bottom */}
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1.5 px-1">
            <span>Now</span>
            <span>+12h (Half-Day)</span>
            <span>+24h (Tomorrow)</span>
            <span>+36h</span>
            <span>+48h (Full Range)</span>
          </div>
        </div>

      </div>

    </div>
  );
};
