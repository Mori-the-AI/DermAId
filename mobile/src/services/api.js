import axios from 'axios';
import * as FileSystem from 'expo-file-system';

const API_BASE = 'http://192.168.0.103:8000'; // Change to your laptop's IP

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
});

export const fullAnalysis = async (imageUri) => {
  const formData = new FormData();
  
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'lesion.jpg',
  });
  
  const { data } = await api.post('/full-analysis', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  
  return data;
};