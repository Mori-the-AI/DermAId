import React from 'react';
import { AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

const PredictionCard = ({ prediction }) => {
  const topPrediction = prediction.all_predictions[0];
  
  // Find malignant conditions in top predictions
  const malignantClasses = ['mel', 'bcc', 'akiec'];
  const malignantPredictions = prediction.all_predictions.filter(
    p => malignantClasses.includes(p.class_code)
  );
  const highestMalignantProb = malignantPredictions.length > 0 
    ? malignantPredictions[0].probability 
    : 0;
  
  // Risk assessment
  const isAnyMalignantHigh = highestMalignantProb > 0.10; // >10% is concerning
  const isTopMalignant = malignantClasses.includes(topPrediction.class_code);
  const isHighUncertaintyCase = highestMalignantProb > 0.05 && highestMalignantProb < 0.50;
  
  // Determine risk level
  let riskLevel, riskColor, RiskIcon, riskMessage;
  if (isTopMalignant && topPrediction.probability > 0.50) {
    riskLevel = 'HIGH RISK';
    riskColor = 'bg-red-900/30 text-red-300 border-red-700/50';
    RiskIcon = AlertTriangle;
    riskMessage = 'Malignant condition detected with high confidence. Biopsy strongly recommended.';
  } else if (isAnyMalignantHigh) {
    riskLevel = 'ELEVATED RISK';
    riskColor = 'bg-amber-900/30 text-amber-300 border-amber-700/50';
    RiskIcon = AlertTriangle;
    riskMessage = `Significant probability of malignancy (${(highestMalignantProb * 100).toFixed(1)}%). Further investigation advised.`;
  } else if (isHighUncertaintyCase) {
    riskLevel = 'UNCERTAIN';
    riskColor = 'bg-amber-900/20 text-amber-300 border-amber-700/40';
    RiskIcon = HelpCircle;
    riskMessage = 'Prediction is uncertain. Malignancy cannot be ruled out. Clinical correlation required.';
  } else {
    riskLevel = 'LOW RISK';
    riskColor = 'bg-emerald-900/30 text-emerald-300 border-emerald-700/50';
    RiskIcon = CheckCircle;
    riskMessage = 'No significant evidence of malignancy detected. Continue routine monitoring.';
  }

  return (
    <div className="p-6 space-y-6">
      {/* Risk Banner - MOST PROMINENT */}
      <div className={`flex items-center gap-3 p-4 rounded-xl border ${riskColor}`}>
        <RiskIcon className="w-6 h-6 flex-shrink-0" />
        <div>
          <p className="font-bold text-lg">{riskLevel}</p>
          <p className="text-sm opacity-90">{riskMessage}</p>
        </div>
      </div>

      {/* Primary Prediction */}
      <div className="text-center space-y-3">
        <p className="text-sm text-slate-400 uppercase tracking-wider">Primary AI Prediction</p>
        <h2 className="text-2xl font-bold text-white">
          {topPrediction.class_name}
        </h2>
        
        {/* Confidence Circle */}
        <div className="relative w-28 h-28 mx-auto">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-700"
            />
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${topPrediction.probability * 264} 264`}
              className={
                topPrediction.probability > 0.9 ? 'text-emerald-400' : 
                topPrediction.probability > 0.7 ? 'text-amber-400' : 'text-red-400'
              }
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {(topPrediction.probability * 100).toFixed(0)}%
            </span>
            <span className="text-xs text-slate-400">confidence</span>
          </div>
        </div>
      </div>

      {/* Differential Diagnosis */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
          Differential Diagnosis
        </h3>
        <div className="space-y-1">
          {prediction.all_predictions.map((pred, idx) => {
            const isMalignant = malignantClasses.includes(pred.class_code);
            return (
              <div
                key={pred.class_id}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  idx === 0 ? 'bg-slate-700/20' : 'hover:bg-slate-700/20'
                }`}
              >
                <span className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${idx === 0 ? 'bg-gradient-to-br from-teal-400 to-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}
                `}>
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-medium flex items-center gap-1.5 ${
                      idx === 0 ? 'text-white' : 'text-slate-300'
                    }`}>
                      {pred.class_name}
                      {isMalignant && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-900/40 text-red-300 border border-red-700/40">
                          MALIGNANT
                        </span>
                      )}
                    </span>
                    <span className={`text-sm font-mono ${
                      isMalignant && pred.probability > 0.05 ? 'text-red-400 font-bold' : 
                      idx === 0 ? 'text-teal-400' : 'text-slate-500'
                    }`}>
                      {(pred.probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isMalignant && pred.probability > 0.05
                          ? 'bg-gradient-to-r from-red-500 to-red-400'
                          : idx === 0 
                            ? 'bg-gradient-to-r from-teal-400 to-emerald-500' 
                            : 'bg-slate-600'
                      }`}
                      style={{ width: `${pred.probability * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clinical Note */}
      <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
        <p className="text-xs text-slate-400 leading-relaxed">
          <span className="font-semibold text-slate-300">⚠️ Clinical Note:</span> This AI 
          prediction is a research tool only. All diagnoses must be confirmed by a qualified 
          dermatologist. The model was trained on the HAM10000 dataset and may not generalize 
          to all skin types or imaging conditions. Malignant conditions marked in red require 
          particular clinical attention regardless of their probability ranking.
        </p>
      </div>
    </div>
  );
};

export default PredictionCard;