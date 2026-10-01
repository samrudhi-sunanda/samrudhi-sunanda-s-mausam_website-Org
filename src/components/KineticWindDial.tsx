import React, { useEffect, useRef, useState } from 'react';
import {
  Compass,
  Wind,
  RotateCw,
  Gauge,
  Activity,
  ArrowUp,
  Maximize2,
  Minimize2,
  Lock,
  Unlock,
  Radio
} from 'lucide-react';
import { UnitSystem } from '../types/weather';
import { formatSpeed, getBeaufortScale, getWindCardinal } from '../services/openMeteo';

interface KineticWindDialProps {
  windSpeed: number; // in km/h
  windGusts: number; // in km/h
  windDirection: number; // 0-360 degrees
  unitSystem: UnitSystem;
}

interface Particle {
  x: number;
  y: number;
  speed: number;
  length: number;
  opacity: number;
  size: number;
}

export const KineticWindDial: React.FC<KineticWindDialProps> = ({
  windSpeed,
  windGusts,
  windDirection,
  unitSystem,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [manualAngle, setManualAngle] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isInteractiveMode, setIsInteractiveMode] = useState<boolean>(false);
  const [animationFrameId, setAnimationFrameId] = useState<number>(0);

  // Active angle is either manual override (if testing) or live telemetry
  const activeDirection = manualAngle !== null ? manualAngle : windDirection;
  const cardinal = getWindCardinal(activeDirection);
  const beaufort = getBeaufortScale(windSpeed);

  // Decompose into U (East-West) and V (North-South) wind vector components (in m/s)
  const speedMs = (windSpeed * 1000) / 3600;
  const radians = (activeDirection * Math.PI) / 180;
  // Meteorological convention: wind coming FROM direction
  const uVector = -speedMs * Math.sin(radians); // Zonal component
  const vVector = -speedMs * Math.cos(radians); // Meridional component

  // Canvas particle stream simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 320);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 320);

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    // Particle pool
    const particleCount = Math.min(80, Math.max(25, Math.round(windSpeed * 1.5)));
    const particles: Particle[] = [];
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(centerX, centerY) * 0.88;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * maxRadius;
      particles.push({
        x: centerX + Math.cos(angle) * r,
        y: centerY + Math.sin(angle) * r,
        speed: 0.8 + Math.random() * 1.8 + windSpeed * 0.08,
        length: 8 + Math.random() * 18 + windSpeed * 0.35,
        opacity: 0.15 + Math.random() * 0.6,
        size: 1 + Math.random() * 1.5,
      });
    }

    let running = true;
    const render = () => {
      if (!running) return;

      // Dark translucent clear for smooth motion blur
      ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
      ctx.fillRect(0, 0, width, height);

      // Draw faint boundary circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Wind stream vector angle: from direction to direction (direction + 180°)
      const flowAngle = ((activeDirection + 180) % 360) * (Math.PI / 180);
      const vx = Math.sin(flowAngle);
      const vy = -Math.cos(flowAngle);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += vx * p.speed;
        p.y += vy * p.speed;

        // Distance from center
        const dx = p.x - centerX;
        const dy = p.y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Respawn when particle exits the circle
        if (dist > maxRadius || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
          // Spawn near the wind inflow edge
          const spawnAngle = (activeDirection * Math.PI) / 180 + (Math.random() - 0.5) * 1.2;
          const spawnR = maxRadius * 0.95;
          p.x = centerX - Math.sin(spawnAngle) * spawnR;
          p.y = centerY + Math.cos(spawnAngle) * spawnR;
          p.speed = 0.8 + Math.random() * 1.8 + windSpeed * 0.08;
          p.opacity = 0.15 + Math.random() * 0.6;
        }

        // Draw particle streak
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - vx * p.length, p.y - vy * p.length);

        // Color based on wind intensity (cyan to amber/red for storm winds)
        if (windSpeed > 45) {
          ctx.strokeStyle = `rgba(244, 63, 94, ${p.opacity})`;
        } else if (windSpeed > 25) {
          ctx.strokeStyle = `rgba(251, 191, 36, ${p.opacity})`;
        } else {
          ctx.strokeStyle = `rgba(56, 189, 248, ${p.opacity})`;
        }

        ctx.lineWidth = p.size;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      const id = requestAnimationFrame(render);
      setAnimationFrameId(id);
    };

    render();

    return () => {
      running = false;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [windSpeed, activeDirection]);

  // Handle manual dial drag to simulate wind bearings
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isInteractiveMode) return;
    setIsDragging(true);
    updateAngleFromPointer(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !isInteractiveMode) return;
    updateAngleFromPointer(e);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const updateAngleFromPointer = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    // Calculate angle in degrees from North (top is 0)
    let deg = Math.atan2(dx, -dy) * (180 / Math.PI);
    if (deg < 0) deg += 360;
    setManualAngle(Math.round(deg));
  };

  return (
    <div className="relative rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-5 shadow-xl overflow-hidden flex flex-col justify-between">
      
      {/* Header bar of Kinetic Dial */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 font-sans flex items-center gap-1.5">
              <span>Kinetic Wind Dial</span>
              {manualAngle !== null && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Simulated
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Vector Azimuth & Streamline Physics
            </p>
          </div>
        </div>

        {/* Dial Mode Controls */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              setIsInteractiveMode(!isInteractiveMode);
              if (isInteractiveMode) setManualAngle(null);
            }}
            title={isInteractiveMode ? 'Lock to Live Telemetry' : 'Unlock Dial for Interactive Bearing Simulation'}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              isInteractiveMode
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
            }`}
          >
            {isInteractiveMode ? <Unlock className="w-3 h-3 text-amber-400" /> : <Lock className="w-3 h-3" />}
            <span className="hidden sm:inline">{isInteractiveMode ? 'Manual Angle' : 'Live Sync'}</span>
          </button>

          {manualAngle !== null && (
            <button
              type="button"
              onClick={() => setManualAngle(null)}
              title="Reset to Live Telemetry"
              className="p-1 rounded text-cyan-400 hover:bg-slate-800 border border-cyan-500/30 transition-colors"
            >
              <RotateCw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Center: Interactive Dial + Kinetic Streamline Canvas */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={`relative w-full aspect-square max-w-[320px] mx-auto select-none flex items-center justify-center my-2 ${
          isInteractiveMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        }`}
      >
        {/* Canvas background for aerodynamic streamlines */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full rounded-full pointer-events-none"
        />

        {/* SVG Compass Rose Overlay */}
        <svg
          viewBox="0 0 300 300"
          className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-md"
        >
          {/* Compass Rings */}
          <circle cx="150" cy="150" r="140" fill="none" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="150" cy="150" r="128" fill="none" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="1" />
          <circle cx="150" cy="150" r="85" fill="none" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1" />

          {/* 360-degree ticks */}
          {Array.from({ length: 36 }).map((_, i) => {
            const angle = i * 10;
            const isMajor = angle % 30 === 0;
            const isCardinal = angle % 90 === 0;
            const r1 = 128;
            const r2 = isCardinal ? 116 : isMajor ? 120 : 124;
            const rad = (angle * Math.PI) / 180;
            const x1 = 150 + Math.sin(rad) * r1;
            const y1 = 150 - Math.cos(rad) * r1;
            const x2 = 150 + Math.sin(rad) * r2;
            const y2 = 150 - Math.cos(rad) * r2;

            return (
              <line
                key={angle}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isCardinal ? '#38bdf8' : isMajor ? '#94a3b8' : 'rgba(148, 163, 184, 0.3)'}
                strokeWidth={isCardinal ? 2 : isMajor ? 1.5 : 1}
              />
            );
          })}

          {/* Cardinal Labels */}
          <text x="150" y="32" textAnchor="middle" fill="#38bdf8" fontSize="14" fontWeight="bold" fontFamily="monospace">N</text>
          <text x="272" y="155" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="600" fontFamily="monospace">E</text>
          <text x="150" y="278" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="600" fontFamily="monospace">S</text>
          <text x="28" y="155" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="600" fontFamily="monospace">W</text>

          {/* Intercardinal Labels */}
          <text x="235" y="68" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">NE</text>
          <text x="235" y="242" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">SE</text>
          <text x="65" y="242" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">SW</text>
          <text x="65" y="68" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">NW</text>

          {/* Rotating Aerofoil Needle Group */}
          <g
            transform={`rotate(${activeDirection}, 150, 150)`}
            style={{
              transition: isDragging ? 'none' : 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* North Indicator Needle (Wind vector pointing toward origin) */}
            <polygon
              points="150,42 144,140 156,140"
              fill="url(#needleGradientNorth)"
              filter="drop-shadow(0 0 6px rgba(56, 189, 248, 0.6))"
            />
            {/* South Tail Counterweight */}
            <polygon
              points="150,210 146,140 154,140"
              fill="rgba(148, 163, 184, 0.6)"
            />
            {/* Center Cap Hub */}
            <circle cx="150" cy="150" r="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
            <circle cx="150" cy="150" r="4" fill="#38bdf8" />
          </g>

          <defs>
            <linearGradient id="needleGradientNorth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Readout Capsule inside Needle Hub */}
        <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none mt-20">
          <div className="font-mono text-2xl font-bold tracking-tight text-white drop-shadow-md">
            {formatSpeed(windSpeed, unitSystem)}
          </div>
          <div className="flex items-center gap-1 text-xs font-mono text-cyan-300">
            <span>{activeDirection}°</span>
            <span aria-hidden="true">·</span>
            <span>{cardinal}</span>
          </div>
        </div>

      </div>

      {/* Aerodynamic Telemetry Footer Details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800/80 font-mono text-xs">
        
        {/* Gust telemetry */}
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Peak Gusts</div>
          <div className="text-sm font-bold text-amber-400 mt-0.5">
            {formatSpeed(windGusts, unitSystem)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {windGusts > windSpeed ? `+${(windGusts - windSpeed).toFixed(1)} surge` : 'Steady airflow'}
          </div>
        </div>

        {/* Beaufort rating */}
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Beaufort Scale</div>
          <div className="text-sm font-bold text-cyan-300 mt-0.5 flex items-center gap-1">
            <span>Force {beaufort.scale}</span>
          </div>
          <div className="text-[10px] text-slate-400 truncate mt-0.5" title={beaufort.description}>
            {beaufort.description}
          </div>
        </div>

        {/* Zonal U-vector (E-W) */}
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Zonal (U)</div>
          <div className="text-sm font-bold text-slate-200 mt-0.5">
            {uVector.toFixed(1)} m/s
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {uVector >= 0 ? 'Westerly' : 'Easterly'}
          </div>
        </div>

        {/* Meridional V-vector (N-S) */}
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Meridional (V)</div>
          <div className="text-sm font-bold text-slate-200 mt-0.5">
            {vVector.toFixed(1)} m/s
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {vVector >= 0 ? 'Southerly' : 'Northerly'}
          </div>
        </div>

      </div>

    </div>
  );
};
