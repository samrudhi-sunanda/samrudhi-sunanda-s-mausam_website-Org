import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  X,
  Globe,
  Radio,
  RefreshCw,
  Check,
  Compass,
  ArrowRight,
  Crosshair
} from 'lucide-react';
import { LocationTelemetry } from '../types/weather';
import { PRESET_LOCATIONS, reverseGeocode, searchLocations } from '../services/openMeteo';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LocationTelemetry;
  onSelectLocation: (loc: LocationTelemetry) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationTelemetry[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  // Manual coordinates tab
  const [isManualCoords, setIsManualCoords] = useState(false);
  const [customLat, setCustomLat] = useState(currentLocation.latitude.toString());
  const [customLon, setCustomLon] = useState(currentLocation.longitude.toString());

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Debounced geocoding search
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
    }, 280);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLiveGps = () => {
    if (!navigator.geolocation) {
      setLocateError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setLocateError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const loc = await reverseGeocode(latitude, longitude);
          onSelectLocation(loc);
          setIsLocating(false);
          onClose();
        } catch {
          onSelectLocation({
            name: 'Live GPS Location',
            country: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
            latitude: Math.round(latitude * 1000) / 1000,
            longitude: Math.round(longitude * 1000) / 1000,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          });
          setIsLocating(false);
          onClose();
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
        setLocateError('Location permission denied or unavailable. Please search for your city name instead.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleApplyCoordinates = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setLocateError('Please enter valid coordinates (-90 to 90 for Lat, -180 to 180 for Lon).');
      return;
    }
    onSelectLocation({
      name: `Site (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
      country: 'Custom Coordinates',
      latitude: lat,
      longitude: lon,
      timezone: 'auto',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl max-h-[90vh] rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-sans">
                Change Meteorological Station & Live Location
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Select your live GPS coordinates or search global cities
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          
          {/* Prominent 1-Click Live GPS Button */}
          <div className="p-4 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner shadow-cyan-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
                <Navigation className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                  <span>Use My Live GPS Location</span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Real-time
                  </span>
                </h4>
                <p className="text-xs text-slate-300 font-sans mt-0.5">
                  Pinpoint your device's exact latitude & longitude for local atmospheric telemetry
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLiveGps}
              disabled={isLocating}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold font-mono bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              {isLocating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Fixing GPS...</span>
                </>
              ) : (
                <>
                  <Crosshair className="w-4 h-4" />
                  <span>Detect Location</span>
                </>
              )}
            </button>
          </div>

          {locateError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono">
              {locateError}
            </div>
          )}

          {/* Search Bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5 text-xs font-mono text-slate-400">
              <span>Or search any city worldwide</span>
              <button
                type="button"
                onClick={() => setIsManualCoords(!isManualCoords)}
                className="text-cyan-400 hover:underline"
              >
                {isManualCoords ? 'Back to City Search' : 'Enter Exact Lat/Lon'}
              </button>
            </div>

            {!isManualCoords ? (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type city name (e.g. New York, Mumbai, Paris, Tokyo, Sydney)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-950 border-slate-750 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm font-sans"
                />
                {isSearching && (
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleApplyCoordinates} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Latitude (°N/S)</label>
                    <input
                      type="number"
                      step="any"
                      value={customLat}
                      onChange={(e) => setCustomLat(e.target.value)}
                      placeholder="e.g. 35.68"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-750 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Longitude (°E/W)</label>
                    <input
                      type="number"
                      step="any"
                      value={customLon}
                      onChange={(e) => setCustomLon(e.target.value)}
                      placeholder="e.g. 139.65"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-750 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold font-mono transition-colors"
                >
                  Apply Coordinates Telemetry
                </button>
              </form>
            )}

            {/* Live Autocomplete Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 rounded-xl border border-slate-750 bg-slate-950 overflow-hidden shadow-xl max-h-56 overflow-y-auto">
                {searchResults.map((res) => (
                  <button
                    key={`${res.latitude}-${res.longitude}-${res.name}`}
                    type="button"
                    onClick={() => {
                      onSelectLocation(res);
                      onClose();
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-900 flex items-center justify-between text-slate-200 border-b border-slate-800/60 last:border-none transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div>
                        <span className="font-semibold text-white text-xs sm:text-sm">{res.name}</span>
                        <span className="text-slate-400 text-xs ml-1.5 font-sans">
                          {[res.admin1, res.country].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500 shrink-0 ml-2">
                      {res.latitude.toFixed(2)}°, {res.longitude.toFixed(2)}°
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick-Pick Popular Meteorological Stations */}
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Preset Global Meteorological Stations</span>
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_LOCATIONS.map((preset) => {
                const isSelected = preset.name === currentLocation.name;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      onSelectLocation(preset);
                      onClose();
                    }}
                    className={`p-3 rounded-xl text-left transition-all border flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-xs'
                        : 'bg-slate-950/60 hover:bg-slate-800/80 text-slate-300 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs truncate text-white">{preset.name}</span>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      ) : (
                        <ArrowRight className="w-3 h-3 text-slate-500 opacity-60" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      {preset.country}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Active Station: <strong className="text-white">{currentLocation.name}</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
