import React, { useState } from 'react';
import {
  X,
  Sliders,
  Bell,
  Shield,
  MapPin,
  Save,
  RotateCcw,
  Check,
  Wind,
  Flame,
  Droplets,
  Gauge
} from 'lucide-react';
import { UnitSystem } from '../types/weather';
import { formatSpeed, formatTemp } from '../services/openMeteo';

interface SettingsThresholdDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  personaName: string;
  unitSystem: UnitSystem;
}

export const SettingsThresholdDrawer: React.FC<SettingsThresholdDrawerProps> = ({
  isOpen,
  onClose,
  personaName,
  unitSystem,
}) => {
  // Threshold States
  const [maxGustLimit, setMaxGustLimit] = useState<number>(38);
  const [aqiCeiling, setAqiCeiling] = useState<number>(65);
  const [rainTriggerProb, setRainTriggerProb] = useState<number>(50);
  const [heatThreshold, setHeatThreshold] = useState<number>(32);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Channels
  const [notifyInApp, setNotifyInApp] = useState<boolean>(true);
  const [notifyBrowser, setNotifyBrowser] = useState<boolean>(true);
  const [notifyNightBefore, setNotifyNightBefore] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const handleResetDefaults = () => {
    setMaxGustLimit(38);
    setAqiCeiling(65);
    setRainTriggerProb(50);
    setHeatThreshold(32);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans">
                Settings & Thresholds Panel
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Custom environmental hazard limits for {personaName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Sliders */}
        <div className="p-5 space-y-6 flex-1">
          
          {/* Slider 1: Wind Gust Limit */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                <span>Max Wind Gust Shut-off</span>
              </span>
              <span className="text-amber-400 font-bold">
                {formatSpeed(maxGustLimit, unitSystem)}
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="90"
              step="1"
              value={maxGustLimit}
              onChange={(e) => setMaxGustLimit(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <p className="text-[11px] text-slate-400 font-sans">
              Alerts trigger when gusts exceed this limit, notifying of high crosswind or structural hazard.
            </p>
          </div>

          {/* Slider 2: Air Quality AQI Ceiling */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>European AQI Ceiling</span>
              </span>
              <span className="text-emerald-400 font-bold">
                AQI {aqiCeiling}
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="120"
              step="5"
              value={aqiCeiling}
              onChange={(e) => setAqiCeiling(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <p className="text-[11px] text-slate-400 font-sans">
              Recommends HEPA filtering or indoor workout transfer if ambient AQI breaches threshold.
            </p>
          </div>

          {/* Slider 3: Rain Probability Trigger */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                <span>Precipitation Rain Alert Trigger</span>
              </span>
              <span className="text-blue-400 font-bold">
                {rainTriggerProb}% chance
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="90"
              step="5"
              value={rainTriggerProb}
              onChange={(e) => setRainTriggerProb(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-400"
            />
            <p className="text-[11px] text-slate-400 font-sans">
              Threshold probability for dispatching wet weather warnings and umbrella notifications.
            </p>
          </div>

          {/* Slider 4: Heat Index Stress Threshold */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>Apparent Heat Stress Threshold</span>
              </span>
              <span className="text-orange-400 font-bold">
                {formatTemp(heatThreshold, unitSystem)}
              </span>
            </div>
            <input
              type="range"
              min="24"
              max="45"
              step="1"
              value={heatThreshold}
              onChange={(e) => setHeatThreshold(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-400"
            />
            <p className="text-[11px] text-slate-400 font-sans">
              Triggers hyperthermia warnings, asphalt paw burn alerts, and hydration cycle advisories.
            </p>
          </div>

          {/* Notification Channels */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3 font-mono text-xs">
            <div className="text-slate-400 uppercase tracking-wider text-[10px]">
              Notification Dispatch Channels
            </div>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
              <span className="text-slate-200">In-App Floating Warnings</span>
              <input
                type="checkbox"
                checked={notifyInApp}
                onChange={(e) => setNotifyInApp(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-600 bg-slate-900 border-slate-700"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
              <span className="text-slate-200">20:00 Night-Before Intelligence Scan</span>
              <input
                type="checkbox"
                checked={notifyNightBefore}
                onChange={(e) => setNotifyNightBefore(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-600 bg-slate-900 border-slate-700"
              />
            </label>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2 rounded-xl text-xs font-semibold font-sans bg-cyan-600 hover:bg-cyan-500 text-white transition-all flex items-center justify-center gap-2"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Saved to Profile</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Persona Thresholds</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
