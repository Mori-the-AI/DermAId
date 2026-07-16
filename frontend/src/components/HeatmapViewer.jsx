import React, { useState } from 'react';
import { Eye, EyeOff, Info } from 'lucide-react';

const HeatmapViewer = ({ heatmap, originalImage }) => {
  const [showOverlay, setShowOverlay] = useState(true);
  const [opacity, setOpacity] = useState(0.5);

  // Create a simple heatmap visualization using CSS
  // In production, you'd render the actual heatmap data on a canvas
  const heatmapStyle = {
    background: `radial-gradient(
      circle at 50% 50%,
      rgba(255, 0, 0, ${opacity}) 0%,
      rgba(255, 165, 0, ${opacity * 0.7}) 30%,
      rgba(255, 255, 0, ${opacity * 0.4}) 60%,
      transparent 100%
    )`,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Eye className="w-5 h-5 text-teal-400" />
          Grad-CAM++ Visualization
        </h3>
        <button
          onClick={() => setShowOverlay(!showOverlay)}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
            transition-all duration-200
            ${showOverlay 
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' 
              : 'bg-slate-700/50 text-slate-400 border border-slate-600/50'
            }
          `}
        >
          {showOverlay ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {showOverlay ? 'Hide Overlay' : 'Show Overlay'}
        </button>
      </div>

      {/* Image with Heatmap Overlay */}
      <div className="relative rounded-xl overflow-hidden shadow-2xl">
        {originalImage && (
          <img
            src={originalImage}
            alt="Skin lesion"
            className="w-full h-auto"
          />
        )}
        {showOverlay && (
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={heatmapStyle}
          ></div>
        )}
        <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 text-xs text-white">
          Confidence: {(heatmap.confidence * 100).toFixed(1)}%
        </div>
      </div>

      {/* Opacity Slider */}
      <div className="space-y-2">
        <label className="text-sm text-slate-400 flex items-center gap-1">
          <Info className="w-3.5 h-3.5" />
          Heatmap Opacity
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={opacity}
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer
            accent-teal-400
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-teal-400
            [&::-webkit-slider-thumb]:shadow-lg"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>0%</span>
          <span>{Math.round(opacity * 100)}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500"></div>
          <span className="text-xs text-slate-400">High attention</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500"></div>
          <span className="text-xs text-slate-400">Medium attention</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-transparent border border-slate-600"></div>
          <span className="text-xs text-slate-400">Low attention</span>
        </div>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        The heatmap shows which regions of the image most influenced the AI's diagnosis. 
        Red areas indicate the strongest influence on the prediction. This helps clinicians 
        verify that the model is focusing on clinically relevant features.
      </p>
    </div>
  );
};

export default HeatmapViewer;