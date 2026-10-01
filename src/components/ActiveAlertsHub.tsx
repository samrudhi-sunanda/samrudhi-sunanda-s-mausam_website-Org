import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Wind,
  Sun,
  Flame,
  CloudRain,
  Gauge,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  BellRing,
  Info
} from 'lucide-react';
import { WeatherAlert } from '../types/weather';

interface ActiveAlertsHubProps {
  alerts: WeatherAlert[];
  cityName: string;
}

export const ActiveAlertsHub: React.FC<ActiveAlertsHubProps> = ({ alerts, cityName }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(
    alerts.length > 0 ? alerts[0].id : null
  );

  const categories = [
    { id: 'all', label: 'All Alerts', count: alerts.length },
    { id: 'wind', label: 'Kinetic & Wind', count: alerts.filter((a) => a.category === 'wind').length },
    { id: 'air_quality', label: 'Air Quality & Aerosol', count: alerts.filter((a) => a.category === 'air_quality').length },
    { id: 'thermal', label: 'Thermodynamics', count: alerts.filter((a) => a.category === 'thermal').length },
    { id: 'uv', label: 'Solar & UV', count: alerts.filter((a) => a.category === 'uv').length },
    { id: 'precipitation', label: 'Hydrometeors', count: alerts.filter((a) => a.category === 'precipitation').length },
  ].filter((c) => c.id === 'all' || c.count > 0);

  const filteredAlerts = selectedCategory === 'all'
    ? alerts
    : alerts.filter((a) => a.category === selectedCategory);

  const getSeverityBadge = (severity: WeatherAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            Critical Warning
          </span>
        );
      case 'severe':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Severe Advisory
          </span>
        );
      case 'moderate':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
            Moderate Watch
          </span>
        );
      case 'advisory':
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            Nominal / Advisory
          </span>
        );
    }
  };

  const getCategoryIcon = (category: WeatherAlert['category']) => {
    switch (category) {
      case 'wind':
        return <Wind className="w-4 h-4 text-cyan-400" />;
      case 'air_quality':
        return <ShieldAlert className="w-4 h-4 text-emerald-400" />;
      case 'thermal':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'uv':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'precipitation':
        return <CloudRain className="w-4 h-4 text-blue-400" />;
      case 'pressure':
        return <Gauge className="w-4 h-4 text-purple-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-5 shadow-xl flex flex-col justify-between">
      
      {/* Title & Anomaly Overview */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100 font-sans flex items-center gap-1.5">
                <span>Active Weather Alerts Hub</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {alerts.length} Detected
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Atmospheric Anomaly Early Warning System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Continuous Polling</span>
          </div>
        </div>

        {/* Category Filter Tabs */}
        {categories.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <span>{cat.label}</span>
                <span className="text-[10px] opacity-70">({cat.count})</span>
              </button>
            ))}
          </div>
        )}

        {/* Alert Cards List */}
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {filteredAlerts.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-slate-950/40 border border-slate-800/60 text-slate-400 text-xs font-mono">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2 opacity-80" />
              <p className="font-semibold text-slate-300">No active alerts in this category</p>
              <p className="text-slate-500 mt-0.5">Atmospheric column measurements remain within safe baselines.</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isExpanded = expandedAlertId === alert.id;
              const isCritical = alert.severity === 'critical';
              const isSevere = alert.severity === 'severe';

              return (
                <div
                  key={alert.id}
                  className={`rounded-xl border transition-all ${
                    isCritical
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : isSevere
                      ? 'bg-amber-950/20 border-amber-500/30'
                      : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Alert Summary Header */}
                  <div
                    onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
                    className="p-3 cursor-pointer flex items-center justify-between gap-3 select-none"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="shrink-0 p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                        {getCategoryIcon(alert.category)}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-slate-100 truncate font-sans">
                          {alert.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate font-mono">
                          {alert.headline}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {getSeverityBadge(alert.severity)}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Alert Details */}
                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 pt-1 text-xs border-t border-slate-800/60 space-y-2.5 font-sans">
                      <p className="text-slate-300 leading-relaxed">
                        {alert.description}
                      </p>

                      {/* Operational Guidance Box */}
                      <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2">
                        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-cyan-300 font-mono text-[11px] uppercase tracking-wider block mb-0.5">
                            Actionable Guidance
                          </span>
                          <span className="text-slate-300 text-xs">
                            {alert.guidance}
                          </span>
                        </div>
                      </div>

                      {/* Footer Timestamps and Trigger Value */}
                      <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                        <div className="flex items-center gap-2">
                          <span>Issued: {alert.timestamp}</span>
                          <span aria-hidden="true">·</span>
                          <span>Valid Until: {alert.validUntil}</span>
                        </div>
                        <div className="font-semibold text-amber-300">
                          Trigger: {alert.metricValue}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Hub Status Footer */}
      <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Coverage: {cityName} Atmospheric Column</span>
        <span className="text-slate-500">Refreshed real-time</span>
      </div>

    </div>
  );
};
