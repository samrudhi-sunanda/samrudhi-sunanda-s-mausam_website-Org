import React, { useState } from 'react';
import {
  Navigation,
  MapPin,
  Wind,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Compass,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { AtmosphericSnapshot, UnitSystem } from '../types/weather';
import { formatSpeed } from '../services/openMeteo';

interface RouteSafetyWidgetProps {
  snapshot: AtmosphericSnapshot;
  personaName: string;
  unitSystem: UnitSystem;
}

interface MockRoute {
  id: string;
  title: string;
  origin: string;
  destination: string;
  distanceKm: number;
  activityType: string;
  crosswindRisk: 'low' | 'moderate' | 'high';
  crosswindKmh: number;
  departureScores: { time: string; score: number; note: string }[];
}

export const RouteSafetyWidget: React.FC<RouteSafetyWidgetProps> = ({
  snapshot,
  personaName,
  unitSystem,
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-1');

  const routes: MockRoute[] = [
    {
      id: 'route-1',
      title: 'Bay Bridge Coastal Corridor',
      origin: `${snapshot.location.name} Central Pier`,
      destination: `${snapshot.location.name} North Overlook`,
      distanceKm: 24.5,
      activityType: 'Cycling & Highway Transit',
      crosswindRisk: snapshot.current.windGusts > 35 ? 'high' : 'moderate',
      crosswindKmh: Math.round(snapshot.current.windSpeed * 0.85),
      departureScores: [
        { time: 'Depart Now', score: snapshot.current.windGusts > 35 ? 65 : 78, note: 'Elevated crosswind on exposed bridge segment' },
        { time: 'Depart in +45m', score: 86, note: 'Gust front dissipating, favorable draft' },
        { time: 'Depart in +90m', score: 94, note: 'Optimal laminar breeze corridor' },
      ],
    },
    {
      id: 'route-2',
      title: 'Ridge Mountain Ascent',
      origin: 'Trailhead Base',
      destination: 'Summit Pass (Elev 1,420m)',
      distanceKm: 14.2,
      activityType: 'Trekking & Hiking',
      crosswindRisk: 'low',
      crosswindKmh: Math.round(snapshot.current.windSpeed * 0.4),
      departureScores: [
        { time: 'Depart Now', score: 92, note: 'Clear mountain visibility, dry rock traction' },
        { time: 'Depart in +60m', score: 84, note: 'Mid-level cumulus development' },
        { time: 'Depart in +120m', score: 71, note: 'Afternoon thermal convective cloud buildup' },
      ],
    },
    {
      id: 'route-3',
      title: 'Metro Urban Ring Corridor',
      origin: 'South Tech Hub',
      destination: 'Downtown Financial Hub',
      distanceKm: 18.0,
      activityType: 'Commuter Road Transit',
      crosswindRisk: 'low',
      crosswindKmh: Math.round(snapshot.current.windSpeed * 0.3),
      departureScores: [
        { time: 'Depart Now', score: 89, note: 'Nominal pavement temperature, no ponding' },
        { time: 'Depart in +30m', score: 82, note: 'Commuter density and localized tailpipe haze' },
        { time: 'Depart in +60m', score: 91, note: 'Clear transit corridor' },
      ],
    },
  ];

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-5 shadow-2xl space-y-4">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white font-sans">
                Micro-Climate Route Safety Widget
              </h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                Vector Analysis
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Monitors localized crosswinds, pollution bottlenecks, and departure-time windows
            </p>
          </div>
        </div>

        {/* Route selector pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {routes.map((route) => (
            <button
              key={route.id}
              type="button"
              onClick={() => setSelectedRouteId(route.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all shrink-0 ${
                selectedRouteId === route.id
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold shadow-xs'
                  : 'bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {route.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: SVG Route Vector Map + Departure Optimization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Vector Map Representation */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 flex flex-col justify-between relative overflow-hidden">
          
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>Transit Corridor: <strong className="text-white">{activeRoute.origin} → {activeRoute.destination}</strong></span>
            <span>{activeRoute.distanceKm} km</span>
          </div>

          {/* SVG Vector Path Visualizer */}
          <div className="h-44 w-full relative flex items-center justify-center my-2">
            <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible drop-shadow-md">
              <defs>
                <linearGradient id="routeGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Faint Grid Lines */}
              <line x1="20" y1="40" x2="480" y2="40" stroke="rgba(148, 163, 184, 0.08)" strokeDasharray="3 3" />
              <line x1="20" y1="80" x2="480" y2="80" stroke="rgba(148, 163, 184, 0.08)" strokeDasharray="3 3" />
              <line x1="20" y1="120" x2="480" y2="120" stroke="rgba(148, 163, 184, 0.08)" strokeDasharray="3 3" />

              {/* Curving Transit Path */}
              <path
                d="M 40,110 C 130,30 220,130 320,60 S 420,110 460,70"
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                className="transition-all duration-700"
              />

              {/* Wind Vector Arrows along path */}
              <g transform="translate(180, 75) rotate(45)">
                <line x1="0" y1="0" x2="25" y2="0" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrow)" />
                <polygon points="25,-3 32,0 25,3" fill="#f59e0b" />
              </g>

              <g transform="translate(340, 80) rotate(25)">
                <line x1="0" y1="0" x2="20" y2="0" stroke="#38bdf8" strokeWidth="2" />
                <polygon points="20,-3 26,0 20,3" fill="#38bdf8" />
              </g>

              {/* Waypoint 1: Origin */}
              <circle cx="40" cy="110" r="7" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
              <text x="40" y="135" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">Origin</text>

              {/* Waypoint 2: Bottleneck Hazard Point */}
              <circle cx="230" cy="100" r="8" fill="#f59e0b" stroke="#fef3c7" strokeWidth="2" className="animate-pulse" />
              <text x="230" y="125" textAnchor="middle" fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold">Crosswind Shear</text>

              {/* Waypoint 3: Destination */}
              <circle cx="460" cy="70" r="7" fill="#10b981" stroke="#34d399" strokeWidth="2" />
              <text x="460" y="95" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">Dest</text>
            </svg>
          </div>

          {/* Micro-climate live telemetry strip */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 font-mono text-[11px]">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Crosswind Vector</span>
              <span className="text-amber-400 font-bold mt-0.5 block">{formatSpeed(activeRoute.crosswindKmh, unitSystem)}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Surface Friction</span>
              <span className="text-emerald-400 font-bold mt-0.5 block">Good / Dry</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Aerosol Density</span>
              <span className="text-cyan-400 font-bold mt-0.5 block">AQI {snapshot.airQuality.europeanAqi ?? 35}</span>
            </div>
          </div>

        </div>

        {/* Right: Proactive Departure-Time Recommendations */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 font-mono text-xs">
              <span className="text-cyan-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Proactive Departure Timing</span>
              </span>
              <span className="text-[10px] text-slate-400">
                Safety Index
              </span>
            </div>

            <div className="space-y-2.5">
              {activeRoute.departureScores.map((dep, idx) => (
                <div
                  key={dep.time}
                  className={`p-3 rounded-xl border transition-all ${
                    dep.score >= 90
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : dep.score >= 80
                      ? 'bg-cyan-950/20 border-cyan-500/30'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      {dep.score >= 90 ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                      <span>{dep.time}</span>
                    </span>
                    <span
                      className={`text-xs font-extrabold ${
                        dep.score >= 90 ? 'text-emerald-400' : dep.score >= 80 ? 'text-cyan-400' : 'text-amber-400'
                      }`}
                    >
                      {dep.score}/100 Safe
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans">
                    {dep.note}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Optimized for {personaName}</span>
            <span className="text-emerald-400">Live Vector Sync</span>
          </div>

        </div>

      </div>

    </div>
  );
};
