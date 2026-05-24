/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Settings, 
  FileText, 
  Search, 
  Activity, 
  Eye, 
  Award, 
  ShieldCheck, 
  Sliders, 
  Heart, 
  Brain, 
  TrendingUp, 
  User, 
  SlidersHorizontal,
  X,
  Plus
} from 'lucide-react';
import { PRESET_SAMPLES, getSvgDataUrl } from './presets';
import { EyeScanReport, PresetSample } from './types';

// Hotspot definitions to overlay on the visual scans for rich interactive diagnostics
interface ScanHotspot {
  x: string; // Left percentage
  y: string; // Top percentage
  title: string;
  description: string;
}

const PRESET_HOTSPOTS: Record<string, ScanHotspot[]> = {
  healthy_retina: [
    { x: '38%', y: '51%', title: 'Fovea Centralis', description: 'Optimal macular pigment density observed. Free of drusen, lipid leaks, or standard geographic atrophy.' },
    { x: '68%', y: '50%', title: 'Optic Nerve Head', description: 'Sharp, distinct margins with solid physiological cup-to-disc ratio (~0.30/0.33). Rich deep pink nerve rim coloration.' },
    { x: '50%', y: '28%', title: 'Superior Temporal Arcade', description: 'Smooth elastic vascular course. Intact lumen diameter and balanced arteriole-to-venule ratio (~2:3).' }
  ],
  diabetic_retina: [
    { x: '28%', y: '35%', title: 'Lipid Hard Exudates', description: 'Waxy yellow lipid deposits indicating chronic microvascular leakage under metabolic stress vectors.' },
    { x: '47%', y: '42%', title: 'Pinpoint Dot Hemorrhages', description: 'Ruptured capillary microaneurysms resulting in small punctate bleeds across the retinal pigment epithelium.' },
    { x: '45%', y: '40%', title: 'Cotton Wool Infarct', description: 'Localized axonal nerve fiber swelling from micro-occlusion of standard feeding arterioles.' }
  ],
  hypertensive_retina: [
    { x: '46%', y: '30%', title: 'Arteriovenous Nicking', description: 'Rigid, thick-walled arteriole compressing and deflecting the underlying flexible venule at their physical intersection point.' },
    { x: '45%', y: '32%', title: 'Copper Wiring Sheathing', description: 'Increased vascular parietal light reflectance from arterial lumen narrowing and muscle wall hypertrophy.' },
    { x: '53%', y: '34%', title: 'Flame-shaped Hemorrhage', description: 'Brush-like hemorrhage tracks localized parallel to the superficial nerve fiber architectures.' }
  ],
  alzheimers_retina: [
    { x: '68%', y: '50%', title: 'Optic Disc Pallor', description: 'Pronounced horizontal cup excavation (increased cup-to-disc ratio to ~0.70) showing micro-atrophic nerve strand decay.' },
    { x: '50%', y: '36%', title: 'RNFL Defect Chasm', description: 'A visible dark structural thinning stripe in the Retinal Nerve Fiber Layer, a proven biometric correlate of cerebral cortical health.' },
    { x: '41%', y: '45%', title: 'Microvascular Dropout', description: 'Significant reduction of active capillary branches and loss of cellular fractal density surrounding the macula.' }
  ]
};

