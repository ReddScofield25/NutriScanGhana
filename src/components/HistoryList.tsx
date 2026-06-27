import { Trash2, History, Trash } from "lucide-react";
import { ScanHistoryItem } from "../types";

interface HistoryListProps {
  history: ScanHistoryItem[];
  onSelectHistory: (item: ScanHistoryItem) => void;
  onDeleteHistory: (id: string) => void;
  onClearHistory: () => void;
  activeScanId?: string;
}

export default function HistoryList({
  history,
  onSelectHistory,
  onDeleteHistory,
  onClearHistory,
  activeScanId,
}: HistoryListProps) {
  if (history.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-6 text-center shadow-xs" id="history-empty">
        <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <History className="h-5 w-5" />
        </div>
        <h4 className="font-display font-bold text-xs text-slate-700">Scan History is Empty</h4>
        <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
          Your analyzed plates and ingredient packages will be saved here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4" id="history-panel">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-emerald-700" />
          <h4 className="font-display font-bold text-sm text-slate-800">Scan Session History</h4>
        </div>
        <button
          id="clear-all-history-btn"
          onClick={onClearHistory}
          className="text-[10px] text-slate-400 hover:text-rose-600 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          title="Clear all local scan history"
        >
          <Trash className="h-3 w-3" />
          Clear All
        </button>
      </div>

      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
        {history.map((item) => {
          const isActive = activeScanId === item.id;
          const formattedDate = new Date(item.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          }) + ", " + new Date(item.timestamp).toLocaleDateString([], {
            month: "short",
            day: "numeric"
          });

          return (
            <div
              key={item.id}
              className={`group flex items-center justify-between p-2 rounded-xl border transition-all ${
                isActive
                  ? "border-emerald-600 bg-emerald-50/20"
                  : "border-slate-50 hover:border-slate-200 hover:bg-slate-50/40"
              }`}
            >
              <button
                onClick={() => onSelectHistory(item)}
                className="flex items-center text-left min-w-0 flex-1 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-100 shrink-0 mr-3 bg-slate-50">
                  <img
                    src={item.image}
                    alt={item.result.foodName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="font-display font-semibold text-xs text-slate-800 truncate leading-tight">
                    {item.result.foodName}
                  </h5>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-[9px] font-mono font-black px-1 rounded ${
                      item.result.healthGrade.startsWith("A") || item.result.healthGrade.startsWith("B")
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}>
                      {item.result.healthGrade}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formattedDate}
                    </span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => onDeleteHistory(item.id)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-slate-50 md:opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                title="Delete item"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
