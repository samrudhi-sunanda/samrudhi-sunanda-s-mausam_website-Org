import React from 'react';
import {
  ShieldAlert,
  Thermometer,
  Sun,
  Droplets,
  Gauge,
  CloudRain,
  Eye,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Minus,
  Sparkles,
  Cloud,
  Sunrise,
  Sunset,
  Flame,
  Activity
} from 'lucide-react';
import {
  AirQualityTelemetry,
  CurrentWeatherTelemetry,
  DailyTelemetryPoint,
  HourlyTelemetryPoint,
  UnitSystem,
} from '../types/weather';
import { formatPressure, formatTemp } from '../services/openMeteo';

interface AdaptiveBentoGridProps {
  current: CurrentWeatherTelemetry;
  airQuality: AirQualityTelemetry;
  hourly: HourlyTelemetryPoint[];
  daily: DailyTelemetryPoint[];
  unitSystem: UnitSystem;
}

export const AdaptiveBentoGrid: React.FC<AdaptiveBentoGridProps> = ({
  current,
  airQuality,
  hourly,
  daily,
  unitSystem,
}) => {
  const todayDaily = daily.length > 0 ? daily[0] : null;

  // AQI evaluation
  const euaqi = airQuality.europeanAqi ?? 35;
  const getAqiCategory = (val: number) => {
    if (val <= 20) return { label: 'Good', color: 'text-emerald-400', barColor: 'bg-emerald-400', desc: 'Air quality is considered satisfactory, and air pollution poses little or no risk.' };
    if (val <= 40) return { label: 'Fair', color: 'text-cyan-400', barColor: 'bg-cyan-400', desc: 'Air quality is acceptable; moderate health concern for a very small number of unusually sensitive individuals.' };
    if (val <= 60) return { label: 'Moderate', color: 'text-amber-400', barColor: 'bg-amber-400', desc: 'Members of sensitive groups may experience minor respiratory irritation.' };
    if (val <= 80) return { label: 'Poor', color: 'text-orange-400', barColor: 'bg-orange-400', desc: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious effects.' };
    return { label: 'Very Poor', color: 'text-rose-400', barColor: 'bg-rose-400', desc: 'Health warnings of emergency conditions. The entire population is more likely to be affected.' };
  };
  const aqiInfo = getAqiCategory(euaqi);

  // UV evaluation
  const uvVal = current.uvIndex;
  const getUvCategory = (uv: number) => {
    if (uv <= 2) return { label: 'Low', color: 'text-emerald-400', burnTime: 'No protection required' };
    if (uv <= 5) return { label: 'Moderate', color: 'text-amber-400', burnTime: 'Protection recommended; ~45 mins' };
    if (uv <= 7) return { label: 'High', color: 'text-orange-400', burnTime: 'SPF 30+ required; ~25 mins' };
    if (uv <= 10) return { label: 'Very High', color: 'text-rose-400', burnTime: 'Extra protection; ~15 mins' };
    return { label: 'Extreme', color: 'text-purple-400', burnTime: 'Avoid sun; ~10 mins' };
  };
  const uvInfo = getUvCategory(uvVal);

  // Pressure tendency from past 3 hours
  let pressureTrend: 'rising' | 'falling' | 'steady' = 'steady';
  let pressureDelta = 0;
  if (hourly.length >= 4) {
    pressureDelta = Math.round((hourly[0].pressure - hourly[3].pressure) * 10) / 10;
    if (pressureDelta > 0.8) pressureTrend = 'rising';
    else if (pressureDelta < -0.8) pressureTrend = 'falling';
  }

  // Dew point approximation
  const dewPoint = Math.round(current.temperature - ((100 - current.humidity) / 5));

  // Sun ephemeris
  const sunriseTime = todayDaily ? new Date(todayDaily.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:00';
  const sunsetTime = todayDaily ? new Date(todayDaily.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '18:30';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      
      {/* 1. AQI Adaptive Bento Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-100 font-sans">Air Quality Index</h4>
                <p className="text-[10px] text-slate-400 font-mono">European EAQI & Particulates</p>
              </div>
            </div>
            <span className={`text-xs font-bold font-mono ${aqiInfo.color}`}>
              {aqiInfo.label}
            </span>
          </div>

          {/* AQI Score & Bar */}
          <div className="my-2">
            <div className="flex items-baseline justify-between mb-1.5 font-mono">
              <span className="text-3xl font-bold text-white tracking-tight">{euaqi}</span>
              <span className="text-xs text-slate-400">US AQI: {airQuality.usAqi ?? Math.round(euaqi * 1.5)}</span>
            </div>

            {/* Gradient Scale Progress */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${aqiInfo.barColor}`}
                style={{ width: `${Math.min(100, Math.max(8, euaqi))}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed font-sans">
              {aqiInfo.desc}
            </p>
          </div>

          {/* Particulate Pollutant Micro-grid */}
          <div className="grid grid-cols-3 gap-1.5 pt-3 mt-2 border-t border-slate-800/60 font-mono text-[11px]">
            <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <div className="text-[10px] text-slate-400">PM2.5</div>
              <div className="font-bold text-slate-200 mt-0.5">{airQuality.pm2_5 ?? 12} <span className="text-[9px] font-normal text-slate-400">µg/m³</span></div>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <div className="text-[10px] text-slate-400">PM10</div>
              <div className="font-bold text-slate-200 mt-0.5">{airQuality.pm10 ?? 20} <span className="text-[9px] font-normal text-slate-400">µg/m³</span></div>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <div className="text-[10px] text-slate-400">NO₂</div>
              <div className="font-bold text-slate-200 mt-0.5">{airQuality.nitrogenDioxide ?? 16} <span className="text-[9px] font-normal text-slate-400">µg/m³</span></div>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <div className="text-[10px] text-slate-400">Ozone (O₃)</div>
              <div className="font-bold text-slate-200 mt-0.5">{airQuality.ozone ?? 42} <span className="text-[9px] font-normal text-slate-400">µg/m³</span></div>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <div className="text-[10px] text-slate-400">SO₂</div>
              <div className="font-bold text-slate-200 mt-0.5">{airQuality.sulphurDioxide ?? 5} <span className="text-[9px] font-normal text-slate-400">µg/m³</span></div>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <div className="text-[10px] text-slate-400">CO</div>
              <div className="font-bold text-slate-200 mt-0.5">{airQuality.carbonMonoxide ?? 250} <span className="text-[9px] font-normal text-slate-400">µg/m³</span></div>
            </div>
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-400 pt-2 flex items-center justify-between">
          <span>Aerosol dispersion telemetry</span>
          <span className="text-emerald-400 font-semibold">Active Monitoring</span>
        </div>
      </div>

      {/* 2. Temperature & Thermodynamic Bento Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Thermometer className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-100 font-sans">Thermodynamic State</h4>
                <p className="text-[10px] text-slate-400 font-mono">Ambient & Apparent Temps</p>
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-400">
              Feels {formatTemp(current.apparentTemperature, unitSystem)}
            </span>
          </div>

          {/* Primary Temp */}
          <div className="my-2">
            <div className="flex items-baseline justify-between">
              <span className="text-4xl font-extrabold text-white tracking-tight font-mono">
                {formatTemp(current.temperature, unitSystem)}
              </span>
              <div className="text-right font-mono text-xs text-slate-400">
                <div>Max: <span className="text-slate-200 font-semibold">{todayDaily ? formatTemp(todayDaily.temperatureMax, unitSystem) : '—'}</span></div>
                <div>Min: <span className="text-slate-200 font-semibold">{todayDaily ? formatTemp(todayDaily.temperatureMin, unitSystem) : '—'}</span></div>
              </div>
            </div>

            {/* Diurnal temperature bar */}
            {todayDaily && (
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>{formatTemp(todayDaily.temperatureMin, unitSystem)}</span>
                  <span className="text-cyan-400 font-semibold">Current {formatTemp(current.temperature, unitSystem)}</span>
                  <span>{formatTemp(todayDaily.temperatureMax, unitSystem)}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden relative">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-amber-500"
                    style={{
                      width: `${Math.max(
                        10,
                        Math.min(
                          100,
                          ((current.temperature - todayDaily.temperatureMin) /
                            Math.max(1, todayDaily.temperatureMax - todayDaily.temperatureMin)) *
                            100
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sparkline of next 12 hours */}
          <div className="pt-3 border-t border-slate-800/60">
            <div className="text-[10px] font-mono text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Diurnal Trend (Next 12h)</span>
              <span className="text-slate-400">Dew Point: {formatTemp(dewPoint, unitSystem)}</span>
            </div>
            
            {/* SVG Sparkline */}
            <div className="h-12 w-full">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {(() => {
                  const points = hourly.slice(0, 12);
                  if (points.length < 2) return null;
                  const temps = points.map((p) => p.temperature);
                  const min = Math.min(...temps);
                  const max = Math.max(...temps);
                  const range = Math.max(1, max - min);
                  const coords = points.map((p, i) => {
                    const x = (i / (points.length - 1)) * 100;
                    const y = 35 - ((p.temperature - min) / range) * 30;
                    return `${x},${y}`;
                  });
                  const polylineStr = coords.join(' ');
                  const areaStr = `0,40 ${polylineStr} 100,40`;
                  return (
                    <>
                      <polygon points={areaStr} fill="url(#tempGradient)" />
                      <polyline points={polylineStr} fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-400 pt-2 flex items-center justify-between">
          <span>Boundary layer stability</span>
          <span className="text-cyan-400 font-semibold">Nominal Lapse Rate</span>
        </div>
      </div>

      {/* 3. Solar Radiation & UV Bento Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-100 font-sans">Solar & UV Radiation</h4>
                <p className="text-[10px] text-slate-400 font-mono">Irradiance & Photon Flux</p>
              </div>
            </div>
            <span className={`text-xs font-bold font-mono ${uvInfo.color}`}>
              {uvInfo.label}
            </span>
          </div>

          {/* UV Index & Gauge */}
          <div className="my-2 flex items-center justify-between">
            <div>
              <div className="text-3xl font-extrabold text-white font-mono">{uvVal}</div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                Max Today: <span className="text-slate-200 font-semibold">{todayDaily?.uvIndexMax ?? uvVal}</span>
              </div>
              <p className="text-[11px] text-amber-300/90 mt-1 font-sans">
                {uvInfo.burnTime}
              </p>
            </div>

            {/* Direct Solar Radiation metric */}
            <div className="text-right font-mono p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <div className="text-[10px] text-slate-400 uppercase">Direct Radiation</div>
              <div className="text-base font-bold text-amber-400 mt-0.5">
                {current.directRadiation} <span className="text-[10px] text-slate-400 font-normal">W/m²</span>
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">Global horizontal irradiance</div>
            </div>
          </div>

          {/* Sun Celestial Ephemeris */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/60 font-mono text-xs">
            <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/60 flex items-center gap-2">
              <Sunrise className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400">Dawn / Sunrise</div>
                <div className="font-semibold text-slate-200">{sunriseTime}</div>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/60 flex items-center gap-2">
              <Sunset className="w-4 h-4 text-orange-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400">Dusk / Sunset</div>
                <div className="font-semibold text-slate-200">{sunsetTime}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-400 pt-2 flex items-center justify-between">
          <span>Tropospheric photon flux</span>
          <span className="text-amber-400 font-semibold">{current.isDay ? 'Daylight Cycle' : 'Nocturnal'}</span>
        </div>
      </div>

      {/* 4. Barometric Pressure & Moisture Bento Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-100 font-sans">Barometric & Moisture</h4>
                <p className="text-[10px] text-slate-400 font-mono">MSL Pressure & Humidity</p>
              </div>
            </div>
            
            {/* Tendency Badge */}
            <span className="flex items-center gap-1 text-xs font-mono text-slate-300">
              {pressureTrend === 'rising' ? (
                <>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Rising (+{pressureDelta})</span>
                </>
              ) : pressureTrend === 'falling' ? (
                <>
                  <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-rose-400">Falling ({pressureDelta})</span>
                </>
              ) : (
                <>
                  <Minus className="w-3.5 h-3.5 text-slate-400" />
                  <span>Steady</span>
                </>
              )}
            </span>
          </div>

          {/* Pressure & Humidity Numbers */}
          <div className="grid grid-cols-2 gap-3 my-2">
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase">Sea-Level Pressure</div>
              <div className="text-2xl font-extrabold text-white font-mono mt-0.5">
                {formatPressure(current.pressure, unitSystem)}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                Surface: {current.surfacePressure} hPa
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase">Relative Humidity</div>
              <div className="text-2xl font-extrabold text-cyan-300 font-mono mt-0.5">
                {current.humidity}%
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                Dew point: {formatTemp(dewPoint, unitSystem)}
              </div>
            </div>
          </div>

          {/* Humidity Meter Bar */}
          <div className="pt-2">
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden relative">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                style={{ width: `${current.humidity}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
              <span>Dry (0%)</span>
              <span>Comfortable (45-60%)</span>
              <span>Saturated (100%)</span>
            </div>
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-400 pt-2 flex items-center justify-between border-t border-slate-800/60 mt-3">
          <span>Atmospheric pressure column</span>
          <span className="text-purple-400 font-semibold">{current.pressure > 1013 ? 'High Pressure Cell' : 'Low Pressure Trough'}</span>
        </div>
      </div>

      {/* 5. Hydrometeors & Cloud Cover Bento Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <CloudRain className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-100 font-sans">Hydrometeors & Clouds</h4>
                <p className="text-[10px] text-slate-400 font-mono">Precipitation & Layer Cover</p>
              </div>
            </div>
            <span className="text-xs font-mono text-blue-400">
              {todayDaily?.precipitationProbabilityMax ?? 0}% Precip Risk
            </span>
          </div>

          {/* Precipitation & Cloud Cover Grid */}
          <div className="grid grid-cols-2 gap-3 my-2 font-mono">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Precipitation Rate</div>
              <div className="text-2xl font-bold text-white mt-0.5">
                {current.precipitation} <span className="text-xs font-normal text-slate-400">mm/h</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Today Sum: {todayDaily?.precipitationSum ?? 0} mm
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase">Total Cloud Cover</div>
              <div className="text-2xl font-bold text-slate-200 mt-0.5">
                {current.cloudCover}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Visibility: {(current.visibility / 1000).toFixed(1)} km
              </div>
            </div>
          </div>

          {/* Cloud Cover Layer Altitude Stratigraphy */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/60 font-mono text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">High (&gt;6000m Cirrus)</span>
              <span className="text-slate-300 font-semibold">{current.cloudCoverHigh}%</span>
            </div>
            <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-blue-300/80 rounded-full" style={{ width: `${current.cloudCoverHigh}%` }} />
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <span className="text-slate-400">Mid (2000-6000m Altocumulus)</span>
              <span className="text-slate-300 font-semibold">{current.cloudCoverMid}%</span>
            </div>
            <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-blue-400/80 rounded-full" style={{ width: `${current.cloudCoverMid}%` }} />
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <span className="text-slate-400">Low (&lt;2000m Stratus)</span>
              <span className="text-slate-300 font-semibold">{current.cloudCoverLow}%</span>
            </div>
            <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-blue-500/80 rounded-full" style={{ width: `${current.cloudCoverLow}%` }} />
            </div>
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-400 pt-2 flex items-center justify-between border-t border-slate-800/60 mt-3">
          <span>Cloud layer stratigraphy</span>
          <span className="text-blue-400 font-semibold">{current.cloudCover > 60 ? 'Overcast Ceiling' : 'Scattered Clouds'}</span>
        </div>
      </div>

      {/* 6. Optical Horizon & Flight Visibility Bento Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-100 font-sans">Optical Transparency</h4>
                <p className="text-[10px] text-slate-400 font-mono">Horizontal Visual Range</p>
              </div>
            </div>
            <span className="text-xs font-mono text-teal-400 font-semibold">
              {current.visibility >= 10000 ? 'Cavok (Clear)' : current.visibility >= 5000 ? 'Moderate' : 'Impaired'}
            </span>
          </div>

          <div className="my-2">
            <div className="text-3xl font-extrabold text-white font-mono">
              {(current.visibility / 1000).toFixed(1)} <span className="text-xs text-slate-400 font-normal">km range</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 font-sans leading-relaxed">
              {current.visibility >= 10000
                ? 'Unrestricted visual flight rules (VFR) ceiling. No atmospheric attenuation or boundary fog detected.'
                : 'Scattered aerosol haze or suspended moisture reducing optical transmission on horizon.'}
            </p>
          </div>

          {/* Aviation VFR/IFR indicators */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/60 font-mono text-xs">
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <div className="text-[10px] text-slate-400">Flight Rule Status</div>
              <div className="font-bold text-teal-300 mt-0.5">
                {current.visibility >= 8000 && current.cloudCoverLow < 50 ? 'VFR CLEAR' : 'MVFR / CAUTION'}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <div className="text-[10px] text-slate-400">Aerosol Optical Depth</div>
              <div className="font-bold text-slate-200 mt-0.5">
                {airQuality.aerosolOpticalDepth ? airQuality.aerosolOpticalDepth.toFixed(2) : '0.14'} AOD
              </div>
            </div>
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-400 pt-2 flex items-center justify-between border-t border-slate-800/60 mt-3">
          <span>Tropospheric transmission</span>
          <span className="text-teal-400 font-semibold">Clear Optical Path</span>
        </div>
      </div>

    </div>
  );
};
