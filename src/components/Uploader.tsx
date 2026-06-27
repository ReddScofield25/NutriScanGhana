import React, { useState, useRef } from "react";
import { Upload, Camera, Loader2, Sparkles, AlertCircle, X, Check } from "lucide-react";
import { FoodScanResult } from "../types";

interface UploaderProps {
  onScanStart: () => void;
  onScanComplete: (result: FoodScanResult, imageBase64: string, mimeType: string) => void;
  onScanError: (errorMsg: string) => void;
}

export default function Uploader({ onScanStart, onScanComplete, onScanError }: UploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const loadingStages = [
    "Analyzing image contours and food assets...",
    "Extracting ingredient metadata and product label specs...",
    "Evaluating nutritional density and glycemic impact...",
    "Applying localized Ghanaian dietary & cultural guidelines...",
    "Calculating agricultural and transport sustainability scores..."
  ];

  // Helper to trigger sequential loading text changes
  const startLoadingAnimation = () => {
    setIsLoading(true);
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev >= loadingStages.length - 1) {
          return prev; // hold on last step until complete
        }
        return prev + 1;
      });
    }, 2200);
    return interval;
  };

  const processFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onScanError("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }

    onScanStart();
    const loadingInterval = startLoadingAnimation();

    try {
      const base64 = await convertToBase64(file);
      // Remove dataurl prefix to get raw base64 string
      const rawBase64 = base64.split(",")[1];
      const mimeType = file.type;

      // Call Express backend scan endpoint
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: rawBase64,
          mimeType: mimeType,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to analyze image with Gemini API");
      }

      const scanResult: FoodScanResult = await response.json();
      
      // Complete!
      clearInterval(loadingInterval);
      setIsLoading(false);
      onScanComplete(scanResult, base64, mimeType);
    } catch (err: any) {
      clearInterval(loadingInterval);
      setIsLoading(false);
      console.error(err);
      onScanError(err.message || "An unexpected error occurred while communicating with NutriScan Ghana API.");
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Camera capture systems
  const startCamera = async () => {
    setIsCameraActive(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        "Could not access the device camera. If you are viewing this inside the AI Studio preview frame, please allow camera permissions or simply upload a photo using the Drag & Drop button above."
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      const rawBase64 = dataUrl.split(",")[1];
      
      // Stop webcam and start loading
      stopCamera();
      onScanStart();
      const loadingInterval = startLoadingAnimation();

      fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: rawBase64,
          mimeType: "image/jpeg",
        }),
      })
        .then(async (response) => {
          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Failed to analyze camera capture with Gemini");
          }
          return response.json();
        })
        .then((scanResult: FoodScanResult) => {
          clearInterval(loadingInterval);
          setIsLoading(false);
          onScanComplete(scanResult, dataUrl, "image/jpeg");
        })
        .catch((err: any) => {
          clearInterval(loadingInterval);
          setIsLoading(false);
          onScanError(err.message || "Failed to evaluate the camera snapshot.");
        });
    }
  };

  return (
    <div className="w-full">
      {/* File Drop & Camera Launcher */}
      <div
        id="uploader-drop-zone"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative group flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all duration-300 bg-white ${
          dragActive
            ? "border-emerald-600 bg-emerald-50/50 scale-[1.01]"
            : "border-slate-200 hover:border-emerald-500 hover:bg-slate-50/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          id="food-asset-file-input"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
        />

        <div className="flex space-x-3 mb-5">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <Upload className="h-6 w-6" id="icon-upload-asset" />
          </div>
          <button
            id="camera-launcher-btn"
            onClick={startCamera}
            className="p-3 bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all duration-300"
            title="Use Camera Capture"
          >
            <Camera className="h-6 w-6" />
          </button>
        </div>

        <h3 className="font-display font-semibold text-lg text-slate-800 mb-2">
          Upload Food Asset or Ingredients Label
        </h3>
        <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
          Drag and drop your food photo here, click to browse files, or tap the camera icon to snap a Ghanaian meal.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            id="browse-files-btn"
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            Browse Food Image
          </button>
          
          <button
            id="camera-mode-btn"
            onClick={startCamera}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            <Camera className="h-4 w-4" />
            Use Live Camera
          </button>
        </div>

        {/* Accepted Formats Footer */}
        <div className="mt-6 pt-5 border-t border-slate-100 w-full flex items-center justify-center gap-4 text-xs text-slate-400">
          <span>PNG, JPG, WEBP formats</span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <span>Max file size: 10MB</span>
        </div>
      </div>

      {/* Inline Camera Overlay Dialog */}
      {isCameraActive && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100" id="camera-modal">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2 text-emerald-800">
                <Camera className="h-5 w-5" />
                <span className="font-display font-semibold text-sm">NutriScan Ghana Camera Feed</span>
              </div>
              <button
                id="close-camera-modal"
                onClick={stopCamera}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative bg-black aspect-video flex items-center justify-center">
              {!cameraError ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="p-6 text-center text-white max-w-sm">
                  <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
                  <p className="text-sm font-medium mb-4">{cameraError}</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Select File Instead
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Tip: Center your plate or label under good lighting.
              </span>
              <div className="flex gap-2">
                <button
                  id="cancel-camera-btn"
                  onClick={stopCamera}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                {!cameraError && (
                  <button
                    id="capture-photo-btn"
                    onClick={capturePhoto}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-md flex items-center gap-1.5 transition-all"
                  >
                    Capture Scan
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simulated High-Fidelity Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-[#fbfcfad9] backdrop-blur-md flex flex-col items-center justify-center z-50 p-6 animate-fade-in" id="loading-overlay">
          <div className="text-center max-w-md w-full flex flex-col items-center">
            {/* Spinning emerald logo emblem */}
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute w-24 h-24 rounded-full border-4 border-slate-100 border-t-emerald-600 animate-spin" />
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-emerald-700 animate-pulse-slow" />
              </div>
            </div>

            <h2 className="font-display font-bold text-2xl text-slate-800 mb-3 tracking-tight">
              Analyzing Food Asset
            </h2>
            <p className="text-sm text-slate-600 font-medium mb-6 min-h-[40px] text-center leading-relaxed">
              {loadingStages[loadingStep]}
            </p>

            {/* Stepper Indicator */}
            <div className="flex gap-2.5 mb-8">
              {loadingStages.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    idx < loadingStep
                      ? "w-4 bg-emerald-600"
                      : idx === loadingStep
                      ? "w-8 bg-emerald-700 animate-pulse"
                      : "w-2 bg-slate-200"
                  }`}
                />
              ))}
            </div>

            {/* Reassuring message */}
            <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100/40 text-left">
              <p className="text-xs text-emerald-800 leading-relaxed font-normal">
                💡 <strong>NutriScan Ghana Info:</strong> Gemini is checking agricultural crop standards, locally available grains (millet, sorghum, local rice), palm oil bleaching practices, and West African dietary indices to craft a custom report.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
