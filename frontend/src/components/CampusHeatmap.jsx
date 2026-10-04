import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polygon } from 'react-leaflet';
import api from '../services/api';
import { MapPin, AlertTriangle, CheckCircle, Clock, Layers, Sparkles } from 'lucide-react';

export function CampusHeatmap() {
  const [heatmapData, setHeatmapData] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [loading, setLoading] = useState(true);

  // Campus Center (Saveetha Engineering College, Chennai: 13.02685, 80.01686)
  const campusCenter = [13.02685, 80.01686];

  useEffect(() => {
    fetchHeatmap();
  }, []);

  const fetchHeatmap = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/heatmap');
      if (res.data?.success) {
        setHeatmapData(res.data.heatmap);
        if (res.data.heatmap.length > 0) {
          setSelectedZone(res.data.heatmap[0]);
        }
      }
    } catch (err) {
      console.error('Heatmap load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'CRITICAL':
        return '#ef4444'; // Red
      case 'MODERATE':
        return '#f97316'; // Orange
      default:
        return '#10b981'; // Green
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            SmartCampus Spatial Incident Heatmap
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Geographic clustering & infrastructure density across all university blocks.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-slate-300">High Density (≥5 Issues)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            <span className="text-slate-300">Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">Normal / Low</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Map + Zone Breakdown Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl h-[480px] relative">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              Loading campus geographic data...
            </div>
          ) : (
            <MapContainer
              center={campusCenter}
              zoom={16}
              scrollWheelZoom={true}
              className="h-full w-full z-10"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {heatmapData.map((zone) => {
                const color = getIntensityColor(zone.intensity);
                return (
                  <React.Fragment key={zone.zoneId}>
                    {/* Circle Heat Marker */}
                    <CircleMarker
                      center={[zone.center.latitude, zone.center.longitude]}
                      radius={zone.activeIncidents >= 3 ? 32 : 22}
                      pathOptions={{
                        color,
                        fillColor: color,
                        fillOpacity: 0.45,
                        weight: 2,
                      }}
                      eventHandlers={{
                        click: () => setSelectedZone(zone),
                      }}
                    >
                      <Popup>
                        <div className="text-slate-900 p-1">
                          <h4 className="font-bold text-xs">{zone.name}</h4>
                          <p className="text-[11px] text-slate-600 mt-1">
                            Active Issues: <b>{zone.activeIncidents}</b>
                          </p>
                          <p className="text-[11px] text-slate-600">
                            Critical Issues: <b>{zone.criticalIncidents}</b>
                          </p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  </React.Fragment>
                );
              })}
            </MapContainer>
          )}
        </div>

        {/* Selected Zone Intelligence Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          {selectedZone ? (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                  Zone Intelligence
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-0.5">
                  {selectedZone.name}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Code: {selectedZone.buildingCode}
                </span>
              </div>

              {/* KPI Metrics */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Active Incidents</span>
                  <span className="text-xl font-black text-amber-400">
                    {selectedZone.activeIncidents}
                  </span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Critical Flags</span>
                  <span className="text-xl font-black text-rose-400">
                    {selectedZone.criticalIncidents}
                  </span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Total Resolved</span>
                  <span className="text-xl font-black text-emerald-400">
                    {selectedZone.resolvedIncidents}
                  </span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Intensity Level</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                      selectedZone.intensity === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300'
                        : selectedZone.intensity === 'MODERATE'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {selectedZone.intensity}
                  </span>
                </div>
              </div>

              {/* Category Breakdown */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2">
                  Category Breakdown
                </h4>
                <div className="space-y-1.5 text-xs">
                  {Object.keys(selectedZone.categoryBreakdown || {}).length === 0 ? (
                    <p className="text-slate-500 text-xs">No logged categories yet.</p>
                  ) : (
                    Object.entries(selectedZone.categoryBreakdown).map(([cat, count]) => (
                      <div
                        key={cat}
                        className="flex items-center justify-between p-2 bg-slate-950/40 rounded-lg border border-slate-800/60"
                      >
                        <span className="text-slate-300">{cat}</span>
                        <span className="font-bold text-slate-200">{count} reports</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center my-auto">
              Click any campus zone marker on the map to inspect live metrics.
            </p>
          )}

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Spatial Engine</span>
            <span className="text-emerald-400 font-mono">Mapbox & Leaflet</span>
          </div>
        </div>
      </div>
    </div>
  );
}
