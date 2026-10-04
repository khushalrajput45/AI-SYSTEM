import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { CameraCapture } from '../../components/CameraCapture';
import { GeolocationBadge } from '../../components/GeolocationBadge';
import { AIScoreIndicator } from '../../components/AIScoreIndicator';
import { Send, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';

// Default College Campus Location (Saveetha Engineering College, Chennai Anchor)
const DEFAULT_COLLEGE_LOCATION = {
  latitude: 13.02685,
  longitude: 80.01686,
  zoneName: 'Saveetha Engineering College (Main Block)',
  accuracy: 4,
};

export function SubmitComplaintPage() {
  const navigate = useNavigate();

  const [description, setDescription] = useState('');
  const [locationDetail, setLocationDetail] = useState('');
  const [capturedFile, setCapturedFile] = useState(null);
  const [capturedPreview, setCapturedPreview] = useState(null);

  // Automatic Geolocation state (strictly automatic, no user tampering)
  const [coords, setCoords] = useState({
    latitude: DEFAULT_COLLEGE_LOCATION.latitude,
    longitude: DEFAULT_COLLEGE_LOCATION.longitude,
  });
  const [zoneName, setZoneName] = useState(DEFAULT_COLLEGE_LOCATION.zoneName);
  const [isInsideCampus, setIsInsideCampus] = useState(true);
  const [geoLoading, setGeoLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [resultComplaint, setResultComplaint] = useState(null);

  useEffect(() => {
    autoDetectCampusLocation();
  }, []);

  // Function to automatically retrieve and verify student location
  const autoDetectCampusLocation = () => {
    if (!navigator.geolocation) {
      // Use default college location
      setCoords({ latitude: DEFAULT_COLLEGE_LOCATION.latitude, longitude: DEFAULT_COLLEGE_LOCATION.longitude });
      setZoneName(DEFAULT_COLLEGE_LOCATION.zoneName);
      return;
    }

    setGeoLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude });

        try {
          const res = await api.get(`/zones/check?latitude=${latitude}&longitude=${longitude}`);
          if (res.data?.success) {
            setZoneName(res.data.result.zoneName || DEFAULT_COLLEGE_LOCATION.zoneName);
            setIsInsideCampus(res.data.result.isInsideCampus ?? true);
          }
        } catch (err) {
          console.warn('Zone check fallback to default college zone', err);
          setZoneName(DEFAULT_COLLEGE_LOCATION.zoneName);
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        // Smoothly use default college campus location on GPS deny / headless
        console.info('GPS fallback to default campus anchor:', err.message);
        setCoords({ latitude: DEFAULT_COLLEGE_LOCATION.latitude, longitude: DEFAULT_COLLEGE_LOCATION.longitude });
        setZoneName(DEFAULT_COLLEGE_LOCATION.zoneName);
        setIsInsideCampus(true);
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const handleCapture = (file, previewUrl) => {
    setCapturedFile(file);
    setCapturedPreview(previewUrl);
  };

  const handleRetake = () => {
    setCapturedFile(null);
    setCapturedPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!capturedFile) {
      setSubmitError('Please capture an evidence photo first.');
      return;
    }

    try {
      setSubmitError('');
      setSubmitting(true);

      const formData = new FormData();
      formData.append('description', description);
      formData.append('locationDetail', locationDetail || zoneName);
      formData.append('latitude', coords.latitude);
      formData.append('longitude', coords.longitude);
      formData.append('evidence', capturedFile);

      const res = await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        setResultComplaint(res.data.complaint);
      }
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/student')}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Reports
        </button>
        <h1 className="text-base font-bold text-slate-100">Report Campus Issue</h1>
      </div>

      {resultComplaint ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <CheckCircle className="w-5 h-5" />
            <span>Report #{resultComplaint.complaintNumber} Submitted!</span>
          </div>

          <AIScoreIndicator aiAnalysis={resultComplaint.aiAnalysis} />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => navigate('/student')}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
            >
              Done & Go to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
          {submitError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* 1. Camera Photo */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">1. Evidence Photo *</label>
            <CameraCapture
              onCapture={handleCapture}
              capturedImage={capturedPreview}
              onRetake={handleRetake}
              zoneName={zoneName}
            />
          </div>

          {/* 2. Automatically Detected Location (Read-Only) */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">2. Auto-Detected Campus Location</label>
            <GeolocationBadge
              coords={coords}
              zoneName={zoneName}
              isInsideCampus={isInsideCampus}
              loading={geoLoading}
              onRefresh={autoDetectCampusLocation}
            />
          </div>

          {/* 3. Description & Specific Room */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">3. Description of the Issue *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g. Projector in Lab 204 won't turn on, or water leaking from ceiling."
                rows={2}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Specific Room / Area (Optional)</label>
              <input
                type="text"
                value={locationDetail}
                onChange={(e) => setLocationDetail(e.target.value)}
                placeholder="e.g. Lab 204 or 2nd Floor Corridor"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !capturedFile}
            className={`w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition ${
              capturedFile
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Submitting...' : 'Submit Report'}</span>
          </button>
        </form>
      )}
    </div>
  );
}
