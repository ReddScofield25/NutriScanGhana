import { ShieldAlert, AlertTriangle, Lightbulb, Leaf, Activity, CheckCircle, Info, Sparkles, Share2, Printer, Copy, Check, Download, X } from "lucide-react";
import { useState } from "react";
import { FoodScanResult } from "../types";

interface DashboardProps {
  result: FoodScanResult;
  imageSrc?: string;
  onReset: () => void;
  isSharedView?: boolean;
}

export default function Dashboard({ result, imageSrc, onReset, isSharedView = false }: DashboardProps) {
  const [copied, setCopied] = useState(false);

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

  // Helper to copy a lightweight share link containing JSON state encoded in Base64
  const handleCopyShareLink = () => {
    try {
      // Stringify a payload excluding the massive base64 image (to keep URL light)
      const payload = {
        isFoodAsset,
        foodName,
        healthGrade,
        sustainabilityScore,
        dietaryContext,
        warningFlags,
        recommendedAlternatives,
        summary,
        // Include thumbnail URL if it is an external Unsplash image from the samples
        imageUrl: imageSrc && !imageSrc.startsWith("data:") ? imageSrc : undefined
      };

      const serialized = JSON.stringify(payload);
      const base64 = btoa(unescape(encodeURIComponent(serialized)));
      const shareUrl = `${window.location.origin}${window.location.pathname}?share=${base64}`;

      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } catch (err) {
      console.error("Failed to generate share link:", err);
    }
  };

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Check if we are inside an iframe
  const isInIframe = typeof window !== "undefined" && window.self !== window.top;

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  const handleBrowserPrint = () => {
    try {
      window.print();
    } catch (err) {
      console.error("Direct printing failed:", err);
    }
  };

  const handleDownloadHTMLReport = () => {
    try {
      // Inline styles & font loads for the offline template
      const inlineStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
      `;

      // Define CSS classes matching our grades for the HTML file
      const htmlGradeStyle = getGradeStyles(healthGrade);
      const htmlSustainabilityLabel = getSustainabilityLabel(sustainabilityScore);

      // Build out lists of warning flags and alternatives
      const warningsHTML = warningFlags && warningFlags.length > 0 
        ? warningFlags.map(flag => `
            <div style="padding: 16px; border-radius: 12px; border: 1px solid ${flag.severity === 'red' ? '#fecdd3' : '#fde68a'}; background-color: ${flag.severity === 'red' ? '#fff5f5' : '#fffbeb'}; margin-bottom: 12px; font-size: 13px;">
              <span style="font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px; color: ${flag.severity === 'red' ? '#b91c1c' : '#b45309'}; font-family: 'JetBrains Mono', monospace;">
                ${flag.severity === 'red' ? '● ALERT RED' : '▲ WARNING AMBER'}
              </span>
              <p style="color: ${flag.severity === 'red' ? '#7f1d1d' : '#78350f'}; margin: 0; line-height: 1.5;">${flag.text}</p>
            </div>
          `).join('')
        : `
            <div style="padding: 30px; text-align: center; background-color: #f0fdf4; border: 1px dashed #bbf7d0; border-radius: 12px;">
              <p style="color: #166534; font-weight: 600; margin: 0;">No Health or Eco Warning Flags!</p>
              <p style="color: #6b7280; font-size: 12px; margin-top: 4px;">This choice matches nutritional and ecological goals perfectly.</p>
            </div>
          `;

      const alternativesHTML = recommendedAlternatives && recommendedAlternatives.length > 0
        ? recommendedAlternatives.map(alt => `
            <div style="padding: 16px; background-color: #f0fdf4; border: 1px solid #dcfce7; border-radius: 12px; margin-bottom: 12px;">
              <h4 style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-weight: 700; color: #064e3b; font-size: 14px;">${alt.name}</h4>
              <p style="margin: 6px 0 0 0; font-size: 12px; color: #374151; line-height: 1.5;">${alt.reason}</p>
            </div>
          `).join('')
        : `
            <p style="font-style: italic; color: #9ca3af; font-size: 13px; text-align: center; margin-top: 20px;">No substitutes required for this premium selection.</p>
          `;

      // Color coding helper for the 10 sustainability bars in the HTML
      let barColorsHTML = "";
      for (let i = 0; i < 10; i++) {
        const isActive = i < sustainabilityScore;
        let color = '#f3f4f6';
        if (isActive) {
          if (sustainabilityScore >= 8) color = '#059669';
          else if (sustainabilityScore >= 5) color = '#d97706';
          else color = '#dc2626';
        }
        barColorsHTML += `<div style="height: 10px; flex: 1; border-radius: 2px; background-color: ${color}; margin-right: 4px;"></div>`;
      }

      const reportHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NutriScan Ghana Report - ${foodName}</title>
  <style>
    ${inlineStyles}
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #fcfdfc;
      color: #1e293b;
      margin: 0;
      padding: 40px 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #f1f5f9;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
    }
    .ghana-band {
      height: 8px;
      display: flex;
      width: 100%;
    }
    .red-band { background-color: #e1261c; flex: 1; }
    .gold-band { background-color: #f9d616; flex: 1; }
    .green-band { background-color: #006b3f; flex: 1; }
    
    .header-section {
      padding: 32px;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .food-img {
      width: 80px;
      height: 80px;
      border-radius: 16px;
      object-fit: cover;
      border: 1px solid #e2e8f0;
    }
    .report-stamp {
      font-size: 11px;
      font-weight: 700;
      color: #065f46;
      background-color: #ecfdf5;
      border: 1px solid #d1fae5;
      padding: 2px 8px;
      border-radius: 6px;
      font-family: 'JetBrains Mono', monospace;
      display: inline-block;
      text-transform: uppercase;
    }
    .food-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 28px;
      font-weight: 700;
      color: #0f172a;
      margin: 6px 0 0 0;
    }
    
    .grid-overview {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
      padding: 32px;
    }
    @media (min-width: 640px) {
      .grid-overview {
        grid-template-columns: 5fr 7fr;
      }
    }
    .card {
      background-color: #ffffff;
      border: 1px solid #f1f5f9;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.01);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .card-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 16px;
    }
    .badge-container {
      display: flex;
      align-items: center;
      gap: 20px;
      margin: 12px 0;
    }
    .circle-badge {
      width: 84px;
      height: 84px;
      border-radius: 50%;
      border: 4px solid;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 900;
      font-size: 34px;
    }
    .badge-label {
      font-weight: 700;
      font-size: 14px;
      text-transform: uppercase;
    }
    .badge-desc {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
      line-height: 1.4;
    }
    .summary-box {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #f8fafc;
      font-style: italic;
      font-size: 13px;
      color: #475569;
    }
    
    .sustainability-label {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 12px;
      border: 1px solid;
      display: inline-block;
    }
    .score-large {
      font-size: 36px;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      color: #0f172a;
    }
    .score-out-of {
      color: #94a3b8;
      font-size: 14px;
      font-family: 'JetBrains Mono', monospace;
    }
    .meter-bar {
      display: flex;
      width: 100%;
      margin-top: 12px;
    }
    .meter-desc {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #f8fafc;
      font-size: 11px;
      color: #64748b;
      line-height: 1.4;
    }
    
    .dietary-context-banner {
      background-color: #064e3b;
      color: #ffffff;
      padding: 32px;
      margin: 0 32px;
      border-radius: 20px;
    }
    .banner-title {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      font-size: 18px;
      color: #a7f3d0;
      margin: 0 0 10px 0;
    }
    .banner-text {
      font-size: 14px;
      line-height: 1.6;
      color: #ecfdf5;
      margin: 0;
    }
    
    .columns-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
      padding: 32px;
    }
    @media (min-width: 640px) {
      .columns-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    .col-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 16px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 16px 0;
      padding-bottom: 12px;
      border-bottom: 1px solid #f1f5f9;
    }
    
    .footer {
      text-align: center;
      padding: 24px;
      font-size: 11px;
      color: #94a3b8;
      border-top: 1px solid #f8fafc;
      font-family: 'JetBrains Mono', monospace;
    }
    
    @media print {
      body {
        background-color: #ffffff;
        padding: 0;
      }
      .container {
        border: none;
        box-shadow: none;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="ghana-band">
      <div class="red-band"></div>
      <div class="gold-band"></div>
      <div class="green-band"></div>
    </div>
    
    <div class="header-section">
      ${imageSrc ? `<img src="${imageSrc}" class="food-img" alt="${foodName}" />` : ''}
      <div>
        <span class="report-stamp">GHANA SCAN REPORT</span>
        <h1 class="food-title">${foodName}</h1>
      </div>
    </div>
    
    <div class="grid-overview">
      <!-- Card A: Health Grade -->
      <div class="card" style="border-top: 4px solid ${htmlGradeStyle.border.replace('border-', '') === 'emerald-500' ? '#10b981' : htmlGradeStyle.border.replace('border-', '') === 'green-500' ? '#22c55e' : htmlGradeStyle.border.replace('border-', '') === 'amber-500' ? '#f59e0b' : htmlGradeStyle.border.replace('border-', '') === 'orange-500' ? '#f97316' : '#ef4444'};">
        <div>
          <span class="card-title">Overall Health Grade</span>
          <div class="badge-container">
            <div class="circle-badge" style="border-color: ${htmlGradeStyle.border.replace('border-', '') === 'emerald-500' ? '#10b981' : htmlGradeStyle.border.replace('border-', '') === 'green-500' ? '#22c55e' : htmlGradeStyle.border.replace('border-', '') === 'amber-500' ? '#f59e0b' : htmlGradeStyle.border.replace('border-', '') === 'orange-500' ? '#f97316' : '#ef4444'}; background-color: ${htmlGradeStyle.bg.includes('emerald') ? '#ecfdf5' : htmlGradeStyle.bg.includes('green') ? '#f0fdf4' : htmlGradeStyle.bg.includes('amber') ? '#fffbeb' : htmlGradeStyle.bg.includes('orange') ? '#fff7ed' : '#fef2f2'}; color: ${htmlGradeStyle.text.includes('emerald') ? '#047857' : htmlGradeStyle.text.includes('green') ? '#15803d' : htmlGradeStyle.text.includes('amber') ? '#b45309' : htmlGradeStyle.text.includes('orange') ? '#c2410c' : '#b91c1c'};">
              ${healthGrade}
            </div>
            <div>
              <span class="badge-label" style="color: ${htmlGradeStyle.text.includes('emerald') ? '#047857' : htmlGradeStyle.text.includes('green') ? '#15803d' : htmlGradeStyle.text.includes('amber') ? '#b45309' : htmlGradeStyle.text.includes('orange') ? '#c2410c' : '#b91c1c'};">${htmlGradeStyle.label}</span>
              <p class="badge-desc">${htmlGradeStyle.desc}</p>
            </div>
          </div>
        </div>
        <div class="summary-box">
          &ldquo;${summary}&rdquo;
        </div>
      </div>
      
      <!-- Card B: Sustainability Score -->
      <div class="card">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span class="card-title">Sustainability Index</span>
            <span class="sustainability-label" style="background-color: ${htmlSustainabilityLabel.color.includes('emerald') ? '#ecfdf5' : htmlSustainabilityLabel.color.includes('green') ? '#f0fdf4' : htmlSustainabilityLabel.color.includes('amber') ? '#fffbeb' : htmlSustainabilityLabel.color.includes('orange') ? '#fff7ed' : '#fef2f2'}; border-color: ${htmlSustainabilityLabel.color.includes('emerald') ? '#d1fae5' : htmlSustainabilityLabel.color.includes('green') ? '#bbf7d0' : htmlSustainabilityLabel.color.includes('amber') ? '#fef3c7' : htmlSustainabilityLabel.color.includes('orange') ? '#fed7aa' : '#fecdd3'}; color: ${htmlSustainabilityLabel.color.includes('emerald') ? '#047857' : htmlSustainabilityLabel.color.includes('green') ? '#15803d' : htmlSustainabilityLabel.color.includes('amber') ? '#b45309' : htmlSustainabilityLabel.color.includes('orange') ? '#c2410c' : '#b91c1c'};">
              ${htmlSustainabilityLabel.text}
            </span>
          </div>
          
          <div style="margin: 12px 0;">
            <div>
              <span class="score-large">${sustainabilityScore}</span>
              <span class="score-out-of">/ 10</span>
            </div>
            <div class="meter-bar">
              ${barColorsHTML}
            </div>
          </div>
        </div>
        
        <p class="meter-desc">
          We assess eco-grades based on food packaging waste, reliance on imported processed items vs local Ghanaian smallholder farming, and regional carbon footprint profiles.
        </p>
      </div>
    </div>
    
    <div class="dietary-context-banner">
      <h3 class="banner-title">Ghanaian Dietary Context & Traditional Insights</h3>
      <p class="banner-text">${dietaryContext}</p>
    </div>
    
    <div class="columns-grid">
      <div>
        <h3 class="col-title">Health & Eco Warning Flags</h3>
        ${warningsHTML}
      </div>
      <div>
        <h3 class="col-title">Recommended Local Alternatives</h3>
        ${alternativesHTML}
      </div>
    </div>
    
    <div class="footer">
      Generated on ${new Date().toLocaleDateString('en-GH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} via NutriScan Ghana.
    </div>
  </div>
</body>
</html>
      `;

      const blob = new Blob([reportHTML], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `NutriScan_Ghana_${foodName.replace(/\s+/g, "_")}_Report.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate offline HTML report:", err);
    }
  };

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
          {isSharedView ? "Start New Food Scan" : "Try Another Photo"}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-fade-in print:space-y-6" id="dashboard-container">
      {/* Save / Export Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in print:hidden" id="export-modal">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 relative">
            <button 
              onClick={() => setIsPrintModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer transition-all"
              title="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 text-emerald-800 mb-4">
              <div className="p-2 bg-emerald-50 rounded-xl">
                <Printer className="h-6 w-6 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-slate-800">Save & Export Report</h3>
                <p className="text-xs text-slate-400 mt-0.5">Select a method to save this nutritional analysis.</p>
              </div>
            </div>

            <div className="space-y-4 my-6">
              {/* Option A: Offline HTML File */}
              <button
                onClick={() => {
                  handleDownloadHTMLReport();
                  setIsPrintModalOpen(false);
                }}
                className="w-full p-4 border border-emerald-100 bg-emerald-50/25 hover:bg-emerald-50/60 rounded-xl text-left transition-all flex items-start gap-3 cursor-pointer group"
              >
                <span className="p-2 bg-emerald-100 text-emerald-800 rounded-lg group-hover:scale-105 transition-transform shrink-0">
                  <Download className="h-4 w-4" />
                </span>
                <div className="space-y-0.5">
                  <span className="font-display font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                    Download Offline Report (.html)
                    <span className="text-[10px] bg-emerald-200/60 text-emerald-900 font-mono px-1.5 py-0.5 rounded font-bold">100% RELIABLE</span>
                  </span>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Instantly downloads a self-contained offline report with exactly the same layouts, colors, and alerts. Perfect for sandboxed workspaces! Open the downloaded file and choose 'Save as PDF' from your browser at any time.
                  </p>
                </div>
              </button>

              {/* Option B: Standard Print / PDF */}
              <button
                onClick={() => {
                  handleBrowserPrint();
                  setIsPrintModalOpen(false);
                }}
                className="w-full p-4 border border-slate-200 hover:bg-slate-50 rounded-xl text-left transition-all flex items-start gap-3 cursor-pointer group"
              >
                <span className="p-2 bg-slate-100 text-slate-700 rounded-lg group-hover:scale-105 transition-transform shrink-0">
                  <Printer className="h-4 w-4" />
                </span>
                <div className="space-y-0.5">
                  <span className="font-display font-bold text-sm text-slate-800">
                    Direct Browser Print (PDF)
                  </span>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Launches your system's native printer window directly.
                    {isInIframe && (
                      <span className="text-rose-600 font-semibold block mt-1.5">
                        ⚠️ Sandbox Notice: Standard browsers block direct printing within an iframe. For this direct button, please click the "Open in new tab" icon at the top right of the preview pane first!
                      </span>
                    )}
                  </p>
                </div>
              </button>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header section with Reset button and Scanned image thumbnail */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col md:flex-row items-center gap-5 justify-between print:border-none print:shadow-none print:p-0">
        <div className="flex items-center gap-4 w-full md:w-auto">
          {imageSrc && (
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100 print:w-20 print:h-20">
              <img src={imageSrc} alt="Scanned Food Asset" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-md font-semibold font-mono">
                {isSharedView ? "VERIFIED SHARED REPORT" : "GHANA SCAN REPORT"}
              </span>
            </div>
            <h2 className="font-display font-bold text-xl md:text-2xl text-slate-800 mt-1">
              {foodName}
            </h2>
          </div>
        </div>

        {/* Action Controls - Hides in Print Mode */}
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto shrink-0 print:hidden">
          {/* Print PDF Button */}
          <button
            onClick={handlePrint}
            className="flex-1 md:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="Print or Save as PDF"
          >
            <Printer className="h-4 w-4" />
            <span>Save PDF</span>
          </button>

          {/* Copy Share Link Button */}
          <button
            onClick={handleCopyShareLink}
            className={`flex-1 md:flex-none px-4 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              copied
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : "bg-emerald-700 hover:bg-emerald-800 text-white"
            }`}
            title="Generate & Copy uneditable shareable web link"
          >
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            <span>{copied ? "Link Copied!" : "Share Report"}</span>
          </button>

          {/* Back/Reset Button */}
          <button
            onClick={onReset}
            className="w-full md:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            {isSharedView ? "Start My Own Scan" : "Scan New"}
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
