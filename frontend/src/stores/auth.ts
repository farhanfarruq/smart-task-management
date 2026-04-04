import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiClient from '../services/api';
import type { User, AuthResponse } from '../types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'));
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'));

  const isAuthenticated = computed(() => !!accessToken.value);
  const isAdmin = computed(() => user.value?.role === 'ADMIN');

  async function requestOtp(email: string) {
    const response = await apiClient.post('/auth/request-otp', { email });
    return response.data;
  }

  async function verifyOtp(email: string, code: string) {
    const response = await apiClient.post<AuthResponse>('/auth/verify-otp', { email, code });
    const { accessToken: newAccessToken, refreshToken: newRefreshToken, user: userData } = response.data;
    accessToken.value = newAccessToken;
    refreshToken.value = newRefreshToken;
    user.value = userData;
    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    return userData;
  }

  function logout() {
    accessToken.value = null;
    refreshToken.value = null;
    user.value = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  function setUser(userData: User) {
    user.value = userData;
  }

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isAdmin,
    requestOtp,
    verifyOtp,
    logout,
    setUser,
  };
});