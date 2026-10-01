import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Compass,
  Wind,
  ShieldAlert,
  Sparkles,
  CloudSun,
  AlertTriangle,
  FileCode,
  Radio,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Sun,
  CloudRain,
  MapPin,
  Clock,
  Layers,
  Sliders
} from 'lucide-react';
import {
  AtmosphericSnapshot,
  LocationTelemetry,
  ThemeMode,
  UnitSystem,
} from './types/weather';
import {
  PRESET_LOCATIONS,
  fetchAtmosphericSnapshot,
  formatSpeed,
  formatTemp,
  getBeaufortScale,
  getWindCardinal,
  getWmoWeatherDetails,
} from './services/openMeteo';
import { PERSONA_REGISTRY } from './types/persona';
import { Header } from './components/Header';
import { HeroPersonaCard } from './components/HeroPersonaCard';
import { KineticWindDial } from './components/KineticWindDial';
import { ActiveAlertsHub } from './components/ActiveAlertsHub';
import { AdaptiveBentoGrid } from './components/AdaptiveBentoGrid';
import { SynopticForecast } from './components/SynopticForecast';
import { TimeMachineScrubber } from './components/TimeMachineScrubber';
import { RouteSafetyWidget } from './components/RouteSafetyWidget';
import { BioSyncAlarmsHub } from './components/BioSyncAlarmsHub';
import { AeroCopilotChat } from './components/AeroCopilotChat';
import { TelemetryInspectorModal } from './components/TelemetryInspectorModal';
import { LocationModal } from './components/LocationModal';
import { PersonaSwitcherModal } from './components/PersonaSwitcherModal';
import { SettingsThresholdDrawer } from './components/SettingsThresholdDrawer';

