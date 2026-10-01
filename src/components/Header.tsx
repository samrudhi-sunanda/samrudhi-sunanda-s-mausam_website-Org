import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Search,
  MapPin,
  RefreshCw,
  Sun,
  Moon,
  Sparkles,
  Sliders,
  ChevronDown,
  Navigation,
  Globe,
  Radio,
  Check,
  AlertTriangle,
  Crosshair
} from 'lucide-react';
import { LocationTelemetry, ThemeMode, UnitSystem } from '../types/weather';
import { PRESET_LOCATIONS, reverseGeocode, searchLocations } from '../services/openMeteo';

interface HeaderProps {
  currentLocation: LocationTelemetry;
  onSelectLocation: (loc: LocationTelemetry) => void;
  unitSystem: UnitSystem;
  onUnitChange: (unit: UnitSystem) => void;
  themeMode: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onRefresh: () => void;
  isLoading: boolean;
  lastUpdated: string;
  onOpenAeroCopilot: () => void;
  alertCount: number;
  onOpenLocationModal: () => void;
  activePersona: string;
  onOpenPersonaModal: () => void;
  onOpenSettingsDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocation,
  onSelectLocation,
  unitSystem,
  onUnitChange,
  themeMode,
  onThemeChange,
  onRefresh,
  isLoading,
  lastUpdated,
  onOpenAeroCopilot,
  alertCount,
  onOpenLocationModal,
  activePersona,
  onOpenPersonaModal,
  onOpenSettingsDrawer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationTelemetry[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for search and preset dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setIsLocationDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const loc = await reverseGeocode(latitude, longitude);
          onSelectLocation(loc);
        } catch {
          onSelectLocation({
            name: 'Live GPS Location',
            country: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
            latitude: Math.round(latitude * 1000) / 1000,
            longitude: Math.round(longitude * 1000) / 1000,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          });
        } finally {
          setIsLocatingGps(false);
          setIsSearchOpen(false);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocatingGps(false);
        alert('Could not access live location. Please grant location permissions or search for your city name.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl border-b transition-colors duration-200 border-slate-800/80 bg-slate-950/85 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand & Telemetry Status */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-blue-600/30 to-indigo-500/20 border border-cyan-500/30 shadow-inner shadow-cyan-500/20">
              <Compass className="w-5 h-5 text-cyan-400 animate-spin-slow" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
                  <span>Mausam</span>
                  <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                    Living Bento
                  </span>
                </h1>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Atmospheric Bio-Sync Engine</span>
              </div>
            </div>
          </div>

          {/* Center: Search & Location Switcher */}
          <div className="flex-1 max-w-md relative" ref={searchRef}>
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search city, station, airport..."
                className="w-full pl-9 pr-28 py-1.5 text-xs sm:text-sm rounded-lg border bg-slate-900/90 border-slate-750 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-sans"
              />

              {/* Station Quick Buttons inside Search Input */}
              <div className="absolute inset-y-0 right-1 flex items-center gap-1 pr-1">
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={isLocatingGps}
                  title="Detect My Live GPS Location"
                  className="flex items-center gap-1 px-1.5 py-1 text-xs rounded text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/15 border border-cyan-500/30 transition-colors font-mono"
                >
                  {isLocatingGps ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Navigation className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline text-[11px]">GPS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                  className="flex items-center gap-1 px-1.5 py-1 text-xs rounded text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-750 border border-slate-700/60 font-mono"
                >
                  <span>Stations</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Location Autocomplete Dropdown */}
            {isSearchOpen && (searchResults.length > 0 || isSearching) && (
              <div className="absolute left-0 right-0 mt-1.5 py-1.5 rounded-xl border shadow-2xl z-50 overflow-hidden bg-slate-900 border-slate-750 backdrop-blur-2xl">
                {/* 1-click live GPS item */}
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={isLocatingGps}
                  className="w-full text-left px-3 py-2 text-xs sm:text-sm bg-cyan-950/30 hover:bg-cyan-950/50 flex items-center justify-between text-cyan-300 border-b border-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Navigation className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span className="font-semibold">Detect My Current GPS Location</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400">Live Device Fix</span>
                </button>

                {isSearching && (
                  <div className="px-3 py-2 text-xs text-slate-400 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>Querying geocoding coordinates...</span>
                  </div>
                )}
                {searchResults.map((result) => (
                  <button
                    key={`${result.latitude}-${result.longitude}-${result.name}`}
                    type="button"
                    onClick={() => {
                      onSelectLocation(result);
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-slate-800/70 flex items-center justify-between text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="font-medium text-white">{result.name}</span>
                      {result.admin1 && <span className="text-slate-400 text-xs">{result.admin1},</span>}
                      {result.country && <span className="text-slate-400 text-xs">{result.country}</span>}
                    </div>
                    <span className="font-mono text-[10px] text-slate-500 shrink-0 ml-2">
                      {result.latitude.toFixed(2)}°, {result.longitude.toFixed(2)}°
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Presets Dropdown */}
            {isLocationDropdownOpen && !isSearchOpen && (
              <div className="absolute left-0 right-0 mt-1.5 p-2 rounded-xl border shadow-2xl z-50 bg-slate-900 border-slate-750">
                <div className="text-[11px] font-mono uppercase text-slate-400 px-2 py-1 flex items-center justify-between">
                  <span>Meteorological Stations</span>
                  <Globe className="w-3 h-3 text-cyan-400" />
                </div>
                <div className="grid grid-cols-3 gap-1.5 mt-1">
                  {PRESET_LOCATIONS.map((preset) => {
                    const isSelected = preset.name === currentLocation.name;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          onSelectLocation(preset);
                          setIsLocationDropdownOpen(false);
                        }}
                        className={`px-2.5 py-1.5 text-xs rounded-lg text-left transition-colors truncate flex items-center justify-between ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                            : 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 border border-transparent'
                        }`}
                      >
                        <span className="truncate">{preset.name}</span>
                        {isSelected && <Check className="w-3 h-3 text-cyan-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Controls: Units, Refresh, AeroCopilot, Theme */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Unit Toggle */}
            <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => onUnitChange('metric')}
                className={`px-2 py-1 rounded transition-colors ${
                  unitSystem === 'metric'
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Metric (°C, km/h, hPa)"
              >
                SI Metric
              </button>
              <button
                type="button"
                onClick={() => onUnitChange('nautical')}
                className={`px-2 py-1 rounded transition-colors ${
                  unitSystem === 'nautical'
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Nautical (Knots, °C)"
              >
                Nautical
              </button>
              <button
                type="button"
                onClick={() => onUnitChange('imperial')}
                className={`px-2 py-1 rounded transition-colors ${
                  unitSystem === 'imperial'
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Imperial (°F, mph, inHg)"
              >
                Imperial
              </button>
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              title={`Last updated: ${lastUpdated}. Click to re-poll Open-Meteo.`}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            {/* Live Persona Switcher Pill */}
            <button
              type="button"
              onClick={onOpenPersonaModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-500/20 to-indigo-600/30 hover:from-purple-500/30 hover:to-indigo-600/40 text-purple-300 border border-purple-500/40 shadow-xs transition-all cursor-pointer"
              title="Change active persona from the 28-profile matrix"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline font-sans truncate max-w-[130px]">{activePersona}</span>
              <span className="sm:hidden font-sans">Persona</span>
            </button>

            {/* AeroCopilot CTA */}
            <button
              type="button"
              onClick={onOpenAeroCopilot}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-cyan-500/20 to-blue-600/30 hover:from-cyan-500/30 hover:to-blue-600/40 text-cyan-300 border border-cyan-500/40 shadow-xs shadow-cyan-500/10 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="font-sans hidden sm:inline">AeroCopilot</span>
            </button>

            {/* Settings & Thresholds */}
            <button
              type="button"
              onClick={onOpenSettingsDrawer}
              title="Settings & Thresholds Panel"
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => onThemeChange(themeMode === 'dark' ? 'stratosphere' : themeMode === 'stratosphere' ? 'light' : 'dark')}
                title={`Current theme: ${themeMode}. Click to cycle.`}
                className="p-1.5 rounded text-slate-300 hover:text-cyan-400 transition-colors"
              >
                {themeMode === 'light' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : themeMode === 'stratosphere' ? (
                  <Globe className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Moon className="w-4 h-4 text-blue-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sub-bar: Coordinate Readout & Active Station Meta */}
        <div className="py-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenLocationModal}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-semibold transition-colors"
              title="Click to change location or use GPS"
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentLocation.name}</span>
              <span className="text-[10px] text-cyan-400/80 font-normal">· Change</span>
            </button>
            {currentLocation.country && <span>({currentLocation.country})</span>}
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{currentLocation.latitude >= 0 ? `${currentLocation.latitude.toFixed(2)}°N` : `${Math.abs(currentLocation.latitude).toFixed(2)}°S`}</span>
            <span>{currentLocation.longitude >= 0 ? `${currentLocation.longitude.toFixed(2)}°E` : `${Math.abs(currentLocation.longitude).toFixed(2)}°W`}</span>
            {currentLocation.elevation !== undefined && (
              <>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Elev: {currentLocation.elevation}m</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isLocatingGps}
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
              title="Detect device GPS coordinates"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>{isLocatingGps ? 'Locating...' : 'Use My GPS'}</span>
            </button>
            {alertCount > 0 && (
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{alertCount} Active Alerts</span>
              </span>
            )}
            <span className="text-slate-500">Updated: {lastUpdated}</span>
          </div>
        </div>

      </div>
    </header>
  );
};

