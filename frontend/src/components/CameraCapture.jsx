import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Check } from 'lucide-react';

export function CameraCapture({ onCapture, capturedImage, onRetake, zoneName }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const startCamera = async () => {
    try {
      setCameraError(null);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setCameraActive(true);
    } catch (err) {
      setCameraError('Camera unavailable or permission denied.');
      setCameraActive(false);
    }
  };

  useEffect(() => {
    if (!capturedImage) {
      startCamera();
    }
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [capturedImage]);

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `evidence-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(blob);
        onCapture(file, previewUrl);
        if (stream) {
          stream.getTracks().forEach((t) => t.stop());
          setCameraActive(false);
        }
      }
    }, 'image/jpeg', 0.85);
  };

  // Quick fallback snapshot for rapid browser testing
  const captureSample = (label = 'Projector') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 640;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 640, 400);

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, 560, 320);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Evidence: ${label} Issue`, 320, 180);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Campus Location: ${zoneName || 'Main Campus'}`, 320, 220);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `sample-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(blob);
        onCapture(file, previewUrl);
      }
    }, 'image/jpeg', 0.85);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative aspect-video bg-slate-950 flex items-center justify-center">
        {capturedImage ? (
          <div className="relative w-full h-full">
            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
            <div className="absolute top-3 right-3 bg-emerald-500 text-slate-950 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Photo Captured
            </div>
          </div>
        ) : cameraActive ? (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        ) : (
          <div className="text-center p-4 space-y-3">
            <Camera className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400">
              {cameraError || 'Loading live camera...'}
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => captureSample('Broken Projector')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition"
              >
                📸 Sample: Projector
              </button>
              <button
                type="button"
                onClick={() => captureSample('Water Leak')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition"
              >
                💧 Sample: Water Leak
              </button>
              <button
                type="button"
                onClick={() => captureSample('Wi-Fi Outage')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition"
              >
                🌐 Sample: Wi-Fi
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
        {capturedImage ? (
          <button
            type="button"
            onClick={onRetake}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retake Photo
          </button>
        ) : (
          <button
            type="button"
            onClick={cameraActive ? captureFrame : () => captureSample('Campus Issue')}
            className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition"
          >
            <Camera className="w-4 h-4" />
            <span>Capture Photo</span>
          </button>
        )}
      </div>
    </div>
  );
}
