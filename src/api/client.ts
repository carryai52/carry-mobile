import axios from 'axios';
import { authClient } from '../lib/auth-client';
import * as SecureStore from 'expo-secure-store';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://aicarry.online',
});

// Since better-auth expo plugin handles cookie storage natively
apiClient.interceptors.request.use(async (config) => {
  try {
    // Better Auth Expo provides getCookie() to attach session properly without Bearer hacks
    const cookie = await (authClient as any).getCookie();
    if (cookie) {
      config.headers.set('Cookie', cookie);
    }
  } catch (err) {
    console.error('Failed to get session cookie for API request', err);
  }
  return config;
});