export default function App() {
  // 1. Location state: check localStorage first, then fallback to user's timezone or Tokyo
  const [currentLocation, setCurrentLocation] = useState<LocationTelemetry>(() => {
    try {
      const saved = localStorage.getItem('mausam_user_location');
      if (saved) return JSON.parse(saved);
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const matchedPreset = PRESET_LOCATIONS.find((p) => p.timezone === userTz);
      if (matchedPreset) return matchedPreset;
    } catch {}
    return PRESET_LOCATIONS[0];
  });

  // 2. Active Persona state: 28-persona matrix (defaults to Cyclists)
  const [activePersona, setActivePersona] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('aakaash_user_persona');
      if (saved && PERSONA_REGISTRY[saved]) return saved;
    } catch {}
    return 'Cyclists';
  });

  const [snapshot, setSnapshot] = useState<AtmosphericSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 3. 48-Hour Time-Machine Scrubber offset
  const [hourOffset, setHourOffset] = useState<number>(0);

  // 4. Modals and drawers
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState<boolean>(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState<boolean>(false);
  const [isAeroCopilotOpen, setIsAeroCopilotOpen] = useState<boolean>(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);

  // 5. Units & Theme persistence
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(() => {
    try {
      const saved = localStorage.getItem('mausam_user_units');
      if (saved === 'metric' || saved === 'imperial' || saved === 'nautical') {
        return saved as UnitSystem;
      }
      const locale = navigator.language || '';
      if (locale.includes('US') || locale.includes('en-US')) return 'imperial';
    } catch {}
    return 'metric';
  });

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('mausam_user_theme');
      if (saved === 'dark' || saved === 'light' || saved === 'stratosphere') {
        return saved as ThemeMode;
      }
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    } catch {}
    return 'dark';
  });

  // Handlers with persistence
  const handleSelectLocation = (loc: LocationTelemetry) => {
    setCurrentLocation(loc);
    try {
      localStorage.setItem('mausam_user_location', JSON.stringify(loc));
    } catch {}
  };

  const handleSelectPersona = (pName: string) => {
    setActivePersona(pName);
    try {
      localStorage.setItem('aakaash_user_persona', pName);
    } catch {}
  };

  const handleUnitChange = (unit: UnitSystem) => {
    setUnitSystem(unit);
    try {
      localStorage.setItem('mausam_user_units', unit);
    } catch {}
  };

  const handleThemeChange = (theme: ThemeMode) => {
    setThemeMode(theme);
    try {
      localStorage.setItem('mausam_user_theme', theme);
    } catch {}
  };

  // Sync with OS theme changes
  useEffect(() => {
    if (!window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleOsThemeChange = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem('mausam_user_theme');
      if (!saved) {
        setThemeMode(e.matches ? 'light' : 'dark');
      }
    };
    mediaQuery.addEventListener('change', handleOsThemeChange);
    return () => mediaQuery.removeEventListener('change', handleOsThemeChange);
  }, []);

  // Fetch telemetry from Open-Meteo
  const loadTelemetry = useCallback(async (loc: LocationTelemetry) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAtmosphericSnapshot(loc);
      setSnapshot(data);
    } catch (err: any) {
      console.error('Failed to load telemetry:', err);
      setError(err.message || 'Unable to connect to Open-Meteo atmospheric stream.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTelemetry(currentLocation);
  }, [currentLocation, loadTelemetry]);

  // Periodic refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadTelemetry(currentLocation);
    }, 300000);
    return () => clearInterval(interval);
  }, [currentLocation, loadTelemetry]);

  // 48-Hour Persona Time-Machine Morphed Snapshot
  const activeSnapshot = useMemo(() => {
    if (!snapshot) return null;
    if (hourOffset === 0 || !snapshot.hourly[hourOffset]) {
      return snapshot;
    }
    const h = snapshot.hourly[hourOffset];
    return {
      ...snapshot,
      current: {
        ...snapshot.current,
        time: h.time,
        temperature: h.temperature,
        apparentTemperature: h.apparentTemperature,
        humidity: h.humidity,
        pressure: h.pressure,
        windSpeed: h.windSpeed,
        windGusts: h.windGusts,
        windDirection: h.windDirection,
        weatherCode: h.weatherCode,
        precipitation: h.precipitation,
        uvIndex: h.uvIndex,
        visibility: h.visibility,
        isDay: h.uvIndex > 0,
      },
      lastUpdated: `Simulated (+${hourOffset}h) ${new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    };
  }, [snapshot, hourOffset]);

  const themeClasses =
    themeMode === 'light'
      ? 'bg-slate-100 text-slate-900 bg-spatial-grid-light'
      : themeMode === 'stratosphere'
      ? 'bg-[#060a14] text-slate-100 bg-spatial-grid'
      : 'bg-slate-950 text-slate-100 bg-spatial-grid';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${themeClasses}`}>
      
      {/* Top Header & Navigation */}
      <Header
        currentLocation={currentLocation}
        onSelectLocation={handleSelectLocation}
        unitSystem={unitSystem}
        onUnitChange={handleUnitChange}
        themeMode={themeMode}
        onThemeChange={handleThemeChange}
        onRefresh={() => loadTelemetry(currentLocation)}
        isLoading={isLoading}
        lastUpdated={activeSnapshot?.lastUpdated || 'Connecting...'}
        onOpenAeroCopilot={() => setIsAeroCopilotOpen(true)}
        alertCount={activeSnapshot?.alerts.filter((a) => a.severity !== 'advisory').length || 0}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        activePersona={activePersona}
        onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
        onOpenSettingsDrawer={() => setIsSettingsDrawerOpen(true)}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => loadTelemetry(currentLocation)}
              className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 transition-colors"
            >
              Retry Ingestion
            </button>
          </div>
        )}

        {/* Initial Loading Skeleton */}
        {isLoading && !activeSnapshot && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
              <Compass className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
            <div className="text-center font-mono">
              <p className="text-sm font-bold text-slate-200">Ingesting Open-Meteo Telemetry Stream...</p>
              <p className="text-xs text-slate-400 mt-1">Calibrating Mausam weights for {activePersona}</p>
            </div>
          </div>
        )}

        {activeSnapshot && (
          <>
            {/* Core Module 2: The Adaptive Dynamic Hero Widget (with Bio-Sync Advisory Card) */}
            <HeroPersonaCard
              snapshot={activeSnapshot}
              activePersona={activePersona}
              unitSystem={unitSystem}
              onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
              onOpenLocationModal={() => setIsLocationModalOpen(true)}
            />

            {/* Core Module 5: The Persona Time-Machine (48-Hour interactive timeline scrubber bar) */}
            <TimeMachineScrubber
              hourly={activeSnapshot.hourly}
              currentHourOffset={hourOffset}
              onHourOffsetChange={setHourOffset}
              unitSystem={unitSystem}
              personaName={activePersona}
            />

            {/* Core Module 3: Micro-Climate Route Safety Widget */}
            <RouteSafetyWidget
              snapshot={activeSnapshot}
              personaName={activePersona}
              unitSystem={unitSystem}
            />

            {/* Core Module 4: Bio-Sync Alarms & Night-Before Hub */}
            <BioSyncAlarmsHub
              snapshot={activeSnapshot}
              personaName={activePersona}
            />

            {/* Kinetic Wind Dial & Active Alerts Hub Row */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Kinetic Wind Dial */}
              <div className="lg:col-span-6 xl:col-span-5 flex flex-col">
                <KineticWindDial
                  windSpeed={activeSnapshot.current.windSpeed}
                  windGusts={activeSnapshot.current.windGusts}
                  windDirection={activeSnapshot.current.windDirection}
                  unitSystem={unitSystem}
                />
              </div>

              {/* Active Weather Alerts Hub */}
              <div className="lg:col-span-6 xl:col-span-7 flex flex-col">
                <ActiveAlertsHub
                  alerts={activeSnapshot.alerts}
                  cityName={activeSnapshot.location.name}
                />
              </div>

            </section>

            {/* Living Bento Grid (Populated with secondary parameters) */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                    <span>Secondary Parameters — Living Bento Grid</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Filtered for {activePersona} ({PERSONA_REGISTRY[activePersona]?.bento.join(', ') || 'Supporting metrics'})
                  </p>
                </div>
                <div className="text-xs font-mono text-cyan-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span>Living Bento Active</span>
                </div>
              </div>

              <AdaptiveBentoGrid
                current={activeSnapshot.current}
                airQuality={activeSnapshot.airQuality}
                hourly={activeSnapshot.hourly}
                daily={activeSnapshot.daily}
                unitSystem={unitSystem}
              />
            </section>

            {/* 7-Day Synoptic Forecast & Hourly Micro-Vectors */}
            <section>
              <SynopticForecast
                daily={activeSnapshot.daily}
                hourly={activeSnapshot.hourly}
                unitSystem={unitSystem}
              />
            </section>

          </>
        )}

      </main>

      {/* Floating AeroCopilot Chat Launcher */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsAeroCopilotOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium shadow-xl shadow-cyan-500/25 border border-cyan-400/40 transition-all hover:scale-105 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-cyan-100 group-hover:rotate-12 transition-transform" />
          <span className="text-xs sm:text-sm font-sans font-semibold tracking-wide">AeroCopilot AI</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
        </button>
      </div>

      {/* Core Module 1: Onboarding & Persona Selection Modal */}
      <PersonaSwitcherModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        activePersona={activePersona}
        onSelectPersona={handleSelectPersona}
      />

      {/* Core Module 6: Settings & Thresholds Control Panel Drawer */}
      <SettingsThresholdDrawer
        isOpen={isSettingsDrawerOpen}
        onClose={() => setIsSettingsDrawerOpen(false)}
        personaName={activePersona}
        unitSystem={unitSystem}
      />

      {/* Location Selector Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={currentLocation}
        onSelectLocation={handleSelectLocation}
      />

      {/* AeroCopilot Chat Modal */}
      {activeSnapshot && (
        <AeroCopilotChat
          isOpen={isAeroCopilotOpen}
          onClose={() => setIsAeroCopilotOpen(false)}
          snapshot={activeSnapshot}
        />
      )}

      {/* Telemetry Inspector Modal */}
      {activeSnapshot && (
        <TelemetryInspectorModal
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
          snapshot={activeSnapshot}
        />
      )}

      {/* Platform Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 py-6 text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-200">Mausam Intelligence Platform</span>
            <span>— 28 Persona Routing Matrix & Living Bento</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>FastAPI Python Engine</span>
            <span aria-hidden="true">·</span>
            <span>Open-Meteo Telemetry</span>
            <span aria-hidden="true">·</span>
            <span>Bio-Sync Alarms</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
