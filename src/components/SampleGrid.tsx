import { Sparkles } from "lucide-react";
import { SAMPLE_FOODS, SampleFood } from "../samples";

interface SampleGridProps {
  onSelectSample: (sample: SampleFood) => void;
  activeSampleId?: string;
}

export default function SampleGrid({ onSelectSample, activeSampleId }: SampleGridProps) {
  return (
    <div className="w-full space-y-4" id="sample-grid-container">
      <div className="flex items-center gap-2 text-slate-700">
        <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse-slow" />
        <h4 className="font-display font-bold text-sm text-slate-800">
          Or Select a Ghanaian Sample to Test Dashboard
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SAMPLE_FOODS.map((sample) => {
          const isActive = activeSampleId === sample.id;
          return (
            <button
              key={sample.id}
              id={`sample-card-${sample.id}`}
              onClick={() => onSelectSample(sample)}
              className={`flex items-start text-left bg-white rounded-xl p-3 border transition-all duration-300 hover:shadow-md cursor-pointer ${
                isActive
                  ? "border-emerald-600 ring-2 ring-emerald-500/20"
                  : "border-slate-100 hover:border-slate-300"
              }`}
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 mr-3 border border-slate-100 bg-slate-50">
                <img
                  src={sample.imageUrl}
                  alt={sample.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h5 className="font-display font-bold text-xs text-slate-800 truncate">
                    {sample.name}
                  </h5>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-extrabold ${
                    sample.result.healthGrade.startsWith("A") || sample.result.healthGrade.startsWith("B")
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}>
                    {sample.result.healthGrade}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {sample.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
