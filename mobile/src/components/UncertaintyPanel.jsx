import React from 'react';
import { View, Text } from 'react-native';
import { AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react-native';

export default function UncertaintyPanel({ uncertainty }) {
  const statusConfig = {
    high: { icon: AlertTriangle, color: '#fca5a5', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', label: 'High Uncertainty' },
    moderate: { icon: HelpCircle, color: '#fcd34d', bg: 'rgba(217,119,6,0.1)', border: 'rgba(217,119,6,0.3)', label: 'Moderate Uncertainty' },
    low: { icon: CheckCircle, color: '#6ee7b7', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', label: 'Low Uncertainty' },
  };

  const status = statusConfig[uncertainty.uncertainty_level];
  const StatusIcon = status.icon;

  return (
    <View style={{ padding: 20, gap: 16 }}>
      {/* Status */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 12,
        padding: 16, borderRadius: 14,
        backgroundColor: status.bg, borderWidth: 1, borderColor: status.border,
      }}>
        <StatusIcon size={24} color={status.color} />
        <View>
          <Text style={{ color: status.color, fontSize: 16, fontWeight: '700' }}>{status.label}</Text>
          <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>
            Based on {uncertainty.n_samples} Monte Carlo samples
          </Text>
        </View>
      </View>

      {/* Metrics */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{
          flex: 1, padding: 16, borderRadius: 14,
          backgroundColor: 'rgba(30,41,59,0.5)',
          borderWidth: 1, borderColor: 'rgba(51,65,85,0.5)',
        }}>
          <Text style={{ color: '#94a3b8', fontSize: 11, letterSpacing: 0.5 }}>MEAN CONFIDENCE</Text>
          <Text style={{ color: '#f1f5f9', fontSize: 28, fontWeight: '800', marginTop: 4 }}>
            {(uncertainty.mean_confidence * 100).toFixed(1)}%
          </Text>
          <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
            ± {(uncertainty.std_confidence * 100).toFixed(1)}%
          </Text>
        </View>
        <View style={{
          flex: 1, padding: 16, borderRadius: 14,
          backgroundColor: 'rgba(30,41,59,0.5)',
          borderWidth: 1, borderColor: 'rgba(51,65,85,0.5)',
        }}>
          <Text style={{ color: '#94a3b8', fontSize: 11, letterSpacing: 0.5 }}>AGREEMENT</Text>
          <Text style={{ color: '#f1f5f9', fontSize: 28, fontWeight: '800', marginTop: 4 }}>
            {(uncertainty.agreement_rate * 100).toFixed(0)}%
          </Text>
          <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
            across {uncertainty.n_samples} runs
          </Text>
        </View>
      </View>

      {/* Entropy Metrics */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{
          flex: 1, padding: 12, borderRadius: 12,
          backgroundColor: 'rgba(30,41,59,0.3)',
        }}>
          <Text style={{ color: '#64748b', fontSize: 11 }}>Predictive Entropy</Text>
          <Text style={{ color: '#cbd5e1', fontSize: 18, fontWeight: '700', marginTop: 4 }}>
            {uncertainty.predictive_entropy.toFixed(4)}
          </Text>
        </View>
        <View style={{
          flex: 1, padding: 12, borderRadius: 12,
          backgroundColor: 'rgba(30,41,59,0.3)',
        }}>
          <Text style={{ color: '#64748b', fontSize: 11 }}>Mutual Information</Text>
          <Text style={{ color: '#cbd5e1', fontSize: 18, fontWeight: '700', marginTop: 4 }}>
            {uncertainty.mutual_information.toFixed(4)}
          </Text>
        </View>
      </View>

      <Text style={{ color: '#64748b', fontSize: 11, lineHeight: 18 }}>
        Uncertainty estimated via Monte Carlo Dropout — {uncertainty.n_samples} predictions 
        with different dropout patterns. High agreement indicates low uncertainty.
      </Text>
    </View>
  );
}