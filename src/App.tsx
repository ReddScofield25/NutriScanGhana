import { useState, useEffect, useRef } from "react";
import { Sparkles, Leaf, AlertCircle, Apple, Activity, BookOpen, Heart, Landmark, Info } from "lucide-react";
import Uploader from "./components/Uploader";
import Dashboard from "./components/Dashboard";
import SampleGrid from "./components/SampleGrid";
import HistoryList from "./components/HistoryList";
import { FoodScanResult, ScanHistoryItem } from "./types";
import { SampleFood } from "./samples";

export default function App() {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [activeResult, setActiveResult] = useState<FoodScanResult | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeScanId, setActiveScanId] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const dashboardRef = useRef<HTMLDivElement | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("nutriscan_ghana_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load scan history from localStorage", err);
    }
  }, []);

  // Save history to localStorage on update
  const saveHistory = (updated: ScanHistoryItem[]) => {
    setHistory(updated);
    try {
      localStorage.setItem("nutriscan_ghana_history", JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to save scan history to localStorage", err);
    }
  };

  const handleScanStart = () => {
    setScanError(null);
  };

  const handleScanComplete = (result: FoodScanResult, imageBase64: string, mimeType: string) => {
    setActiveResult(result);
    setActiveImage(imageBase64);
    setScanError(null);

    // If it's a valid food, save to history session
    if (result.isFoodAsset) {
      const newItem: ScanHistoryItem = {
        id: "scan_" + Date.now(),
        timestamp: new Date().toISOString(),
        image: imageBase64,
        mimeType: mimeType,
        result: result
      };

      const updatedHistory = [newItem, ...history];
      saveHistory(updatedHistory);
      setActiveScanId(newItem.id);
    } else {
      setActiveScanId(null);
    }

    // Scroll smoothly to dashboard
    setTimeout(() => {
      dashboardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleScanError = (errorMsg: string) => {
    setScanError(errorMsg);
    setActiveResult(null);
    setActiveImage(null);
    setActiveScanId(null);
  };

  const handleReset = () => {
    setActiveResult(null);
    setActiveImage(null);
    setActiveScanId(null);
    setScanError(null);
  };

  const handleSelectSample = (sample: SampleFood) => {
    setActiveResult(sample.result);
    setActiveImage(sample.imageUrl);
    setActiveScanId(sample.id);
    setScanError(null);

    setTimeout(() => {
      dashboardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleSelectHistory = (item: ScanHistoryItem) => {
    setActiveResult(item.result);
    setActiveImage(item.image);
    setActiveScanId(item.id);
    setScanError(null);

    setTimeout(() => {
      dashboardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleDeleteHistory = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    saveHistory(updated);
    if (activeScanId === id) {
      handleReset();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to delete all saved scan history? This action is permanent.")) {
      saveHistory([]);
      handleReset();
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfcfa] text-[#1e2925] font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-16">
      
      {/* Dynamic Ghanaian Color Band Header */}
      <div className="h-2 w-full flex">
        <div className="flex-1 bg-red-600" />
        <div className="flex-1 bg-yellow-400" />
        <div className="flex-1 bg-emerald-600" />
      </div>

      {/* Main Navigation Header */}
      <header className="border-b border-emerald-100/40 bg-white/80 backdrop-blur-md sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-700 flex items-center justify-center shadow-md shadow-emerald-700/10 shrink-0">
              <Leaf className="h-6 w-6 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-display font-black text-xl tracking-tight text-slate-800">
                  NutriScan<span className="text-emerald-700">Ghana</span>
                </h1>
                <span className="text-[10px] bg-yellow-400/20 text-yellow-800 border border-yellow-300/30 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">BETA</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none">Intelligent West African Dietary Analysis</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Apple className="h-4 w-4 text-emerald-600" />
              <span>Nutrition-First</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-100" />
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Activity className="h-4 w-4 text-emerald-600" />
              <span>Eco-Sourcing</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-100" />
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Landmark className="h-4 w-4 text-emerald-600" />
              <span>Local Heritage</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Powered by Gemini 3.5 Flash API</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-slate-800 leading-tight">
            Nourishing Ghana, Sourcing Sustainably
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Snap or upload a photo of your Ghanaian dish (Fufu, Waakye, Red Red) or scan a packaged food ingredient label. Our AI evaluates nutritional grade, local dietary context, and eco-sourcing impact instantly.
          </p>
        </div>

        {/* Global Error Banner */}
        {scanError && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-900 animate-fade-in max-w-3xl mx-auto" id="error-banner">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <h4 className="font-semibold text-sm">Analysis Request Failed</h4>
              <p className="text-xs text-rose-700 leading-relaxed">{scanError}</p>
            </div>
          </div>
        )}

        {/* Core Screen Layout (Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT/CENTER COLUMN: Scanner + Dynamic Dashboard (Span 8) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Uploader Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs relative overflow-hidden">
              {/* Corner decorative stamp */}
              <div className="absolute right-0 top-0 w-20 h-20 bg-emerald-50/20 rounded-bl-full pointer-events-none flex items-center justify-center">
                <Leaf className="h-6 w-6 text-emerald-700/15" />
              </div>

              <div className="space-y-4 relative">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-800">
                    Food Asset Scanner
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Upload an image or capture live using your camera.
                  </p>
                </div>

                <Uploader
                  onScanStart={handleScanStart}
                  onScanComplete={handleScanComplete}
                  onScanError={handleScanError}
                />
              </div>
            </div>

            {/* Dashboard Container (Displays generated analysis) */}
            {activeResult && (
              <div ref={dashboardRef} className="pt-2">
                <Dashboard
                  result={activeResult}
                  imageSrc={activeImage || undefined}
                  onReset={handleReset}
                />
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Samples Grid + Scan History Sidebar (Span 4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick-Test Sample Selector */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
              <SampleGrid
                onSelectSample={handleSelectSample}
                activeSampleId={activeScanId || undefined}
              />
            </div>

            {/* Scan History Logger */}
            <HistoryList
              history={history}
              onSelectHistory={handleSelectHistory}
              onDeleteHistory={handleDeleteHistory}
              onClearHistory={handleClearHistory}
              activeScanId={activeScanId || undefined}
            />

            {/* Localized Ghanaian Nutrition Guidelines Info Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-700">
                <BookOpen className="h-4 w-4 text-emerald-700" />
                <h4 className="font-display font-bold text-sm text-slate-800">Ghanaian Dietary Guides</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                NutriScan Ghana advocates for the revitalisation of ancestral West African nutrition systems.
              </p>
              
              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-2 text-[11px] text-slate-600">
                  <span className="font-bold text-emerald-700 shrink-0">1.</span>
                  <span><strong>Embrace Millet & Sorghum:</strong> Drought-tolerant grains packing higher fiber and protein compared to polished white rice.</span>
                </div>
                <div className="flex items-start gap-2 text-[11px] text-slate-600">
                  <span className="font-bold text-emerald-700 shrink-0">2.</span>
                  <span><strong>Moderate Palm Bleaching:</strong> Red palm oil is highly rich in vitamin A & E; excessive heating/bleaching destroys these essential nutrients.</span>
                </div>
                <div className="flex items-start gap-2 text-[11px] text-slate-600">
                  <span className="font-bold text-emerald-700 shrink-0">3.</span>
                  <span><strong>Revive Dawadawa:</strong> Harness traditional fermented locust bean seasonings to add natural cardiovascular protection.</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Modern footer */}
      <footer className="mt-20 pt-10 border-t border-slate-100/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex justify-center items-center gap-2 text-sm text-slate-400">
            <Heart className="h-4 w-4 text-rose-500 animate-pulse" />
            <span>Empowering healthy living and sustainable choices in Ghana.</span>
          </div>
          <p className="text-[11px] text-slate-400">
            &copy; {new Date().getFullYear()} NutriScan Ghana. Developed with professional AI for localized health insights. All nutritional data is generated via Gemini AI and should be used for educational guidance.
          </p>
        </div>
      </footer>

    </div>
  );
}
