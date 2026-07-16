import React from 'react';
import { AlertTriangle, Users, Database, Shield, FlaskConical } from 'lucide-react';

const LimitationsPanel = () => {
  const limitations = [
    {
      icon: Users,
      title: 'Demographic Bias',
      description: 'The HAM10000 dataset is predominantly composed of light skin tones from European and Australian populations. Performance on darker skin types (Fitzpatrick V-VI) has not been validated. Using this tool on diverse populations may lead to missed diagnoses.',
      severity: 'high',
    },
    {
      icon: Database,
      title: 'Limited Training Data',
      description: 'The model was trained on 10,015 images with only 115 cases of Dermatofibroma and 142 of Vascular Lesions. Rare conditions have limited training examples, resulting in less reliable predictions for these classes.',
      severity: 'high',
    },
    {
      icon: FlaskConical,
      title: 'Research-Grade Only',
      description: 'This software has not undergone clinical trials, FDA clearance, or CE marking. It is a student research prototype developed for academic purposes only. Diagnostic accuracy of 82.5% on the test set is insufficient for clinical deployment.',
      severity: 'critical',
    },
    {
      icon: Shield,
      title: 'No Paediatric Validation',
      description: 'The dataset contains primarily adult patients. Performance on paediatric cases (under 18) is unknown and likely unreliable.',
      severity: 'medium',
    },
    {
      icon: AlertTriangle,
      title: 'Image Quality Sensitivity',
      description: 'The model expects dermoscopic images of a specific quality. Smartphone photos, poorly lit images, or images with significant artifacts (hair, rulers, ink markings) may produce unreliable results.',
      severity: 'medium',
    },
  ];

  const severityStyles = {
    critical: 'bg-red-900/30 border-red-700/50 text-red-300',
    high: 'bg-amber-900/30 border-amber-700/50 text-amber-300',
    medium: 'bg-slate-800/50 border-slate-700/50 text-slate-300',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-700/40 rounded-xl">
        <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0" />
        <div>
          <p className="text-red-300 font-bold text-lg">Not for Clinical Use</p>
          <p className="text-red-200/80 text-sm">
            This is a student research prototype. It must not be used for medical diagnosis, 
            treatment planning, or any clinical decision-making.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Known Limitations</h3>
        {limitations.map((lim, idx) => {
          const Icon = lim.icon;
          return (
            <div
              key={idx}
              className={`flex items-start gap-4 p-4 rounded-xl border ${severityStyles[lim.severity]}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{lim.title}</p>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-black/30">
                    {lim.severity}
                  </span>
                </div>
                <p className="text-sm mt-1 opacity-80">{lim.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
        <p className="text-xs text-slate-400 leading-relaxed">
          <span className="font-semibold text-slate-300">Model Performance:</span> On the 
          HAM10000 test set (1,503 images), the model achieved 82.5% accuracy. Per-class F1 
          scores vary significantly. Melanoma recall was approximately 75%, meaning roughly 
          1 in 4 melanomas may be misclassified. This false-negative rate is unacceptably high 
          for clinical use, where missing a melanoma can be fatal.
        </p>
      </div>
    </div>
  );
};

export default LimitationsPanel;