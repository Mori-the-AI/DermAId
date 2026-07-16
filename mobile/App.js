import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import {
  Brain,
  Microscope,
  Shield,
  Upload,
  AlertTriangle,
  Camera,
  Image as ImageIcon,
  X,
  BookOpen,
} from 'lucide-react-native';
import { fullAnalysis, predictImage } from './src/services/api';
import PredictionCard from './src/components/PredictionCard';
import HeatmapViewer from './src/components/HeatmapViewer';
import UncertaintyPanel from './src/components/UncertaintyPanel';
import LimitationsPanel from './src/components/LimitationsPanel';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('prediction');
  const [showCamera, setShowCamera] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const handleImage = async (uri) => {
    setSelectedImage(uri);
    setShowCamera(false);
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const [predictionData, fullData] = await Promise.all([
        predictImage(uri),
        fullAnalysis(uri),
      ]);
      setResults({
        prediction: predictionData,
        explainability: fullData.explainability,
        uncertainty: fullData.uncertainty,
      });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      handleImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    if (!permission?.granted) {
      await requestPermission();
    }
    setShowCamera(true);
  };

  const capturePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
      handleImage(photo.uri);
    }
  };

  const tabs = [
    { id: 'prediction', label: 'Diagnosis', icon: Brain },
    { id: 'heatmap', label: 'Explain', icon: Microscope },
    { id: 'uncertainty', label: 'Uncertainty', icon: Shield },
    { id: 'limitations', label: 'Limits', icon: BookOpen },
  ];

  // Camera View
  if (showCamera) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
          <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1, justifyContent: 'flex-end', padding: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                <TouchableOpacity
                  onPress={() => setShowCamera(false)}
                  style={{
                    width: 48, height: 48, borderRadius: 24,
                    backgroundColor: 'rgba(15,23,42,0.8)',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X size={24} color="#94a3b8" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={capturePhoto}
                  style={{
                    width: 72, height: 72, borderRadius: 36,
                    backgroundColor: '#fff',
                    alignItems: 'center', justifyContent: 'center',
                    borderWidth: 4, borderColor: 'rgba(20,184,166,0.5)',
                  }}
                >
                  <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#0f172a' }} />
                </TouchableOpacity>
                <View style={{ width: 48 }} />
              </View>
              <Text style={{ color: '#94a3b8', textAlign: 'center', fontSize: 13 }}>
                Position the lesion in the center
              </Text>
            </View>
          </SafeAreaView>
        </CameraView>
      </View>
    );
  }

  // Main App
  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(51,65,85,0.5)',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0f172a',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{
              width: 40, height: 40, borderRadius: 12,
              backgroundColor: '#0f172a',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Brain size={24} color="#14b8a6" />
            </View>
            <View>
              <Text style={{ color: '#f1f5f9', fontSize: 20, fontWeight: '700' }}>DermAId</Text>
              <Text style={{ color: '#64748b', fontSize: 12 }}>Explainable AI for Dermatology</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' }} />
            <Text style={{ color: '#94a3b8', fontSize: 13 }}>Online</Text>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={{
          backgroundColor: 'rgba(217,119,6,0.15)',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(217,119,6,0.3)',
          paddingHorizontal: 20,
          paddingVertical: 10,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
            <AlertTriangle size={18} color="#fbbf24" />
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fbbf24', fontSize: 13, fontWeight: '600' }}>
                Research Prototype — Not for Clinical Use
              </Text>
              <Text style={{ color: 'rgba(251,191,36,0.7)', fontSize: 11, marginTop: 2 }}>
                Student research project. Not validated for diagnostic use.
              </Text>
            </View>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 16 }}>
          {/* Image Upload Area */}
          {!selectedImage ? (
            <View style={{ gap: 12 }}>
              <View style={{
                borderWidth: 2, borderColor: '#334155', borderStyle: 'dashed',
                borderRadius: 20, padding: 40, alignItems: 'center', gap: 16,
                backgroundColor: 'rgba(30,41,59,0.3)',
              }}>
                <View style={{
                  width: 72, height: 72, borderRadius: 20,
                  backgroundColor: 'rgba(51,65,85,0.5)',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Upload size={36} color="#64748b" />
                </View>
                <Text style={{ color: '#cbd5e1', fontSize: 17, fontWeight: '500' }}>
                  Upload Skin Lesion Image
                </Text>
                <Text style={{ color: '#64748b', fontSize: 13, textAlign: 'center' }}>
                  Dermoscopic images preferred{'\n'}Supports JPG, PNG, BMP
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={takePhoto}
                  style={{
                    flex: 1, paddingVertical: 16, borderRadius: 16,
                    backgroundColor: '#14b8a6', alignItems: 'center',
                    flexDirection: 'row', justifyContent: 'center', gap: 8,
                  }}
                >
                  <Camera size={20} color="#fff" />
                  <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={pickImage}
                  style={{
                    flex: 1, paddingVertical: 16, borderRadius: 16,
                    backgroundColor: 'rgba(51,65,85,0.6)', alignItems: 'center',
                    flexDirection: 'row', justifyContent: 'center', gap: 8,
                    borderWidth: 1, borderColor: '#475569',
                  }}
                >
                  <ImageIcon size={20} color="#cbd5e1" />
                  <Text style={{ color: '#cbd5e1', fontSize: 15, fontWeight: '600' }}>Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <Image
                source={{ uri: selectedImage }}
                style={{ width: '100%', height: 280, borderRadius: 16 }}
                resizeMode="cover"
              />
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                <TouchableOpacity
                  onPress={takePhoto}
                  style={{
                    flex: 1, paddingVertical: 12, borderRadius: 12,
                    backgroundColor: '#14b8a6', alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={pickImage}
                  style={{
                    flex: 1, paddingVertical: 12, borderRadius: 12,
                    backgroundColor: 'rgba(51,65,85,0.4)', alignItems: 'center',
                    borderWidth: 1, borderColor: '#475569',
                  }}
                >
                  <Text style={{ color: '#cbd5e1', fontSize: 14, fontWeight: '600' }}>New Image</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Loading */}
          {loading && (
            <View style={{ alignItems: 'center', padding: 32, gap: 12 }}>
              <ActivityIndicator size="large" color="#14b8a6" />
              <Text style={{ color: '#cbd5e1', fontSize: 16, fontWeight: '500' }}>
                Analyzing image...
              </Text>
              <Text style={{ color: '#64748b', fontSize: 13 }}>
                Running AI diagnosis, explainability, and uncertainty checks
              </Text>
            </View>
          )}

          {/* Error */}
          {error && (
            <View style={{
              backgroundColor: 'rgba(239,68,68,0.15)',
              borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)',
              borderRadius: 16, padding: 16,
            }}>
              <Text style={{ color: '#fca5a5', fontSize: 14 }}>⚠️ {error}</Text>
            </View>
          )}

          {/* Results */}
          {results && !loading && (
            <View style={{ gap: 16 }}>
              {/* Tab Bar */}
              <View style={{
                flexDirection: 'row', backgroundColor: 'rgba(30,41,59,0.6)',
                borderRadius: 14, padding: 4, borderWidth: 1,
                borderColor: 'rgba(51,65,85,0.5)',
              }}>
                {tabs.map(({ id, label, icon: Icon }) => (
                  <TouchableOpacity
                    key={id}
                    onPress={() => setActiveTab(id)}
                    style={{
                      flex: 1, paddingVertical: 10,
                      borderRadius: 11, alignItems: 'center',
                      flexDirection: 'row', justifyContent: 'center', gap: 4,
                      backgroundColor: activeTab === id ? '#14b8a6' : 'transparent',
                    }}
                  >
                    <Icon size={14} color={activeTab === id ? '#fff' : '#94a3b8'} />
                    <Text style={{
                      color: activeTab === id ? '#fff' : '#94a3b8',
                      fontSize: 11, fontWeight: '600',
                    }}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Tab Content */}
              <View style={{
                backgroundColor: 'rgba(30,41,59,0.3)',
                borderRadius: 20, borderWidth: 1,
                borderColor: 'rgba(51,65,85,0.5)',
                overflow: 'hidden',
              }}>
                {activeTab === 'prediction' && (
                  <PredictionCard prediction={results.prediction} />
                )}
                {activeTab === 'heatmap' && (
                  <HeatmapViewer heatmap={results.explainability} originalImage={selectedImage} />
                )}
                {activeTab === 'uncertainty' && (
                  <UncertaintyPanel uncertainty={results.uncertainty} />
                )}
                {activeTab === 'limitations' && (
                  <LimitationsPanel />
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}