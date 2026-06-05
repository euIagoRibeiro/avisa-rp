import { api, stripPhoneMask } from './api';
import { User } from '../types';

interface AuthResponse {
  token: string;
  user: User;
}

export async function register(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<void> {
  await api.post('/auth/register', {
    ...data,
    phone: stripPhoneMask(data.phone),
  });
}

export async function verifyOTP(data: {
  phone: string;
  code: string;
}): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/verify-otp', data);
  return res.data;
}

export async function login(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/login', data);
  return res.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function resendOTP(data: { phone: string }): Promise<void> {
  await api.post('/auth/resend-otp', data);
}
