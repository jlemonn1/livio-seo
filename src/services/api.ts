import axios from 'axios';
import type { ReservaRequest, ReservaCreated, ReservaDetalle, DashboardStats, Page, QRValidationResponse, LoginResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

const authHeader = () => {
  const token = localStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const crearReserva = async (data: ReservaRequest): Promise<ReservaCreated> => {
  const response = await api.post('/reservas', data);
  return response.data;
};

export const loginAdmin = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const getDashboard = async (): Promise<DashboardStats> => {
  const response = await api.get('/admin/dashboard', { headers: authHeader() });
  return response.data;
};

export const getReservas = async (fecha?: string, page = 0, size = 20): Promise<Page<ReservaDetalle>> => {
  const response = await api.get('/admin/reservas', {
    headers: authHeader(),
    params: {
      ...(fecha ? { fecha } : {}),
      page,
      size,
    },
  });
  return response.data;
};

export const getReserva = async (id: number): Promise<ReservaDetalle> => {
  const response = await api.get(`/admin/reservas/${id}`, { headers: authHeader() });
  return response.data;
};

export const editarReserva = async (id: number, data: ReservaRequest): Promise<ReservaDetalle> => {
  const response = await api.put(`/admin/reservas/${id}`, data, { headers: authHeader() });
  return response.data;
};

export const cancelarReserva = async (id: number): Promise<void> => {
  await api.delete(`/admin/reservas/${id}`, { headers: authHeader() });
};

export const validarQR = async (qrToken: string): Promise<QRValidationResponse> => {
  const response = await api.post('/admin/validar-qr', { token: qrToken }, { headers: authHeader() });
  return response.data;
};

export default api;