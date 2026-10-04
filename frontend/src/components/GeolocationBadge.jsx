import React from 'react';
import { MapPin, CheckCircle2, RefreshCw } from 'lucide-react';

export function GeolocationBadge({
  coords,
  zoneName,
  isInsideCampus = true,
  loading,
  onRefresh,
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-semibold text-slate-200">
              {loading ? 'Acquiring campus location...' : (zoneName || 'Main University Campus')}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {coords ? `Lat: ${coords.latitude.toFixed(4)}, Lng: ${coords.longitude.toFixed(4)}` : 'Campus Coordinates Locked'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium">
            <CheckCircle2 className="w-3 h-3" />
            {isInsideCampus ? 'Campus Verified' : 'Location Locked'}
          </span>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 transition"
              title="Refresh Location"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
