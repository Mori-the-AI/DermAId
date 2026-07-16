import React from 'react';
import { View, Text } from 'react-native';
import { AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react-native';

export default function PredictionCard({ prediction }) {
  const topPrediction = prediction.all_predictions[0];
  const malignantClasses = ['mel', 'bcc', 'akiec'];
  const malignantPredictions = prediction.all_predictions.filter(p => malignantClasses.includes(p.class_code));
  const highestMalignantProb = malignantPredictions.length > 0 ? malignantPredictions[0].probability : 0;
  const isAnyMalignantHigh = highestMalignantProb > 0.10;
  const isTopMalignant = malignantClasses.includes(topPrediction.class_code);

  let riskLevel, riskBg, riskBorder, riskText, RiskIcon, riskMessage;
  if (isTopMalignant && topPrediction.probability > 0.50) {
    riskLevel = 'HIGH RISK';
    riskBg = 'rgba(239,68,68,0.15)';
    riskBorder = 'rgba(239,68,68,0.4)';
    riskText = '#fca5a5';
    RiskIcon = AlertTriangle;
    riskMessage = 'Malignant condition detected with high confidence. Biopsy strongly recommended.';
  } else if (isAnyMalignantHigh) {
    riskLevel = 'ELEVATED RISK';
    riskBg = 'rgba(217,119,6,0.15)';
    riskBorder = 'rgba(217,119,6,0.4)';
    riskText = '#fcd34d';
    RiskIcon = AlertTriangle;
    riskMessage = `Significant probability of malignancy (${(highestMalignantProb * 100).toFixed(1)}%). Further investigation advised.`;
  } else {
    riskLevel = 'LOW RISK';
    riskBg = 'rgba(16,185,129,0.15)';
    riskBorder = 'rgba(16,185,129,0.4)';
    riskText = '#6ee7b7';
    RiskIcon = CheckCircle;
    riskMessage = 'No significant evidence of malignancy detected. Continue routine monitoring.';
  }

  const confidenceColor =
    topPrediction.probability > 0.9 ? '#10b981' :
    topPrediction.probability > 0.7 ? '#f59e0b' : '#ef4444';

  const barWidth = Math.max(0, Math.min(120, 120 * topPrediction.probability));

  return (
    <View style={{ padding: 20, gap: 20 }}>
      {/* Risk Banner */}
      <View style={{
        flexDirection: 'row', alignItems: 'flex-start', gap: 12,
        padding: 16, borderRadius: 14,
        backgroundColor: riskBg, borderWidth: 1, borderColor: riskBorder,
      }}>
        <RiskIcon size={24} color={riskText} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: riskText, fontSize: 18, fontWeight: '800' }}>{riskLevel}</Text>
          <Text style={{ color: riskText, fontSize: 13, marginTop: 4, opacity: 0.85 }}>{riskMessage}</Text>
        </View>
      </View>

      {/* Primary Prediction */}
      <View style={{ alignItems: 'center', gap: 12 }}>
        <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '600', letterSpacing: 1 }}>
          PRIMARY AI PREDICTION
        </Text>
        <Text style={{ color: '#f1f5f9', fontSize: 26, fontWeight: '700' }}>
          {topPrediction.class_name}
        </Text>

        {/* Confidence Circle */}
        <View style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: '#1e293b',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 8,
          borderColor: confidenceColor,
        }}>
          <Text style={{ color: '#f1f5f9', fontSize: 30, fontWeight: '800' }}>
            {(topPrediction.probability * 100).toFixed(0)}%
          </Text>
          <Text style={{ color: '#64748b', fontSize: 10, marginTop: 2 }}>confidence</Text>
        </View>

        {/* Confidence bar */}
        <View style={{
          width: 120,
          height: 6,
          backgroundColor: '#334155',
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
        }}>
          <View style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: barWidth,
            borderRadius: 3,
            backgroundColor: confidenceColor,
          }} />
        </View>
      </View>

      {/* Differential Diagnosis */}
      <View style={{ gap: 8 }}>
        <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '600', letterSpacing: 1 }}>
          DIFFERENTIAL DIAGNOSIS
        </Text>
        {prediction.all_predictions.map((pred, idx) => {
          const isMalignant = malignantClasses.includes(pred.class_code);
          const barPercent = Math.max(0, Math.min(100, pred.probability * 100));
          const barColor =
            isMalignant && pred.probability > 0.05
              ? '#ef4444'
              : idx === 0 ? '#14b8a6' : '#475569';

          return (
            <View
              key={pred.class_id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                padding: 10,
                borderRadius: 10,
                backgroundColor: idx === 0 ? 'rgba(51,65,85,0.3)' : 'transparent',
              }}
            >
              <View style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                backgroundColor: idx === 0 ? '#14b8a6' : '#334155',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{idx + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{
                      color: idx === 0 ? '#f1f5f9' : '#cbd5e1',
                      fontSize: 14,
                      fontWeight: '500',
                    }}>
                      {pred.class_name}
                    </Text>
                    {isMalignant && (
                      <View style={{
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 6,
                        backgroundColor: 'rgba(239,68,68,0.2)',
                        borderWidth: 1,
                        borderColor: 'rgba(239,68,68,0.3)',
                      }}>
                        <Text style={{ color: '#fca5a5', fontSize: 9, fontWeight: '800' }}>
                          MALIGNANT
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={{
                    color: isMalignant && pred.probability > 0.05
                      ? '#fca5a5'
                      : idx === 0 ? '#14b8a6' : '#64748b',
                    fontSize: 14,
                    fontWeight: '700',
                  }}>
                    {(pred.probability * 100).toFixed(1)}%
                  </Text>
                </View>
                <View style={{
                  height: 5,
                  backgroundColor: '#1e293b',
                  borderRadius: 3,
                  marginTop: 6,
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <View style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${barPercent}%`,
                    backgroundColor: barColor,
                    borderRadius: 3,
                  }} />
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Clinical Note */}
      <View style={{
        padding: 14,
        borderRadius: 14,
        backgroundColor: 'rgba(30,41,59,0.5)',
        borderWidth: 1,
        borderColor: 'rgba(51,65,85,0.5)',
      }}>
        <Text style={{ color: '#94a3b8', fontSize: 11, lineHeight: 18 }}>
          <Text style={{ fontWeight: '700', color: '#cbd5e1' }}>⚠️ Clinical Note: </Text>
          This AI prediction is a research tool only. All diagnoses must be confirmed by a qualified dermatologist.
        </Text>
      </View>
    </View>
  );
}