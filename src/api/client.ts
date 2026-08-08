import axios from 'axios';
import { authClient } from '../lib/auth-client';
import * as SecureStore from 'expo-secure-store';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://aicarry.online',
});

// Since better-auth expo plugin might use a specific key for token, we will intercept requests.
apiClient.interceptors.request.use(async (config) => {
  try {
    // If we can get a session token, we attach it. 
    // better-auth expo plugin uses storagePrefix "carry_auth"
    const sessionToken = await SecureStore.getItemAsync('carry_auth_session_token');
    if (sessionToken) {
      config.headers.Authorization = `Bearer ${sessionToken}`;
    }
  } catch (err) {
    console.error('Failed to get session token for API request', err);
  }
  return config;
});
