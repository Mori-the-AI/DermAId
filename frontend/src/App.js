import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Microscope, Shield, Brain, AlertTriangle, BookOpen } from 'lucide-react';
import { fullAnalysis } from './services/api';
import PredictionCard from './components/PredictionCard';
import HeatmapViewer from './components/HeatmapViewer';
import UncertaintyPanel from './components/UncertaintyPanel';
import LimitationsPanel from './components/LimitationsPanel';

function App() {
  const [selectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('prediction');

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    
    setPreviewUrl(URL.createObjectURL(file));
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const data = await fullAnalysis(file);
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.bmp'] },
    maxFiles: 1,
  });

  const tabs = [
    { id: 'prediction', label: 'Diagnosis', icon: Brain },
    { id: 'heatmap', label: 'Explainability', icon: Microscope },
    { id: 'uncertainty', label: 'Uncertainty', icon: Shield },
    {id: 'limitations', label: 'Limitations', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">DermAId</h1>
              <p className="text-xs text-slate-400">Explainable AI for Dermatology</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-sm text-slate-300">System Online</span>
          </div>
        </div>
      </header>

      {/* Research Disclaimer */}
      <div className="bg-amber-900/40 border-b border-amber-700/50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
         <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-amber-300 text-sm font-medium">
              Research Prototype — Not for Clinical Use
            </p>
            <p className="text-amber-400/70 text-xs">
              This is a student research project. It has not been validated for diagnostic accuracy 
             across diverse populations and must not be used for medical decision-making.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div
              {...getRootProps()}
              className={`
                relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
                transition-all duration-300 overflow-hidden
                ${isDragActive 
                  ? 'border-teal-400 bg-teal-400/10 scale-[1.02]' 
                  : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
                }
              `}
            >
              <input {...getInputProps()} />
              
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Skin lesion"
                    className="max-h-80 mx-auto rounded-xl shadow-2xl"
                  />
                  <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-700/50 flex items-center justify-center">
                    <Upload className="w-10 h-10 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-slate-200">
                      {isDragActive ? 'Drop your image here' : 'Upload Skin Lesion Image'}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      Drag & drop or click to browse
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      Supports JPG, PNG, BMP • Dermoscopic images preferred
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-8 text-center">
                <div className="w-12 h-12 mx-auto rounded-full border-2 border-teal-400 border-t-transparent animate-spin"></div>
                <p className="mt-4 text-slate-300 font-medium">Analyzing image...</p>
                <p className="text-sm text-slate-400 mt-1">Running AI diagnosis, explainability, and uncertainty checks</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="rounded-2xl bg-red-900/30 border border-red-700/50 p-6">
                <p className="text-red-300 font-medium">⚠️ {error}</p>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {results ? (
              <>
                {/* Tab Navigation */}
                <div className="flex gap-1 bg-slate-800/50 rounded-xl p-1 border border-slate-700/50">
                  {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`
                        flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium
                        transition-all duration-200
                        ${activeTab === id
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-sm overflow-hidden">
                  {activeTab === 'prediction' && (
                    <PredictionCard prediction={results.prediction} />
                  )}
                  {activeTab === 'heatmap' && (
                    <HeatmapViewer 
                      heatmap={results.explainability} 
                      originalImage={previewUrl}
                    />
                  )}
                  {activeTab === 'uncertainty' && (
                    <UncertaintyPanel uncertainty={results.uncertainty} />
                  )}
                  {activeTab === 'limitations' && (
                    <LimitationsPanel />
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 p-12 text-center">
                <Microscope className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">Upload an image to see results</p>
                <p className="text-slate-500 text-sm mt-2">
                  AI-powered diagnosis with visual explanations
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;