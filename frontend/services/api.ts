import axios from 'axios';
import { useAuthStore } from '../stores/auth';

// Base API configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Matches nuxt.config.ts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});

// Handle 401/403 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const authStore = useAuthStore();
      authStore.clearAuth();
      window.location.href = '/login'; // Redirect to login on auth failure
    }
    return Promise.reject(error);
  }
);

// API functions
// USER
export const registerUser = async (username: string, password: string, role: string) => {
  const response = await api.post('/auth/register', {
    username,
    password,
    role,
  });
  return response.data;
};

export const loginUser = async (username: string, password: string) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const updateUserProfile = async (username: string, password?: string) => {
  const response = await api.put('/auth/profile', { username, password });
  return response.data;
};

export const searchUsers = async (query: string = '') => {
  const response = await api.get('/auth/users', { params: { query } });
  return response.data;
};

export const updateUserByAdmin = async (userId: number, username: string) => {
  const Username = username.toLowerCase();
  const response = await api.put('/auth/users', { userId, username: Username });
  return response.data;
};

export const deleteUserByAdmin = async (userId: number) => {
  const response = await api.delete('/auth/users', { data: { userId } });
  return response.data;
};

//Building
export const addBuilding = async (name: string) => {
  const response = await api.post('/building/buildings', { name });
  return response.data;
};

export const addFloor = async (buildingId: number, name: string, description: string) => {
  const response = await api.post('/building/floors', {
    buildingId,
    name,
    description,
  });
  return response.data;
};

export const updateBuilding = async (buildingId: number, name: string) => {
  const response = await api.put('/building/buildings', { buildingId, name });
  return response.data;
};

export const updateFloor = async (floorId: number, name: string, description: string) => {
  const response = await api.put('/building/floors', {
    floorId,
    name,
    description,
  });
  return response.data;
};

export const deleteBuilding = async (buildingId: number) => {
  const response = await api.delete('/building/buildings', {
    data: { buildingId },
  });
  return response.data;
};

export const deleteFloor = async (floorId: number) => {
  const response = await api.delete('/building/floors', { data: { floorId } });
  return response.data;
};

export const getBuildingsAndFloors = async () => {
  const response = await api.get('/building/buildings');
  return response.data;
};

// Types for floor plan functions
interface Seat {
  seatNumber: string;
  description?: string;
  available: boolean;
  x: number;
  y: number;
  angle: number;
}

export const createFloorPlan = async (floorId: number, image: string, seats: Seat[]) => {
  const response = await api.post('/floorplan/add', { floorId, image, seats });
  return response.data.data;
};

export const getFloorPlan = async (floorId: number) => {
  const response = await api.get(`/floorplan/${floorId}`);
  return response.data.data;
};

export const updateFloorPlan = async (floorId: number, seats: Seat[]) => {
  const response = await api.put(`/floorplan/${floorId}`, { seats });
  return response.data.data;
};

export const bookingSeat = async (seatId: number, date: string) => {
  const response = await api.post('/booking/add', { seatId, date });
  return response.data.data;
};

export const getBookingHistory = async () => {
  const response = await api.get('/booking/history');
  return response.data.data;
};

export const deleteBooking = async (bookingId: number) => {
  const response = await api.delete('/booking/delete', { data: { bookingId } });
  return response.data;
};

export default api;
