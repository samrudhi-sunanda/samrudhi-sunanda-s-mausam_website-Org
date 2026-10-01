import React, { useState } from 'react';
import {
  Bell,
  Moon,
  Sun,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Calendar,
  Send,
  Zap,
  Sliders,
  AlertTriangle
} from 'lucide-react';
import { AtmosphericSnapshot } from '../types/weather';

interface BioSyncAlarmsHubProps {
  snapshot: AtmosphericSnapshot;
  personaName: string;
}

interface ScheduledAlarm {
  id: string;
  type: 'night_before' | 'morning_readiness' | 'threshold_breach';
  title: string;
  time: string;
  description: string;
  status: 'active' | 'dispatched' | 'pending';
  triggeredMetric?: string;
}

export const BioSyncAlarmsHub: React.FC<BioSyncAlarmsHubProps> = ({
  snapshot,
  personaName,
}) => {
  const [morningRoutineTime, setMorningRoutineTime] = useState<string>('06:45');
  const [nightAlertEnabled, setNightAlertEnabled] = useState<boolean>(true);
  const [testNotification, setTestNotification] = useState<string | null>(null);

  const tomorrowRainChance = snapshot.daily[1]?.precipitationProbabilityMax ?? 25;
  const tomorrowGusts = snapshot.daily[1]?.windGustsMax ?? 24;
  const tomorrowMinTemp = snapshot.daily[1]?.temperatureMin ?? 16;

  const [alarms, setAlarms] = useState<ScheduledAlarm[]>([
    {
      id: 'alarm-night',
      type: 'night_before',
      title: '20:00 Night-Before Intelligence Scan',
      time: 'Tonight at 20:00',
      description: `Evaluates tomorrow's ${tomorrowRainChance}% rain probability and ${tomorrowMinTemp}°C minimum for ${personaName}. Auto-notifies if rain gear or cold prep is needed.`,
      status: 'active',
      triggeredMetric: `Tomorrow: ${tomorrowRainChance}% rain, min ${tomorrowMinTemp}°C`,
    },
    {
      id: 'alarm-morning',
      type: 'morning_readiness',
      title: 'Morning Readiness Operational Dispatch',
      time: `Tomorrow at ${morningRoutineTime}`,
      description: `Automated Go / No-Go operational clearance 30 minutes before your planned ${morningRoutineTime} routine departure.`,
      status: 'active',
      triggeredMetric: 'Departure Synchronized',
    },
    {
      id: 'alarm-interceptor',
      type: 'threshold_breach',
      title: 'Severe Crosswind & Squall Interceptor',
      time: 'Continuous Watch',
      description: `Triggers instantaneous alert if wind gusts exceed 38 km/h or European AQI breaches 70.`,
      status: 'active',
      triggeredMetric: `Current gusts: ${snapshot.current.windGusts} km/h`,
    },
  ]);

  const triggerTestDispatch = () => {
    setTestNotification(
      `[Bio-Sync 20:00 Dispatch] Atmospheric telemetry verified for ${snapshot.location.name}. Tomorrow morning rain probability is ${tomorrowRainChance}%, peak gusts ${tomorrowGusts} km/h. Departure window cleared.`
    );
    setTimeout(() => {
      setTestNotification(null);
    }, 6000);
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-5 shadow-2xl space-y-4">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Moon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white font-sans">
                Bio-Sync Alarms & Night-Before Hub
              </h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Preventative Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Night-before (20:00) scans and morning routine operational dispatch
            </p>
          </div>
        </div>

        {/* Test Trigger Button */}
        <button
          type="button"
          onClick={triggerTestDispatch}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition-colors cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span>Simulate 20:00 Alert</span>
        </button>
      </div>

      {/* Test Notification Banner */}
      {testNotification && (
        <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/50 text-purple-200 text-xs font-mono flex items-center justify-between animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-400 shrink-0 animate-bounce" />
            <span>{testNotification}</span>
          </div>
          <button
            type="button"
            onClick={() => setTestNotification(null)}
            className="text-purple-400 hover:text-white ml-2 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Routine Configuration Card */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
        <div>
          <span className="font-bold text-white block">Morning Routine Departure Schedule</span>
          <span className="text-slate-400 text-[11px]">
            Syncs Bio-Sync alarms to evaluate weather 30 minutes before you step outdoors
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <input
              type="time"
              value={morningRoutineTime}
              onChange={(e) => setMorningRoutineTime(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-750 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
            <input
              type="checkbox"
              checked={nightAlertEnabled}
              onChange={(e) => setNightAlertEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-900 border-slate-700"
            />
            <span className="text-xs">Night Scan</span>
          </label>
        </div>
      </div>

      {/* Scheduled Alarms Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {alarms.map((alarm) => (
          <div
            key={alarm.id}
            className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 hover:bg-slate-950/80 transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-purple-400 font-semibold">{alarm.time}</span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {alarm.status}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white font-sans mb-1">
                {alarm.title}
              </h4>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                {alarm.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 font-mono text-[10px] text-slate-400 flex items-center justify-between">
              <span>Trigger:</span>
              <span className="text-cyan-300 font-medium">{alarm.triggeredMetric}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
