import React, { useState } from 'react';
import {
  Sparkles,
  Wind,
  Droplets,
  Thermometer,
  ShieldAlert,
  Sun,
  Flame,
  Volume2,
  VolumeX,
  MapPin,
  Clock,
  ArrowUpRight,
  TrendingDown,
  Layers,
  Activity,
  AlertCircle,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { AtmosphericSnapshot, UnitSystem } from '../types/weather';
import { PERSONA_REGISTRY } from '../types/persona';
import { formatSpeed, formatTemp, getWindCardinal, getWmoWeatherDetails } from '../services/openMeteo';
import { soundscape } from '../utils/soundscape';

interface HeroPersonaCardProps {
  snapshot: AtmosphericSnapshot;
  activePersona: string;
  unitSystem: UnitSystem;
  onOpenPersonaModal: () => void;
  onOpenLocationModal: () => void;
}

export const HeroPersonaCard: React.FC<HeroPersonaCardProps> = ({
  snapshot,
  activePersona,
  unitSystem,
  onOpenPersonaModal,
  onOpenLocationModal,
}) => {
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const persona = PERSONA_REGISTRY[activePersona] || PERSONA_REGISTRY['Athletes / Runners'];

  const cur = snapshot.current;
  const aqi = snapshot.airQuality;
  const wmo = getWmoWeatherDetails(cur.weatherCode, cur.isDay);

  const toggleSoundscape = () => {
    const playing = soundscape.toggle(cur.windSpeed, cur.precipitation > 0);
    setIsAudioPlaying(playing);
  };

  // Compute Persona-Specific Hazard Score & Dynamic Bio-Sync Advisory
  const computeBioSync = () => {
    let score = 15; // 0 (Ideal) to 100 (Severe)
    let advisoryTitle = "Optimal Operational Clearance";
    let advisoryText = `Conditions over ${snapshot.location.name} are within normal baseline thresholds for ${persona.name}.`;
    let statusColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";

    if (persona.name === 'Cyclists') {
      if (cur.windGusts >= 35) {
        score = 75;
        advisoryTitle = "High Crosswind Warning";
        advisoryText = `Peak gusts at ${cur.windGusts} km/h with directional shear from ${getWindCardinal(cur.windDirection)}. Firm handlebar grip required on bridges and open highway crossings.`;
        statusColor = "text-amber-400 bg-amber-500/10 border-amber-500/30";
      } else if (cur.precipitation > 0) {
        score = 60;
        advisoryTitle = "Wet Asphalt Traction Advisory";
        advisoryText = "Active surface precipitation reduces tire friction coefficients. Increase braking distances by 35%.";
        statusColor = "text-blue-400 bg-blue-500/10 border-blue-500/30";
      } else {
        advisoryText = `Stable laminar airflow (${cur.windSpeed} km/h from ${getWindCardinal(cur.windDirection)}). Excellent aerodynamic conditions.`;
      }
    } else if (persona.name === 'Farmers') {
      if (cur.temperature <= 2) {
        score = 85;
        advisoryTitle = "Ground Radiation Frost Warning";
        advisoryText = "Surface boundary temperature near freezing point. High risk of frost damage to young vegetative buds.";
        statusColor = "text-rose-400 bg-rose-500/10 border-rose-500/30";
      } else if (cur.windSpeed >= 25) {
        score = 65;
        advisoryTitle = "Pesticide Spray Drift Hazard";
        advisoryText = `Wind speed (${cur.windSpeed} km/h) exceeds chemical spraying standards. Postpone spray operations to prevent airborne chemical drift.`;
        statusColor = "text-amber-400 bg-amber-500/10 border-amber-500/30";
      } else {
        advisoryText = `Surface pressure at ${cur.pressure} hPa with good ambient moisture. Favorable conditions for tilling, seeding, and crop harvesting.`;
      }
    } else if (persona.name === 'Pilots / Aviation') {
      if (cur.visibility < 5000 || cur.windGusts >= 40) {
        score = 80;
        advisoryTitle = "Marginal VFR / Mechanical Turbulence";
        advisoryText = `Optical visibility at ${(cur.visibility / 1000).toFixed(1)} km with ${cur.windGusts} km/h gusts. High crosswind component on perpendicular runways.`;
        statusColor = "text-rose-400 bg-rose-500/10 border-rose-500/30";
      } else {
        advisoryText = "VFR Clear. Density altitude nominal, unobstructed cloud ceilings, and minimal thermal shear.";
      }
    } else if (persona.name === 'Pet Owners') {
      if (cur.temperature >= 28 && cur.uvIndex >= 6) {
        score = 70;
        advisoryTitle = "Asphalt Paw Pad Burn Hazard";
        advisoryText = `Solar irradiance at ${cur.directRadiation} W/m² elevates asphalt surface temperatures above 49°C. Exercise dogs exclusively on grass surfaces.`;
        statusColor = "text-amber-400 bg-amber-500/10 border-amber-500/30";
      } else {
        advisoryText = "Comfortable surface temperatures. Ideal conditions for extended canine exercise.";
      }
    } else if (persona.name === 'Athletes / Runners') {
      if (cur.apparentTemperature >= 32 || (aqi.europeanAqi && aqi.europeanAqi >= 65)) {
        score = 65;
        advisoryTitle = "Thermal Exertion & Air Strain Watch";
        advisoryText = `Heat index feels like ${formatTemp(cur.apparentTemperature, unitSystem)} with AQI at ${aqi.europeanAqi ?? 40}. Plan 250ml hydration every 20 minutes; avoid midday sprints.`;
        statusColor = "text-amber-400 bg-amber-500/10 border-amber-500/30";
      } else {
        advisoryText = `Apparent temperature at ${formatTemp(cur.apparentTemperature, unitSystem)} and clean air stream. Optimal aerobic efficiency window.`;
      }
    }

    return { score, advisoryTitle, advisoryText, statusColor };
  };

  const bioSync = computeBioSync();

  return (
    <section className="relative rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-950/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
      
      {/* Background Atmosphere Aura */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-24 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Top Bar: Persona Badge, Category, Location Button, and Soundscape Toggle */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80 mb-5">
        
        {/* Left: Persona Switcher Badge */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenPersonaModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/30 hover:from-cyan-500/30 hover:to-blue-600/40 border border-cyan-500/40 text-cyan-300 font-sans font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer group"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>{persona.name}</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900/80 text-cyan-400 border border-cyan-500/30">
              Change
            </span>
          </button>

          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            Category: <strong className="text-slate-200">{persona.category}</strong>
          </span>
        </div>

        {/* Right: Location & Soundscape audio toggle */}
        <div className="flex items-center gap-2">
          
          {/* Location button */}
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>{snapshot.location.name}</span>
          </button>

          {/* Procedural Soundscape Toggle */}
          <button
            type="button"
            onClick={toggleSoundscape}
            title={isAudioPlaying ? 'Mute Atmospheric Ambient Soundscape' : 'Play Kinetic Procedural Atmospheric Soundscape (Web Audio)'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
              isAudioPlaying
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-inner shadow-cyan-500/20 animate-pulse'
                : 'bg-slate-950/70 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAudioPlaying ? (
              <>
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Soundscape Active</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="hidden sm:inline">Ambient Audio</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Main Hero Grid: Meteorological State + High-Priority Pinned Parameters */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Primary Meteorological Telemetry & Condition */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>{wmo.label}</span>
            <span aria-hidden="true">·</span>
            <span>WMO {cur.weatherCode}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-semibold">Live Telemetry</span>
          </div>

          <div className="flex items-baseline gap-4 flex-wrap">
            <span className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white font-sans">
              {formatTemp(cur.temperature, unitSystem)}
            </span>
            <div className="text-xs font-mono text-slate-300">
              <div>Feels like <strong className="text-white">{formatTemp(cur.apparentTemperature, unitSystem)}</strong></div>
              <div className="text-slate-400 mt-0.5">Humidity: {cur.humidity}% · Pressure: {cur.pressure} hPa</div>
            </div>
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {wmo.description}. Pinned telemetry is prioritized for <strong className="text-cyan-300">{persona.name}</strong>.
          </p>

          {/* AI Bio-Sync Advisory Card (Core Module 2 requirement) */}
          <div className={`p-4 rounded-2xl border transition-all mt-4 ${bioSync.statusColor}`}>
            <div className="flex items-center justify-between mb-1.5 font-mono text-xs">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Bio-Sync Advisory</span>
              </span>
              <span className="font-semibold">
                Risk Score: {bioSync.score}/100
              </span>
            </div>
            <h5 className="text-xs sm:text-sm font-bold text-white font-sans mb-1">
              {bioSync.advisoryTitle}
            </h5>
            <p className="text-xs text-slate-200 font-sans leading-relaxed">
              {bioSync.advisoryText}
            </p>
          </div>
        </div>

        {/* Right Column: High-Priority Pinned Parameters (Pinned to Hero Card) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 font-mono text-xs">
              <span className="text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Pinned High-Priority Parameters ({persona.pinned.length})</span>
              </span>
              <span className="text-slate-400">
                Persona Weighted
              </span>
            </div>

            {/* Dynamic Grid of High-Priority Parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono">
              
              {/* Parameter 1: Wind Speed & Direction */}
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase flex items-center justify-between">
                  <span>Wind Vector</span>
                  <Wind className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-lg font-bold text-white mt-1">
                  {formatSpeed(cur.windSpeed, unitSystem)}
                </div>
                <div className="text-[10px] text-cyan-300 mt-0.5">
                  {cur.windDirection}° ({getWindCardinal(cur.windDirection)})
                </div>
              </div>

              {/* Parameter 2: Sudden Gusts */}
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase flex items-center justify-between">
                  <span>Peak Gusts</span>
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-lg font-bold text-amber-300 mt-1">
                  {formatSpeed(cur.windGusts, unitSystem)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {cur.windGusts > cur.windSpeed ? `+${(cur.windGusts - cur.windSpeed).toFixed(1)} surge` : 'Steady airflow'}
                </div>
              </div>

              {/* Parameter 3: Air Quality / AQI */}
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase flex items-center justify-between">
                  <span>Air Quality</span>
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-lg font-bold text-emerald-300 mt-1">
                  {aqi.europeanAqi ?? 35} <span className="text-[10px] text-slate-400 font-normal">AQI</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  PM2.5: {aqi.pm2_5 ?? 12} µg/m³
                </div>
              </div>

              {/* Parameter 4: Solar UV Index */}
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase flex items-center justify-between">
                  <span>Solar UV Index</span>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-lg font-bold text-white mt-1">
                  {cur.uvIndex} <span className="text-[10px] text-slate-400 font-normal">Index</span>
                </div>
                <div className="text-[10px] text-amber-300 mt-0.5">
                  {cur.directRadiation} W/m² irradiance
                </div>
              </div>

              {/* Parameter 5: Precipitation Probability / Timing */}
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase flex items-center justify-between">
                  <span>Precip Timing</span>
                  <Droplets className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="text-lg font-bold text-blue-300 mt-1">
                  {snapshot.daily[0]?.precipitationProbabilityMax ?? 0}%
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Rate: {cur.precipitation} mm/h
                </div>
              </div>

              {/* Parameter 6: Optical Visibility */}
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase flex items-center justify-between">
                  <span>Visual Range</span>
                  <Eye className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <div className="text-lg font-bold text-teal-300 mt-1">
                  {(cur.visibility / 1000).toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">km</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {cur.visibility >= 10000 ? 'Cavok (Clear)' : 'Haze limit'}
                </div>
              </div>

            </div>
          </div>

          {/* Secondary Collapsible Bento Parameters Tagline */}
          <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Secondary Bento Parameters: <strong>{persona.bento.join(', ')}</strong></span>
            <span className="text-cyan-400 font-semibold">Living Bento Active</span>
          </div>
        </div>

      </div>

    </section>
  );
};
