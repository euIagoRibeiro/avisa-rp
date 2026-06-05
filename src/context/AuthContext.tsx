import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { User, RegisterData } from '../types';
import { TOKEN_KEY, stripPhoneMask } from '../services/api';
import * as authService from '../services/authService';

const USER_KEY = '@avisarp:user';

interface AuthContextValue {
  user: User | null;
  pendingPhone: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  verifyOTP: (code: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

  useEffect(() => {
    async function restore() {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const raw = await AsyncStorage.getItem(USER_KEY);
      if (token && raw) {
        setUser(JSON.parse(raw) as User);
      }
    }
    restore();
  }, []);

  async function login(email: string, password: string): Promise<boolean> {
    try {
      const { token, user: loggedUser } = await authService.login({ email, password });
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(loggedUser));
      setUser(loggedUser);
      return true;
    } catch {
      return false;
    }
  }

  function logout() {
    authService.logout().catch(() => {});
    AsyncStorage.removeItem(TOKEN_KEY);
    AsyncStorage.removeItem(USER_KEY);
    setUser(null);
  }

  async function register(data: RegisterData): Promise<void> {
    try {
      await authService.register(data);
      setPendingPhone(stripPhoneMask(data.phone));
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Erro ao cadastrar. Tente novamente.')
        : 'Erro ao cadastrar. Tente novamente.';
      throw new Error(message);
    }
  }

  async function verifyOTP(code: string): Promise<boolean> {
    if (!pendingPhone) return false;
    try {
      const { token, user: verified } = await authService.verifyOTP({ phone: pendingPhone, code });
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(verified));
      setUser(verified);
      setPendingPhone(null);
      return true;
    } catch {
      return false;
    }
  }

  return (
    <AuthContext.Provider value={{ user, pendingPhone, login, logout, register, verifyOTP }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
