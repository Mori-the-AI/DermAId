import React from 'react';
import {AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const UncertaintyPanel = ({ uncertainty }) => {


  const chartData = uncertainty.class_uncertainty.map(c => ({
    name: `Class ${c.class_id}`,
    mean: c.mean_probability,
    std: c.std_probability,
  }));

  const statusConfig = {
    high: {
      icon: AlertTriangle,
      color: 'text-red-400',
      bg: 'bg-red-900/30',
      border: 'border-red-700/50',
      label: 'High Uncertainty - Consider Second Opinion',
    },
    moderate: {
      icon: HelpCircle,
      color: 'text-amber-400',
      bg: 'bg-amber-900/30',
      border: 'border-amber-700/50',
      label: 'Moderate Uncertainty - Review Carefully',
    },
    low: {
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-900/30',
      border: 'border-emerald-700/50',
      label: 'Low Uncertainty - High Confidence',
    },
  };

  const status = statusConfig[uncertainty.uncertainty_level];
  const StatusIcon = status.icon;

  return (
    <div className="p-6 space-y-6">
      {/* Status Banner */}
      <div className={`
        flex items-center gap-3 p-4 rounded-xl border ${status.bg} ${status.border}
      `}>
        <StatusIcon className={`w-6 h-6 ${status.color}`} />
        <div>
          <p className={`font-medium ${status.color}`}>{status.label}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Based on {uncertainty.n_samples} Monte Carlo samples
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Mean Confidence</p>
          <p className="text-2xl font-bold text-white">
            {(uncertainty.mean_confidence * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            ± {(uncertainty.std_confidence * 100).toFixed(1)}%
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Agreement Rate</p>
          <p className="text-2xl font-bold text-white">
            {(uncertainty.agreement_rate * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            across {uncertainty.n_samples} predictions
          </p>
        </div>
      </div>

      {/* Uncertainty Chart */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
          Prediction Distribution
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                }}
              />
              <Bar dataKey="mean" fill="#14b8a6" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.mean > 0.5 ? '#14b8a6' : '#64748b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Metrics Detail */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-slate-800/30 rounded-lg">
          <p className="text-xs text-slate-400">Predictive Entropy</p>
          <p className="text-lg font-mono font-bold text-slate-200">
            {uncertainty.predictive_entropy.toFixed(4)}
          </p>
        </div>
        <div className="p-3 bg-slate-800/30 rounded-lg">
          <p className="text-xs text-slate-400">Mutual Information</p>
          <p className="text-lg font-mono font-bold text-slate-200">
            {uncertainty.mutual_information.toFixed(4)}
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Uncertainty is estimated using Monte Carlo Dropout — the model makes {uncertainty.n_samples} 
        predictions with different dropout patterns. High agreement across predictions indicates 
        low uncertainty. Predictive entropy measures overall uncertainty, while mutual information 
        captures model-specific uncertainty.
      </p>
    </div>
  );
};

export default UncertaintyPanel;