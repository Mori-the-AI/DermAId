import axios from 'axios';

const API_BASE = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export const predictImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/predict', formData);
  return data;
};

export const explainImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/explain', formData);
  return data;
};

export const uncertaintyImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/uncertainty', formData);
  return data;
};

export const fullAnalysis = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/full-analysis', formData);
  return data;
};