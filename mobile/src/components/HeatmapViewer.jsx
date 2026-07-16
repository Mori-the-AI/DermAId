import React, { useState } from 'react';
import { View, Text, Image } from 'react-native';
import { Eye, Info } from 'lucide-react-native';
import Slider from '@react-native-community/slider';

export default function HeatmapViewer({ heatmap, originalImage }) {
  const [opacity, setOpacity] = useState(0.5);

  return (
    <View style={{ padding: 20, gap: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Eye size={20} color="#14b8a6" />
        <Text style={{ color: '#f1f5f9', fontSize: 17, fontWeight: '600' }}>Grad-CAM++ Visualization</Text>
      </View>

      {/* Image with Overlay */}
      <View style={{ borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
        {originalImage && (
          <Image
            source={{ uri: originalImage }}
            style={{ width: '100%', height: 300 }}
            resizeMode="cover"
          />
        )}
        {/* Heatmap overlay */}
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: `rgba(239, 68, 68, ${opacity * 0.5})`,
          borderWidth: 2,
          borderColor: `rgba(239, 68, 68, ${opacity * 0.3})`,
        }} />
        {/* Gradient overlay — red center fading out */}
        <View style={{
          position: 'absolute',
          top: '20%', left: '20%', right: '20%', bottom: '20%',
          borderRadius: 100,
          backgroundColor: `rgba(255, 0, 0, ${opacity * 0.4})`,
        }} />
        <View style={{
          position: 'absolute',
          top: '30%', left: '30%', right: '30%', bottom: '30%',
          borderRadius: 80,
          backgroundColor: `rgba(255, 100, 0, ${opacity * 0.3})`,
        }} />
        
        {/* Confidence badge */}
        <View style={{
          position: 'absolute', top: 12, right: 12,
          paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
          backgroundColor: 'rgba(0,0,0,0.7)',
        }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>
            {(heatmap.confidence * 100).toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Opacity Slider */}
      <View style={{
        padding: 16, borderRadius: 14,
        backgroundColor: 'rgba(30,41,59,0.5)',
        borderWidth: 1, borderColor: 'rgba(51,65,85,0.5)',
        gap: 10,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Info size={14} color="#94a3b8" />
            <Text style={{ color: '#94a3b8', fontSize: 13 }}>Heatmap Opacity</Text>
          </View>
          <Text style={{ color: '#14b8a6', fontSize: 13, fontWeight: '700' }}>
            {Math.round(opacity * 100)}%
          </Text>
        </View>
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={0}
          maximumValue={1}
          step={0.05}
          value={opacity}
          onValueChange={setOpacity}
          minimumTrackTintColor="#14b8a6"
          maximumTrackTintColor="#334155"
          thumbTintColor="#14b8a6"
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: '#475569', fontSize: 11 }}>0%</Text>
          <Text style={{ color: '#475569', fontSize: 11 }}>50%</Text>
          <Text style={{ color: '#475569', fontSize: 11 }}>100%</Text>
        </View>
      </View>

      {/* Legend */}
      <View style={{
        flexDirection: 'row', justifyContent: 'space-around',
        padding: 14, borderRadius: 14,
        backgroundColor: 'rgba(30,41,59,0.5)',
        borderWidth: 1, borderColor: 'rgba(51,65,85,0.5)',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: '#ef4444' }} />
          <Text style={{ color: '#94a3b8', fontSize: 11 }}>High attention</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: '#eab308' }} />
          <Text style={{ color: '#94a3b8', fontSize: 11 }}>Medium</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 14, height: 14, borderRadius: 4, borderWidth: 1, borderColor: '#475569' }} />
          <Text style={{ color: '#94a3b8', fontSize: 11 }}>Low</Text>
        </View>
      </View>

      <Text style={{ color: '#64748b', fontSize: 11, lineHeight: 18 }}>
        The heatmap shows which regions most influenced the AI's diagnosis. Red areas indicate 
        stronger influence. Adjust the opacity slider to compare the original image with the AI's attention map.
      </Text>
    </View>
  );
}