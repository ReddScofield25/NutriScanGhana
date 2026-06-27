import { ShieldAlert, AlertTriangle, Lightbulb, Leaf, Activity, CheckCircle, Info, Sparkles } from "lucide-react";
import { FoodScanResult } from "../types";

interface DashboardProps {
  result: FoodScanResult;
  imageSrc?: string;
  onReset: () => void;
}

export default function Dashboard({ result, imageSrc, onReset }: DashboardProps) {
  const {
    isFoodAsset,
    foodName,
    healthGrade,
    sustainabilityScore,
    dietaryContext,
    warningFlags,
    recommendedAlternatives,
    summary,
  } = result;

  // Grade color helper
  const getGradeStyles = (grade: string) => {
    const cleanGrade = grade.trim().toUpperCase()[0] || "C";
    switch (cleanGrade) {
      case "A":
        return {
          border: "border-emerald-500",
          text: "text-emerald-700",
          bg: "bg-emerald-50/70",
          label: "Excellent Choice",
          desc: "Nutritious, whole, and highly recommended for a balanced West African diet."
        };
      case "B":
        return {
          border: "border-green-500",
          text: "text-green-700",
          bg: "bg-green-50/70",
          label: "Good Balance",
          desc: "Healthy traditional profile with moderate carbohydrate or oil content."
        };
      case "C":
        return {
          border: "border-amber-500",
          text: "text-amber-700",
          bg: "bg-amber-50/70",
          label: "Moderate Profile",
          desc: "Contains higher levels of refined starch, sodium, or cooking fats. Eat in moderation."
        };
      case "D":
      case "E":
        return {
          border: "border-orange-500",
          text: "text-orange-700",
          bg: "bg-orange-50/70",
          label: "Poor Balance",
          desc: "High in refined sugars, salt, or heavily processed ingredients. Sparing usage recommended."
        };
      case "F":
        return {
          border: "border-rose-500",
          text: "text-rose-700",
          bg: "bg-rose-50/70",
          label: "Nutritionally Deficient",
          desc: "Heavily processed food containing warning levels of artificial elements and harmful sodium loads."
        };
      default:
        return {
          border: "border-slate-400",
          text: "text-slate-700",
          bg: "bg-slate-50",
          label: "Analyzed Asset",
          desc: "Standard nutritional profile."
        };
    }
  };

  const gradeStyle = getGradeStyles(healthGrade);

  // Sustainability text helper
  const getSustainabilityLabel = (score: number) => {
    if (score >= 9) return { text: "Outstanding Sourcing", color: "text-emerald-700 bg-emerald-50 border-emerald-100" };
    if (score >= 7) return { text: "Sustainable Local Sourcing", color: "text-green-700 bg-green-50 border-green-100" };
    if (score >= 5) return { text: "Moderate Ecological Footprint", color: "text-amber-700 bg-amber-50 border-amber-100" };
    if (score >= 3) return { text: "High Environmental Burden", color: "text-orange-700 bg-orange-50 border-orange-100" };
    return { text: "Severe Ecological Footprint", color: "text-rose-700 bg-rose-50 border-rose-100" };
  };

  const sustainabilityLabel = getSustainabilityLabel(sustainabilityScore);

  // If Gemini determined that this is NOT a food asset or ingredients label
  if (!isFoodAsset) {
    return (
      <div className="bg-white border border-rose-100 rounded-2xl p-8 shadow-sm text-center max-w-2xl mx-auto my-6 animate-fade-in" id="non-food-warning">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-5 text-rose-600 border border-rose-100">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="font-display font-bold text-xl text-slate-800 mb-3">No Food Asset Detected</h2>
        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          NutriScan Ghana evaluated this photograph but was unable to identify a Ghanaian meal, food package, raw ingredient, or nutrition label. Please ensure your photo is well-lit and centers on a food item.
        </p>
        <div className="bg-slate-50 rounded-xl p-4 text-left text-xs text-slate-500 mb-6 space-y-2">
          <p className="font-medium text-slate-700">Tips for a successful scan:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Ensure the camera focuses squarely on the plate or packaging.</li>
            <li>Avoid blurry or highly dark photographs.</li>
            <li>Ensure the item is a edible asset (like Waakye, Red Red, Kontomire stew, or packaged product labels).</li>
          </ul>
        </div>
        <button
          onClick={onReset}
          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-medium text-sm rounded-xl transition-all shadow"
        >
          Try Another Photo
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-fade-in" id="dashboard-container">
      {/* Header section with Reset button and Scanned image thumbnail */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col md:flex-row items-center gap-5 justify-between">
        <div className="flex items-center gap-4 w-full md:w-auto">
          {imageSrc && (
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
              <img src={imageSrc} alt="Scanned Food Asset" className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-md font-semibold font-mono">GHANA SCAN REPORT</span>
            </div>
            <h2 className="font-display font-bold text-xl md:text-2xl text-slate-800 mt-1">
              {foodName}
            </h2>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={onReset}
            className="w-full md:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            Scan New Asset
          </button>
        </div>
      </div>

      {/* Overview Cards: Health Grade + Sustainability Meter */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* 1. Health Grade Display */}
        <div className="md:col-span-5 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between" id="health-grade-card">
          <div>
            <div className="flex items-center gap-2 text-slate-400 mb-4">
              <Activity className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overall Health Grade</span>
            </div>

            <div className="flex items-center gap-5 my-3">
              {/* Giant Badge */}
              <div className={`w-24 h-24 rounded-full border-4 ${gradeStyle.border} ${gradeStyle.bg} flex items-center justify-center shrink-0`}>
                <span className={`font-display font-black text-4xl tracking-tight ${gradeStyle.text}`}>
                  {healthGrade}
                </span>
              </div>
              <div>
                <span className={`text-xs font-bold uppercase ${gradeStyle.text}`}>
                  {gradeStyle.label}
                </span>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {gradeStyle.desc}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-50">
            <p className="text-xs text-slate-600 italic">
              &ldquo;{summary}&rdquo;
            </p>
          </div>
        </div>

        {/* 2. Sustainability Score Display */}
        <div className="md:col-span-7 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between" id="sustainability-card">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-4">
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sustainability Index</span>
              </div>
              <span className={`text-xs font-semibold font-mono border px-2 py-0.5 rounded-full ${sustainabilityLabel.color}`}>
                {sustainabilityLabel.text}
              </span>
            </div>

            <div className="my-5">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-display font-black text-slate-800 font-mono">
                  {sustainabilityScore}
                </span>
                <span className="text-slate-400 text-sm font-mono">/ 10</span>
              </div>

              {/* Progress Bar Meter */}
              <div className="flex items-center gap-1.5 h-3 w-full">
                {Array.from({ length: 10 }).map((_, i) => {
                  const isActive = i < sustainabilityScore;
                  let colorClass = "bg-slate-100";
                  if (isActive) {
                    if (sustainabilityScore >= 8) colorClass = "bg-emerald-600";
                    else if (sustainabilityScore >= 5) colorClass = "bg-amber-500";
                    else colorClass = "bg-rose-500";
                  }
                  return (
                    <div
                      key={i}
                      className={`h-full flex-1 rounded-sm transition-all duration-500 ${colorClass}`}
                      title={`Sustainability level ${i + 1}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-50 flex items-start gap-2">
            <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 leading-relaxed">
              We assess eco-grades based on food packaging waste, reliance on imported processed items vs local Ghanaian smallholder farming, and regional carbon footprint profiles.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Dedicated Informational Card: Ghanaian Dietary Context */}
      <div className="bg-emerald-900 text-white rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden" id="ghanaian-dietary-card">
        {/* Subtle Decorative Geometric Pattern Background Overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-5 pointer-events-none bg-[radial-gradient(#fff_2px,transparent_2px)] [background-size:16px_16px]" />
        
        <div className="relative flex flex-col md:flex-row md:items-start gap-5">
          <div className="p-3 bg-emerald-800 text-emerald-300 rounded-xl shrink-0 w-fit">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-bold text-lg md:text-xl text-emerald-100">
              Ghanaian Dietary Context & Traditional Insights
            </h3>
            <p className="text-sm text-emerald-50/90 leading-relaxed font-normal">
              {dietaryContext}
            </p>
          </div>
        </div>
      </div>

      {/* Columns Grid: Warnings + Local Alternatives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Column A: Health & Eco Warning Flags */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col h-full" id="warning-flags-column">
          <h3 className="font-display font-bold text-lg text-slate-800 mb-5 flex items-center gap-2 pb-3 border-b border-slate-100">
            <ShieldAlert className="h-5 w-5 text-rose-600" />
            Health & Eco Warning Flags
          </h3>

          {warningFlags && warningFlags.length > 0 ? (
            <div className="space-y-3.5 flex-1">
              {warningFlags.map((flag, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border text-sm flex items-start gap-3 transition-colors ${
                    flag.severity === "red"
                      ? "bg-rose-50/50 border-rose-100 text-rose-900"
                      : "bg-amber-50/50 border-amber-100 text-amber-900"
                  }`}
                >
                  <span className="shrink-0 mt-0.5">
                    {flag.severity === "red" ? (
                      <ShieldAlert className="h-4 w-4 text-rose-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    )}
                  </span>
                  <div className="space-y-1">
                    <span className={`text-xs font-bold uppercase tracking-wider ${flag.severity === "red" ? "text-rose-700" : "text-amber-700"}`}>
                      {flag.severity === "red" ? "ALERT RED" : "WARNING AMBER"}
                    </span>
                    <p className="leading-relaxed text-xs">{flag.text}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-emerald-50/20 border border-dashed border-emerald-100 rounded-xl">
              <CheckCircle className="h-8 w-8 text-emerald-600 mb-2" />
              <p className="text-sm font-semibold text-emerald-800">No Warning Flags!</p>
              <p className="text-xs text-slate-400 mt-1">
                This food matches nutritional and sustainability goals with clean ingredients.
              </p>
            </div>
          )}
        </div>

        {/* Column B: Recommended Local Alternatives */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col h-full" id="alternatives-column">
          <h3 className="font-display font-bold text-lg text-slate-800 mb-5 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Lightbulb className="h-5 w-5 text-emerald-600" />
            Recommended Local Alternatives
          </h3>

          <div className="space-y-4 flex-1">
            {recommendedAlternatives && recommendedAlternatives.length > 0 ? (
              recommendedAlternatives.map((alt, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-emerald-50/20 border border-emerald-100/40 rounded-xl flex items-start gap-3 hover:bg-emerald-50/35 transition-colors duration-200"
                >
                  <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg shrink-0 mt-0.5">
                    <Lightbulb className="h-3.5 w-3.5" />
                  </span>
                  <div className="space-y-1">
                    <h4 className="font-display font-bold text-sm text-emerald-950">
                      {alt.name}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {alt.reason}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 italic text-center p-8">
                No substitutes needed for this high-scoring food choice.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