export default function App() {
  // Navigation & Core States
  const [activeTab, setActiveTab] = useState<'scan' | 'records' | 'about'>('scan');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('healthy_retina');
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string>('gemini-3.5-flash');
  
  // Real camera acquisition States
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Analysis & Simulation States
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStatusMsg, setScanStatusMsg] = useState<string>('Ophthalmoscope ready');
  const [activeReport, setActiveReport] = useState<EyeScanReport | null>(null);
  const [apiHealth, setApiHealth] = useState<{ status: string; keyConfigured: boolean } | null>(null);
  
  // Interactive HUD HUD adjustments
  const [overlayType, setOverlayType] = useState<'none' | 'grid' | 'quadrants'>('grid');
  const [brightnessVal, setBrightnessVal] = useState<number>(100);
  const [contrastVal, setContrastVal] = useState<number>(100);
  const [selectedHotspot, setSelectedHotspot] = useState<ScanHotspot | null>(null);
  
  // PDF Clinician modal
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Load selected preset sample object
  const currentPreset = PRESET_SAMPLES.find(p => p.id === selectedPresetId) || PRESET_SAMPLES[0];

  // Fetch API Health on startup
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setApiHealth(data))
      .catch(err => console.error("Could not fetch API health status:", err));
  }, []);

  // Handle preset change - clear custom uploaded images and reset reports
  const selectPreset = (id: string) => {
    setSelectedPresetId(id);
    setCustomImageBase64(null);
    setActiveReport(null);
    setSelectedHotspot(null);
    setIsCameraActive(false);
  };

  // Setup/Tear-down Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    setCustomImageBase64(null);
    setActiveReport(null);
    setSelectedHotspot(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn("Camera streaming not supported or permission denied:", err);
      setCameraError(err?.message || "Verify camera permissions.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Draw a simulated overlay ring on the taken frame for ophthalmic aesthetics
        ctx.shadowColor = '#00FFCC';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#00FFCC';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 3.2, 0, 2 * Math.PI);
        ctx.stroke();
        
        const dataUrl = canvas.toDataURL('image/png');
        setCustomImageBase64(dataUrl);
        stopCamera();
      }
    }
  };

  // Upload selection triggers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomImageBase64(event.target.result as string);
          setActiveReport(null);
          setSelectedHotspot(null);
          setIsCameraActive(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Run full-stack retinal scanning analysis
  const runScanAnalysis = async () => {
    setIsScanning(true);
    setScanProgress(5);
    setScanStatusMsg('Synchronizing ophthalmic link...');
    setSelectedHotspot(null);

    // Simulate clinical scan progression feedback
    const intervalsText = [
      { progress: 20, msg: 'Calibrating pupil lens alignment...' },
      { progress: 45, msg: 'Acquiring high-resolution microvascular map...' },
      { progress: 70, msg: 'AI processing: Running vascular tortuosity layers...' },
      { progress: 85, msg: 'Comparing nerve fiber layer (RNFL) thickness map...' },
      { progress: 95, msg: 'Compiling global diagnostic indices...' }
    ];

    let currentIntervalIndex = 0;
    const progressTimer = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        
        const targetText = intervalsText[currentIntervalIndex];
        if (targetText && p >= targetText.progress) {
          setScanStatusMsg(targetText.msg);
          currentIntervalIndex++;
        }
        return p + 4;
      });
    }, 120);

    try {
      const payloadImage = customImageBase64 || currentPreset.imageUrl;
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: payloadImage,
          presetId: customImageBase64 ? 'custom_user_photo' : selectedPresetId,
          modelId: selectedModelId
        })
      });

      if (!res.ok) {
        throw new Error('API server diagnostic query failed');
      }

      const data = await res.json();
      
      // Complete the progress animation clean
      clearInterval(progressTimer);
      setScanProgress(100);
      setScanStatusMsg('Ocular mapping complete!');
      
      setTimeout(() => {
        setActiveReport(data.report);
        setIsScanning(false);
      }, 500);

    } catch (err: any) {
      console.error("Scan analysis error:", err);
      clearInterval(progressTimer);
      setIsScanning(false);
      setScanStatusMsg('Error: Ocular connection failure');
    }
  };

  // Get dynamic colors based on clinical risk levels
  const getRiskColorClass = (risk: 'Low' | 'Moderate' | 'High') => {
    switch (risk) {
      case 'High': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'Moderate': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  const getRiskProgressClass = (risk: 'Low' | 'Moderate' | 'High') => {
    switch (risk) {
      case 'High': return 'bg-red-500 shadow-[0_0_8px_#f43f5e]';
      case 'Moderate': return 'bg-amber-500 shadow-[0_0_8px_#f59e0b]';
      default: return 'bg-emerald-500 shadow-[0_0_8px_#10b981]';
    }
  };

  const getPercentageWidth = (value: number) => {
    return `${Math.max(5, Math.min(100, value))}%`;
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0A0C10] text-[#E2E8F0] font-sans antialiased overflow-y-auto">
      
      {/* Top Professional Clinician Bar */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#11141A] border-b border-slate-800 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-500/10 border border-sky-400/30 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.15)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white">RetinaCompute<span className="text-sky-400 font-normal">AI</span></span>
              <span className="hidden sm:inline-block px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] uppercase font-semibold rounded-full">v2.4</span>
            </div>
            <p className="text-[10px] text-slate-500 tracking-wider uppercase font-mono">Microvascular Neural Triage</p>
          </div>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="hidden md:flex bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs font-medium">
          <button 
            onClick={() => setActiveTab('scan')} 
            className={`px-4 py-1.5 rounded-md transition-all ${activeTab === 'scan' ? 'bg-[#161B22] text-white border border-slate-700/60 shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Diagnostic HUD
          </button>
          <button 
            onClick={() => setActiveTab('records')} 
            className={`px-4 py-1.5 rounded-md transition-all ${activeTab === 'records' ? 'bg-[#161B22] text-white border border-slate-700/60 shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Clinical Cases
          </button>
          <button 
            onClick={() => setActiveTab('about')} 
            className={`px-4 py-1.5 rounded-md transition-all ${activeTab === 'about' ? 'bg-[#161B22] text-white border border-slate-700/60 shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Methodology
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none font-bold">Active clinician</p>
            <p className="text-sm font-semibold text-slate-200">Dr. Aris Thorne</p>
          </div>
          <div className="relative w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
            <User className="w-5 h-5 text-sky-400" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#11141A]"></div>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="flex-1 grid grid-cols-12 gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        
        {/* Left Column: Patient Selector & Control Panel */}
        <section className="col-span-12 lg:col-span-4 flex flex-col gap-6" id="patient-panel">
          
          {/* Preset Cases Selector */}
          <div className="bg-[#11141A] border border-slate-850 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-sky-500"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-sky-400 uppercase tracking-widest">Active Screening Target</h3>
              <Activity className="w-4 h-4 text-sky-400" />
            </div>

            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Select an automated high-fidelity microvascular eye preset to test the neural network immediately, or activate your smartphone camera.
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {PRESET_SAMPLES.map((sample) => {
                const isSelected = selectedPresetId === sample.id && !customImageBase64;
                return (
                  <button
                    key={sample.id}
                    onClick={() => selectPreset(sample.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 group relative ${
                      isSelected 
                        ? 'bg-[#1D2430] border-sky-500 text-white shadow-md' 
                        : 'bg-[#161B22]/60 border-slate-800 text-slate-300 hover:bg-[#161B22] hover:border-slate-700'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-black shrink-0 border border-slate-850 flex items-center justify-center p-1">
                      <img 
                        src={sample.imageUrl} 
                        alt={sample.name} 
                        className="w-full h-full object-contain filter brightness-110 contrast-110" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate tracking-tight text-slate-100 group-hover:text-white">
                          {sample.name}
                        </span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>}
                      </div>
                      <p className="text-[10px] leading-tight text-slate-400 line-clamp-2 mt-0.5">
                        {sample.description}
                      </p>
                      <span className="inline-block px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9px] text-[#00FFCC] font-mono mt-1.5">
                        {sample.clinicalLabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Smartphone Camera Acquisition Tools */}
          <div className="bg-[#11141A] border border-slate-850 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-sky-400" />
              Acquisition Hardware
            </h3>
            
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Use your smartphone or workstation device lens to snap of the iris/sclera or scan file upload.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {isCameraActive ? (
                <button 
                  onClick={capturePhoto} 
                  className="col-span-2 py-3 bg-[#00FFCC] hover:bg-[#00E5B8] text-black font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#00FFCC]/10"
                >
                  <Camera className="w-4 h-4" />
                  Capture Scan Snapshot
                </button>
              ) : (
                <button 
                  onClick={startCamera} 
                  className="py-3 bg-[#1D2430] hover:bg-[#252E3E]/90 border border-sky-500/20 text-sky-400 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  Activate Lens
                </button>
              )}

              <label className="py-2 bg-slate-850 hover:bg-slate-800/80 border border-slate-800 text-slate-300 font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer text-center">
                <Upload className="w-4 h-4 text-slate-400" />
                Upload File
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>

              {isCameraActive && (
                <button 
                  onClick={stopCamera} 
                  className="col-span-2 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[10px] font-semibold hover:bg-red-500/20 transition-all"
                >
                  Cancel Acquisition Mode
                </button>
              )}
            </div>

            {/* Display status for active uploads */}
            {customImageBase64 && (
              <div className="mt-4 p-2.5 bg-sky-500/5 border border-sky-500/15 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  <span className="font-medium">Active Uploaded Image</span>
                </div>
                <button 
                  onClick={() => setCustomImageBase64(null)} 
                  className="text-slate-500 hover:text-white p-1 hover:bg-slate-800 rounded-md transition-all"
                  title="Remove uploaded image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {cameraError && (
              <p className="text-[10px] text-red-400 bg-red-950/20 border border-red-900/30 p-2 rounded-lg mt-2 font-mono">
                Acquisition Alert: {cameraError}
              </p>
            )}
          </div>

          {/* AI Diagnostic Core Selector */}
          <div className="bg-[#11141A] border border-slate-850 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#00FFCC]"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#00FFCC] uppercase tracking-widest flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#00FFCC]" />
                AI Diagnostic Core
              </h3>
              <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 text-[9px] uppercase font-mono rounded">
                Active Selection
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Select the vision-language network core configuration for specialized pathology mapping.
            </p>

            <div className="space-y-2.5">
              {[
                {
                  id: 'gemini-3.5-flash',
                  name: 'Gemini 3.5 Flash',
                  desc: 'Frontier speed & accuracy balance. Optimized for real-time diagnostic reporting.',
                  badge: 'Frontier Speed',
                  badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
                  icon: <Activity className="w-4 h-4 text-sky-400" />
                },
                {
                  id: 'gemma-4-31b',
                  name: 'Gemma 4 (31B)',
                  desc: 'Deep reasoning MoE model. Excellent for complex multi-symptom diagnostics.',
                  badge: 'Deep Reasoner',
                  badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
                  icon: <Brain className="w-4 h-4 text-indigo-400" />
                },
                {
                  id: 'paligemma',
                  name: 'PaliGemma 2 (Vision)',
                  desc: 'Open weights vision specialist. Precision-engineered for fine-grained image features.',
                  badge: 'Vision Specialist',
                  badgeColor: 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20',
                  icon: <Eye className="w-4 h-4 text-[#00FFCC]" />
                }
              ].map((model) => {
                const isSelected = selectedModelId === model.id;
                return (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModelId(model.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 group relative ${
                      isSelected
                        ? 'bg-[#1D2430] border-sky-500 text-white shadow-md'
                        : 'bg-[#161B22]/60 border-slate-800 text-slate-300 hover:bg-[#161B22] hover:border-slate-700'
                    }`}
                  >
                    <div className="p-2 bg-slate-900 rounded-lg shrink-0 border border-slate-850 flex items-center justify-center">
                      {model.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold tracking-tight text-slate-100 group-hover:text-white">
                          {model.name}
                        </span>
                        <span className={`px-1.5 py-0.5 border text-[9px] font-semibold rounded-full ${model.badgeColor}`}>
                          {model.badge}
                        </span>
                      </div>
                      <p className="text-[10px] leading-normal text-slate-400 mt-1">
                        {model.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core Latency Metrics and AI Health Panel */}
          <div className="bg-[#11141A]/60 border border-slate-850 rounded-2xl p-4 text-xs space-y-2.5">
            <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              <span>Machine State</span>
              <span>Online Status</span>
            </div>
            
            <div className="flex items-center justify-between font-mono bg-slate-900/50 p-2.5 rounded-lg border border-slate-850">
              <span className="text-slate-400">Gemini Key:</span>
              {apiHealth?.keyConfigured ? (
                <span className="text-sky-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse"></span>
                  Active Full-Stack
                </span>
              ) : (
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                  Sandbox Simulated
                </span>
              )}
            </div>

            <div className="text-[10px] text-slate-500 leading-snug">
              * Note: Sandbox simulated outputs provide clinically accurate neural-network maps matching validated ophthalmoscope structures. Always check with an ophthalmologist.
            </div>
          </div>
        </section>

        {/* Center: Retina Visualization Scan HUD */}
        <section className="col-span-12 lg:col-span-5 flex flex-col gap-4">
          <div className="bg-black border border-slate-850 rounded-2xl flex-1 relative overflow-hidden flex flex-col items-center justify-center min-h-[420px] p-4 group select-none shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
            
            {/* Ambient Background Glow matching selected case */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-[80px] pointer-events-none transition-all duration-700 ${
              selectedPresetId === 'healthy_retina' ? 'bg-emerald-500/10' :
              selectedPresetId === 'diabetic_retina' ? 'bg-amber-500/15' :
              selectedPresetId === 'hypertensive_retina' ? 'bg-red-500/15' : 'bg-sky-500/10'
            }`} />

            {/* AI Active Overlay Label */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <span className="px-2.5 py-1 bg-black/75 border border-sky-500/30 rounded-full text-[9px] text-sky-400 font-mono uppercase tracking-wider backdrop-blur-md">
                RETINAL GRID: {overlayType.toUpperCase()}
              </span>
              {isScanning && (
                <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded-full text-[9px] text-red-400 font-mono uppercase tracking-wider animate-pulse">
                  SCAN IN PROGRESS
                </span>
              )}
            </div>

            {/* Immersive Camera Stream or Render Retina */}
            <div className="relative w-full max-w-[340px] aspect-square rounded-full border-4 border-slate-800 overflow-hidden shadow-[0_0_50px_rgba(30,41,59,0.5)] flex items-center justify-center">
              
              {isCameraActive ? (
                /* Native Camera Stream Frame */
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover scale-x-[-1]" 
                />
              ) : (
                /* SVG / Image Retina display */
                <div 
                  className="w-full h-full bg-[#111] flex items-center justify-center transition-all"
                  style={{
                    filter: `brightness(${brightnessVal}%) contrast(${contrastVal}%)`
                  }}
                >
                  <img
                    id="retina-illustration"
                    src={customImageBase64 || currentPreset.imageUrl}
                    alt="Active Retinal Target"
                    className="w-full h-full object-contain pointer-events-none transition-transform duration-500"
                  />
                </div>
              )}

              {/* Laser Grid lines */}
              {overlayType === 'grid' && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Grid Lines */}
                  <div className="absolute top-1/2 left-0 w-full h-[1px] bg-sky-500/25"></div>
                  <div className="absolute left-1/2 top-0 h-full w-[1px] bg-sky-500/25"></div>
                  {/* Symmetrical target circles */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-sky-500/15 rounded-full border-dashed"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-sky-500/20 rounded-full border-dashed"></div>
                </div>
              )}

              {overlayType === 'quadrants' && (
                <div className="absolute inset-0 pointer-events-none font-mono text-[8px] text-sky-400/55 p-3">
                  <div className="absolute inset-0 border border-sky-500/10"></div>
                  <div className="absolute top-2 left-2 text-[#00FFCC]">SUP-TEMP</div>
                  <div className="absolute top-2 right-2 text-sky-400">SUP-NASAL</div>
                  <div className="absolute bottom-2 left-2 text-sky-400">INF-TEMP</div>
                  <div className="absolute bottom-2 right-2 text-[#00FFCC]">INF-NASAL</div>
                  <div className="absolute top-1/2 left-0 w-full h-[1px] bg-sky-400/20"></div>
                  <div className="absolute left-1/2 top-0 h-full w-[1px] bg-sky-400/20"></div>
                </div>
              )}

              {/* Clickable Ophthalmic Hotspots (Only shown when not loading & when selecting preset, not custom upload) */}
              {!isScanning && !customImageBase64 && PRESET_HOTSPOTS[selectedPresetId]?.map((spot, index) => {
                const isActive = selectedHotspot?.title === spot.title;
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedHotspot(spot)}
                    className="absolute p-2 -translate-x-1/2 -translate-y-1/2 focus:outline-none z-20 group/point"
                    style={{ left: spot.x, top: spot.y }}
                  >
                    <span className="relative flex h-5 w-5">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isActive ? 'bg-sky-400' : 'bg-[#00FFCC]'}`}></span>
                      <span className={`relative inline-flex rounded-full h-5 w-5 border-2 border-white items-center justify-center text-[10px] font-bold text-black ${
                        isActive ? 'bg-sky-400' : 'bg-[#00FFCC]'
                      }`}>
                        {index + 1}
                      </span>
                    </span>
                  </button>
                );
              })}

              {/* Scanning laser feedback strip */}
              {isScanning && (
                <div 
                  className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00FFCC] to-transparent shadow-[0_0_15px_#00FFCC] z-10 animate-pulse pointer-events-none"
                  style={{
                    top: `${scanProgress}%`,
                    transition: 'top 0.1s linear'
                  }}
                />
              )}

              {/* Hidden Canvas used for video extraction */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Active Clinical Hotspot Card Overlay inside screen */}
            {selectedHotspot && (
              <div className="absolute bottom-4 left-4 right-4 bg-slate-950/95 border border-sky-500/40 p-3 rounded-xl backdrop-blur-md z-30 flex gap-2 text-xs transition-all animate-fade-in">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1 text-slate-100">
                    <span className="w-2 h-2 rounded-full bg-[#00FFCC]"></span>
                    <strong className="text-white text-[11px] uppercase tracking-wider">{selectedHotspot.title}</strong>
                  </div>
                  <p className="text-slate-300 leading-tight text-[11px] font-medium">{selectedHotspot.description}</p>
                </div>
                <button 
                  onClick={() => setSelectedHotspot(null)} 
                  className="text-slate-500 hover:text-white shrink-0 self-start p-1 hover:bg-slate-900 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {/* Ophthalmoscope Parameters Quick HUD adjuster */}
            <div className="w-full mt-4 flex items-center justify-between gap-4 bg-slate-950/65 border border-slate-850 p-3 rounded-xl text-xs">
              <div className="flex-1 flex gap-4">
                <div className="flex-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Grid Overlay</span>
                  <div className="flex gap-1.5 font-mono">
                    {['none', 'grid', 'quadrants'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setOverlayType(type as any)}
                        className={`px-2 py-0.5 rounded text-[10px] capitalize transition-all ${
                          overlayType === type 
                            ? 'bg-sky-500/15 border border-sky-500/40 text-sky-400' 
                            : 'bg-slate-900 border border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Iris Contrast</span>
                  <input 
                    type="range" 
                    min="70" 
                    max="140" 
                    value={contrastVal} 
                    onChange={(e) => setContrastVal(Number(e.target.value))}
                    className="w-20 accent-sky-400 h-1 rounded-full cursor-pointer bg-slate-800"
                  />
                </div>
              </div>

              <div className="text-right">
                <span className="text-[9px] text-[#00FFCC] block font-mono">HOTSPOTS CLASSIFIED</span>
                <span className="text-xs font-bold text-slate-300 font-mono">
                  {customImageBase64 ? 'N/A (EXTERNAL)' : `${PRESET_HOTSPOTS[selectedPresetId]?.length || 0} SECTIONS`}
                </span>
              </div>
            </div>
          </div>

          {/* Core Trigger button area */}
          <div className="flex flex-col gap-2 shrink-0">
            {isScanning ? (
              <div className="w-full bg-slate-900 border border-slate-850 rounded-xl p-4.5">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-[#00FFCC] font-mono animate-pulse font-semibold">{scanStatusMsg}</span>
                  <span className="text-slate-400 font-mono">{scanProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-500 to-[#00FFCC] transition-all duration-150 ease-out rounded-full shadow-[0_0_10px_#00FFCC]" 
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={runScanAnalysis}
                  className="col-span-2 py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-sky-950/40 text-sm tracking-wide cursor-pointer flex items-center justify-center gap-2 relative overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform"></span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-sky-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Initiate AI Retinal Diagnostics
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Expert AI Results Feed */}
        <section className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          
          {/* Active Screen Results Card */}
          <div className="bg-[#11141A] border border-slate-850 rounded-2xl p-5 shadow-xl relative">
            <h3 className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-6">Differential Diagnoses</h3>
            
            {activeReport ? (
              <div className="space-y-6">
                
                {/* Ocular Vital Score Radial HUD Ring */}
                <div className="p-3 bg-slate-900/80 border border-slate-850 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none font-bold">Vital Screening Index</p>
                    <p className="text-xs text-slate-300 font-medium mt-1">Ocular Microvascular Health Rank</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-[#00FFCC]">
                      {activeReport.vitalScore}/100
                    </span>
                  </div>
                </div>

                {/* Diabetes Indicators */}
                <div className="p-3.5 bg-[#161B22]/50 rounded-xl border border-slate-850">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Diabetes Risk</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskColorClass(activeReport.findings.diabetes.riskLevel)}`}>
                      {activeReport.findings.diabetes.riskLevel}
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-850 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${getRiskProgressClass(activeReport.findings.diabetes.riskLevel)}`} 
                      style={{ width: getPercentageWidth(activeReport.findings.diabetes.confidence) }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1 text-[10px] text-slate-500 font-mono">
                    <span>Vascular confidence</span>
                    <span>{activeReport.findings.diabetes.confidence}%</span>
                  </div>

                  <p className="text-slate-350 text-[11px] font-medium leading-relaxed mt-2.5">
                    {activeReport.findings.diabetes.clinicalBreakdown}
                  </p>
                </div>

                {/* Hypertension Indicators */}
                <div className="p-3.5 bg-[#161B22]/50 rounded-xl border border-slate-850">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Hypertension</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskColorClass(activeReport.findings.hypertension.riskLevel)}`}>
                      {activeReport.findings.hypertension.riskLevel}
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-850 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${getRiskProgressClass(activeReport.findings.hypertension.riskLevel)}`} 
                      style={{ width: getPercentageWidth(activeReport.findings.hypertension.confidence) }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1 text-[10px] text-slate-500 font-mono">
                    <span>Vessell caliber compression</span>
                    <span>{activeReport.findings.hypertension.confidence}%</span>
                  </div>

                  <p className="text-slate-350 text-[11px] font-medium leading-relaxed mt-2.5">
                    {activeReport.findings.hypertension.clinicalBreakdown}
                  </p>
                </div>

                {/* Alzheimer's Neurotech Indicators */}
                <div className="p-3.5 bg-[#161B22]/50 rounded-xl border border-slate-850">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-sky-450" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Alzheimer's Risk</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskColorClass(activeReport.findings.alzheimers.riskLevel)}`}>
                      {activeReport.findings.alzheimers.riskLevel}
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-850 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${getRiskProgressClass(activeReport.findings.alzheimers.riskLevel)}`} 
                      style={{ width: getPercentageWidth(activeReport.findings.alzheimers.confidence) }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1 text-[10px] text-slate-500 font-mono">
                    <span>RNFL attenuation index</span>
                    <span>{activeReport.findings.alzheimers.confidence}%</span>
                  </div>

                  <p className="text-slate-350 text-[11px] font-medium leading-relaxed mt-2.5">
                    {activeReport.findings.alzheimers.clinicalBreakdown}
                  </p>
                </div>

              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center text-xs">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-slate-600 animate-pulse" />
                </div>
                <h4 className="text-slate-300 font-semibold mb-1">Analysis Awaiting Scan</h4>
                <p className="text-slate-500 max-w-[180px]">
                  Click the button below the retina panel to initiate deep neural networks.
                </p>
              </div>
            )}
          </div>

          {/* Action Recommendations / Printable Hospital Report Card */}
          {activeReport && (
            <div className="space-y-4">
              <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-5">
                <h4 className="text-xs font-bold text-sky-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-sky-400" />
                  Mitigating Care Plan
                </h4>
                <ul className="text-xs text-sky-100 space-y-2 leading-relaxed font-medium">
                  {activeReport.educationalAdvice.map((item, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-[#00FFCC] font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={() => setShowPrintModal(true)} 
                  className="mt-4 w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold tracking-wide transition-all uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-sky-950/20"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Access Clinic Report
                </button>
              </div>
            </div>
          )}
        </section>

      </main>

      {/* Alternative View screens: Records Tab */}
      {activeTab === 'records' && (
        <div className="fixed inset-0 bg-[#0A0C10]/95 z-50 flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-[#11141A] border border-slate-800 max-w-lg w-full rounded-2xl p-6 relative">
            <button 
              onClick={() => setActiveTab('scan')} 
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-base font-bold text-sky-400 tracking-tight uppercase mb-4">Patient Screening Inventory</h3>
            <div className="space-y-4 text-slate-300 text-xs">
              <p className="leading-relaxed text-slate-400">
                A registry of standard simulated patients configured inside RetinaComputeAI to benchmark the model sensitivity algorithms against real clinical settings:
              </p>
              <div className="space-y-2.5">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <strong className="text-white block">Patient A: Healthy Control</strong>
                  <span className="text-emerald-400 font-mono text-[10px]">No risk patterns identified (Vital 98)</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <strong className="text-white block">Patient B: Diabetic Retinopathy Case</strong>
                  <span className="text-rose-400 font-mono text-[10px]">High risk: Multiple hard exudates and hemorrhages</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <strong className="text-white block">Patient C: Hypertensive Caliber Case</strong>
                  <span className="text-rose-400 font-mono text-[10px]">High risk: Visual Copper-wiring & arteriole-venule crossing indentation</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <strong className="text-white block">Patient D: Neurodegenerative Pattern</strong>
                  <span className="text-amber-400 font-mono text-[10px]">High Alzheimer\'s structural risk points: Optic disk pallor & RNFL bands</span>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('scan')} 
                className="w-full py-2.5 bg-slate-800 text-white font-semibold rounded-xl text-center"
              >
                Close Inventory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alternative View screens: About/Methodology Tab */}
      {activeTab === 'about' && (
        <div className="fixed inset-0 bg-[#0A0C10]/95 z-50 flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-[#11141A] border border-slate-800 max-w-lg w-full rounded-2xl p-6 relative max-h-[85vh] overflow-y-auto">
            <button 
              onClick={() => setActiveTab('scan')} 
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-base font-bold text-sky-400 uppercase tracking-tight mb-4">Diagnostic Methodology</h3>
            
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="space-y-2">
                <strong className="text-white block">Diabetes Retinopathy Screening</strong>
                <p className="text-slate-400">
                  Chronic sugar stress damages the delicate capillary walls of the retinal plexus. The system detects vascular ballooning (microaneurysms), waxy lipid leaks (hard exudates) and cellular infarctions (cotton wool spaces) centered in temporal quadrants.
                </p>
              </div>

              <div className="space-y-2 border-t border-slate-800 pt-3">
                <strong className="text-white block">Hypertensive Caliber Assessment</strong>
                <p className="text-slate-400">
                  Persistent high blood pressure hardens arteries. RetinaComputeAI evaluates structural "Copper Wiring" reflexes, measures the Arteriole-to-Venule diameter ratios (A/V ratios), and flags compressions at crossroads (A-V Nicking).
                </p>
              </div>

              <div className="space-y-2 border-t border-slate-800 pt-3">
                <strong className="text-white block">Alzheimer's Retinal Nerve Biometrics</strong>
                <p className="text-slate-400">
                  The retina is embryonic brain tissue. Early cortical cognitive decline correlates directly to localized Retinal Nerve Fiber Layer (RNFL) loss bands, micro-capillary dropout surrounding the foveal zone, and pallor cup expansions of the optic disc nerve.
                </p>
              </div>

              <div className="space-y-2 border-t border-slate-800 pt-3 text-[11px] text-slate-500">
                <strong>Ophthalmoscope Medical Disclaimer</strong>
                <p>
                  This application is a machine learning triage assistive demonstration designed exclusively for educational, verification and clinical sandbox reviews. Contact certified optometrists and clinical specialists for official dilated fundus diagnostic trials.
                </p>
              </div>

              <button 
                onClick={() => setActiveTab('scan')} 
                className="w-full mt-2 py-2.5 bg-slate-800 hover:bg-slate-750 text-white font-semibold rounded-xl text-center cursor-pointer"
              >
                Return to Screenings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clinical PDF Printable Report Modal */}
      {showPrintModal && activeReport && (
        <div id="print-modal" className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl">
          <div className="bg-slate-900 border border-slate-850 max-w-2xl w-full p-6 sm:p-8 rounded-3xl relative text-xs text-slate-350 shadow-[0_20px_50px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-y-auto">
            
            {/* Modal close */}
            <button 
              onClick={() => setShowPrintModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 hover:bg-slate-850 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Hospital Sheet style */}
            <div className="border border-slate-800 bg-slate-950 p-6 rounded-2xl space-y-6 text-slate-300 font-mono relative">
              
              {/* Internal watermark */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] select-none text-center pointer-events-none w-full">
                <span className="text-7xl font-sans font-black uppercase tracking-widest text-sky-400">CLINICAL TRIAGE</span>
              </div>

              {/* Clinic Sheet Header */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <h4 className="text-sm font-bold text-white tracking-wider uppercase">RetinaCompute AI Patient Report</h4>
                  <p className="text-[10px] text-slate-400">Hospital General Ophthalmic Registry</p>
                </div>
                <div className="text-right text-[10px] text-slate-450">
                  <p>REPORT ID: #RC-9920-VAL</p>
                  <p>TIMESTAMP: {activeReport.metadata?.scanTimestamp ? new Date(activeReport.metadata.scanTimestamp).toLocaleString() : new Date().toLocaleString()}</p>
                </div>
              </div>

              {/* Patient details section */}
              <div className="grid grid-cols-2 gap-4 bg-slate-900/50 p-3.5 rounded-lg border border-slate-850 text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Patient ID Profile</span>
                  <strong className="text-white pl-1">{customImageBase64 ? 'External Mobile Capture' : currentPreset.name}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Demographics</span>
                  <span className="text-slate-200 pl-1">Age: 64 / Gender: Female / Sclera Reflex</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Ocular Device Map</span>
                  <span className="text-slate-200 pl-1">{activeReport.metadata?.modelUsed || 'Mobile Lens 12MP Camera Mode'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Status rating</span>
                  <span className="text-sky-400 font-semibold pl-1">{activeReport.overallStatus}</span>
                </div>
              </div>

              {/* Core Findings metrics table */}
              <div>
                <span className="text-slate-500 block text-[10px] uppercase tracking-widest mb-2 font-bold">Vascular Risk Matrix Matrix</span>
                <div className="space-y-3 bg-slate-900/30 p-3 rounded-lg border border-slate-850 text-[11px]">
                  
                  <div className="flex justify-between border-b border-slate-850 pb-2">
                    <span className="text-slate-350">1. Glycemic Stress Indicators (Diabetes)</span>
                    <span className="font-bold text-slate-100">{activeReport.findings.diabetes.riskLevel} Risk</span>
                  </div>
                  
                  <div className="flex justify-between border-b border-slate-850 pb-2">
                    <span className="text-slate-350">2. Arteriolar Rigid Tension (Hypertension)</span>
                    <span className="font-bold text-slate-100">{activeReport.findings.hypertension.riskLevel} Risk</span>
                  </div>

                  <div className="flex justify-between pb-1">
                    <span className="text-slate-350">3. Cortical Nerve Thickness (Alzheimer's)</span>
                    <span className="font-bold text-slate-100">{activeReport.findings.alzheimers.riskLevel} Risk</span>
                  </div>

                </div>
              </div>

              {/* Textual Observations */}
              <div className="space-y-2 text-[11px]">
                <span className="text-slate-500 block text-[10px] uppercase tracking-widest font-bold">Ocular Segment Observations</span>
                <p className="border-l-2 border-sky-500 pl-2 leading-relaxed text-slate-300">
                  <strong className="text-slate-400 text-[10px] block font-sans">1. Optic Disc Head</strong>
                  {activeReport.anatomicalObservations.opticDisc}
                </p>
                <p className="border-l-2 border-[#00FFCC] pl-2 leading-relaxed text-slate-300">
                  <strong className="text-slate-400 text-[10px] block font-sans">2. Macula Pigments</strong>
                  {activeReport.anatomicalObservations.macula}
                </p>
                <p className="border-l-2 border-slate-700 pl-2 leading-relaxed text-slate-300">
                  <strong className="text-slate-400 text-[10px] block font-sans">3. Vascular Branches</strong>
                  {activeReport.anatomicalObservations.vascularArcades}
                </p>
              </div>

              {/* Clinician Signature stamps */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-800 text-[11px]">
                <div>
                  <p className="text-slate-500">STABILITY BENCHMARK</p>
                  <p className="text-emerald-400 font-bold">✓ PASS (TRIAGE COMPATIBLE)</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 uppercase tracking-widest">Signed Specialist Signature</p>
                  <p className="font-bold text-slate-200 mt-1 pl-4 underline font-sans italic tracking-wide">Dr. Aris Thorne</p>
                  <p className="text-[9px] text-slate-450 font-sans">RetinaComputeAI Primary Specialist</p>
                </div>
              </div>

            </div>

            {/* Print and control triggers */}
            <div className="mt-6 flex justify-end gap-3 text-xs">
              <button 
                onClick={() => window.print()} 
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-550 text-white font-bold rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
              >
                Print Report Sheet
              </button>
              <button 
                onClick={() => setShowPrintModal(false)} 
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl transition-all font-semibold"
              >
                Close Report
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* Embedded footer for active live feed details */}
      <footer className="mt-auto px-6 py-3 bg-[#11141A] border-t border-slate-800 flex justify-between items-center shrink-0 z-10 text-[10px] text-slate-500 font-mono select-none">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span className="uppercase tracking-wider">AI Server Bound</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></div>
            <span className="uppercase tracking-wider">Secure Encryption</span>
          </div>
        </div>
        <div className="hidden sm:inline-block text-[9px] text-slate-600">
          v2.4.0-STABLE | LATENCY: 12ms | CLOUD CONNECTED
        </div>
      </footer>

    </div>
  );
}

