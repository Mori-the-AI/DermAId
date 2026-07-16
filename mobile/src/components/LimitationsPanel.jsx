import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { AlertTriangle, Users, Database, Shield, FlaskConical } from 'lucide-react-native';

export default function LimitationsPanel() {
  const limitations = [
    {
      icon: Users,
      title: 'Demographic Bias',
      description: 'Trained primarily on light skin tones. Performance on darker skin (Fitzpatrick V-VI) is not validated. May miss diagnoses on patients of color.',
      severity: 'high',
    },
    {
      icon: Database,
      title: 'Limited Training Data',
      description: 'Trained on 10,015 images. Rare conditions have as few as 115 examples, reducing reliability for uncommon lesion types.',
      severity: 'high',
    },
    {
      icon: FlaskConical,
      title: 'Research-Grade Only',
      description: 'No clinical trials. No FDA clearance. No CE marking. Student research prototype with 82.5% test accuracy — insufficient for clinical deployment.',
      severity: 'critical',
    },
    {
      icon: Shield,
      title: 'No Paediatric Validation',
      description: 'Dataset contains primarily adults. Performance on patients under 18 is unknown.',
      severity: 'medium',
    },
  ];

  const severityColors = {
    critical: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: '#fca5a5' },
    high: { bg: 'rgba(217,119,6,0.1)', border: 'rgba(217,119,6,0.3)', text: '#fcd34d' },
    medium: { bg: 'rgba(30,41,59,0.5)', border: 'rgba(51,65,85,0.5)', text: '#cbd5e1' },
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <View style={{
        flexDirection: 'row', alignItems: 'flex-start', gap: 12,
        padding: 16, borderRadius: 14,
        backgroundColor: 'rgba(239,68,68,0.1)',
        borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
        marginBottom: 20,
      }}>
        <AlertTriangle size={28} color="#fca5a5" />
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fca5a5', fontSize: 18, fontWeight: '800' }}>Not for Clinical Use</Text>
          <Text style={{ color: '#fca5a5', fontSize: 13, marginTop: 4, opacity: 0.8 }}>
            Student research prototype. Must not be used for medical diagnosis or treatment planning.
          </Text>
        </View>
      </View>

      <Text style={{ color: '#f1f5f9', fontSize: 17, fontWeight: '700', marginBottom: 16 }}>
        Known Limitations
      </Text>

      {limitations.map((lim, idx) => {
        const Icon = lim.icon;
        const colors = severityColors[lim.severity];
        return (
          <View key={idx} style={{
            flexDirection: 'row', alignItems: 'flex-start', gap: 12,
            padding: 14, borderRadius: 14, marginBottom: 10,
            backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
          }}>
            <Icon size={20} color={colors.text} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>{lim.title}</Text>
                <View style={{
                  paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
                  backgroundColor: 'rgba(0,0,0,0.3)',
                }}>
                  <Text style={{ color: colors.text, fontSize: 9, fontWeight: '800', letterSpacing: 1 }}>
                    {lim.severity.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 4, lineHeight: 18 }}>
                {lim.description}
              </Text>
            </View>
          </View>
        );
      })}

      <View style={{
        padding: 14, borderRadius: 14, marginTop: 8,
        backgroundColor: 'rgba(30,41,59,0.5)',
        borderWidth: 1, borderColor: 'rgba(51,65,85,0.5)',
      }}>
        <Text style={{ color: '#94a3b8', fontSize: 11, lineHeight: 18 }}>
          <Text style={{ fontWeight: '700', color: '#cbd5e1' }}>Model Performance: </Text>
          82.5% accuracy on HAM10000 test set. Melanoma recall ~75%, meaning 1 in 4 melanomas 
          may be missed — unacceptably high for clinical use where missing a melanoma can be fatal.
        </Text>
      </View>
    </ScrollView>
  );
}