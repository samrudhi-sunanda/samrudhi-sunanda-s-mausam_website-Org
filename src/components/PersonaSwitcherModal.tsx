import React, { useState } from 'react';
import {
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Compass,
  Bike,
  Activity,
  Plane,
  Tractor,
  Camera,
  ShieldAlert,
  Sun,
  Flame,
  User,
  HeartHandshake,
  Layers,
  ArrowRight
} from 'lucide-react';
import { PERSONA_REGISTRY, PersonaCategory, PersonaDefinition } from '../types/persona';

interface PersonaSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePersona: string;
  onSelectPersona: (personaName: string) => void;
}

const CATEGORY_META: Record<PersonaCategory, { label: string; icon: any; count: number; accent: string }> = {
  'Fitness & Sports': { label: 'Fitness & Sports', icon: Activity, count: 4, accent: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  'Outdoor Adventure': { label: 'Outdoor Adventure', icon: Compass, count: 5, accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  'Travel & Transit': { label: 'Travel & Transit', icon: Plane, count: 4, accent: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  'Work & Industry': { label: 'Work & Industry', icon: Tractor, count: 5, accent: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  'Special Interests': { label: 'Special Interests', icon: Camera, count: 4, accent: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  'General Users': { label: 'General Users', icon: User, count: 1, accent: 'text-teal-400 bg-teal-500/10 border-teal-500/30' },
  'Logistics & Energy': { label: 'Logistics & Energy', icon: Flame, count: 5, accent: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
};

export const PersonaSwitcherModal: React.FC<PersonaSwitcherModalProps> = ({
  isOpen,
  onClose,
  activePersona,
  onSelectPersona,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PersonaCategory>(() => {
    return PERSONA_REGISTRY[activePersona]?.category || 'Fitness & Sports';
  });
  const [step, setStep] = useState<1 | 2>(1);
  const [previewPersona, setPreviewPersona] = useState<string>(activePersona);

  if (!isOpen) return null;

  const currentCategoryPersonas = Object.values(PERSONA_REGISTRY).filter(
    (p) => p.category === selectedCategory
  );

  const previewData = PERSONA_REGISTRY[previewPersona] || PERSONA_REGISTRY['Athletes / Runners'];

  const handleCategoryPick = (cat: PersonaCategory) => {
    setSelectedCategory(cat);
    const firstInCat = Object.values(PERSONA_REGISTRY).find((p) => p.category === cat);
    if (firstInCat) {
      setPreviewPersona(firstInCat.name);
    }
    setStep(2);
  };

  const handleConfirm = (name: string) => {
    onSelectPersona(name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[92vh] rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-blue-600/30 to-indigo-500/20 border border-cyan-500/30 text-cyan-300">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-sans">
                  Persona Routing & Telemetry Re-weighting
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Step {step} of 2
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {step === 1 ? 'Choose your operating domain' : `Select persona in ${selectedCategory}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Categories</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto max-h-[calc(92vh-150px)] space-y-4">
          
          {/* Step 1: Category Picker */}
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(Object.keys(CATEGORY_META) as PersonaCategory[]).map((catKey) => {
                const meta = CATEGORY_META[catKey];
                const IconComponent = meta.icon;
                const isCurrentCategory = selectedCategory === catKey;

                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => handleCategoryPick(catKey)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
                      isCurrentCategory
                        ? 'bg-slate-800/90 border-cyan-500/50 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                        : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2.5 rounded-xl border ${meta.accent}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1 group-hover:text-cyan-300 transition-colors">
                        <span>{meta.count} profiles</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white font-sans group-hover:text-cyan-200 transition-colors">
                        {meta.label}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Domain-tailored environmental weights
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 2: Sub-Persona Selection & Live Preview */}
          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* Persona List for Category */}
              <div className="md:col-span-6 space-y-2">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between pb-1 border-b border-slate-800">
                  <span>Available Personas ({currentCategoryPersonas.length})</span>
                  <span className="text-cyan-400">{selectedCategory}</span>
                </div>

                {currentCategoryPersonas.map((persona) => {
                  const isCurrent = previewPersona === persona.name;
                  const isActiveNow = activePersona === persona.name;

                  return (
                    <button
                      key={persona.id}
                      type="button"
                      onClick={() => setPreviewPersona(persona.name)}
                      onDoubleClick={() => handleConfirm(persona.name)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'bg-cyan-500/15 border-cyan-500/50 shadow-xs'
                          : 'bg-slate-950/50 hover:bg-slate-800/60 border-slate-800/80'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white font-sans">{persona.name}</span>
                          {isActiveNow && (
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5 font-sans">
                          {persona.tagline}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {isCurrent ? (
                          <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500 text-cyan-300 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <ArrowRight className="w-4 h-4 text-slate-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Persona High vs Low Priority Preview Panel */}
              <div className="md:col-span-6 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                      Telemetry Routing Weights
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Living Bento Layout
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white font-sans">
                    {previewData.name}
                  </h4>
                  <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                    {previewData.description}
                  </p>

                  {/* High Priority Pinned Parameters */}
                  <div className="mt-4">
                    <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                      <span>Pinned to Hero Card ({previewData.pinned.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {previewData.pinned.map((param) => (
                        <span
                          key={param}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30"
                        >
                          {param}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Secondary Bento Grid Parameters */}
                  <div className="mt-4">
                    <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                      Secondary Collapsible Bento Parameters ({previewData.bento.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {previewData.bento.map((param) => (
                        <span
                          key={param}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700/60"
                        >
                          {param}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Instant Switch CTA */}
                <div className="pt-4 mt-4 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => handleConfirm(previewData.name)}
                    className="w-full py-2.5 rounded-xl font-semibold font-sans text-xs sm:text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Activate {previewData.name} Profile</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Active Profile: <strong className="text-white">{activePersona}</strong></span>
          <span>28 Context Profiles Supported</span>
        </div>

      </div>
    </div>
  );
};
