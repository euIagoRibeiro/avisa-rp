import React, { createContext, useContext, useState } from 'react';
import { User, RegisterData } from '../types';

interface AuthContextValue {
  user: User | null;
  pendingPhone: string | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (data: RegisterData) => Promise<boolean>;
  verifyOTP: (code: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const MOCK_USERS: Array<User & { password: string }> = [
  { id: '1', name: 'João Silva', email: 'cidadao@avisa.rp', role: 'cidadao', password: '123456' },
  { id: '2', name: 'Prefeitura RP', email: 'admin@avisa.rp', role: 'admin', password: 'admin123' },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pendingRegistration, setPendingRegistration] = useState<RegisterData | null>(null);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

  function login(email: string, password: string): boolean {
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!found) return false;
    setUser({ id: found.id, name: found.name, email: found.email, role: found.role });
    return true;
  }

  function logout() {
    setUser(null);
  }

  async function register(data: RegisterData): Promise<boolean> {
    await new Promise(r => setTimeout(r, 600));
    setPendingRegistration(data);
    setPendingPhone(data.phone);
    return true;
  }

  function verifyOTP(code: string): boolean {
    if (code.length !== 6 || !pendingRegistration) return false;
    const { name, email } = pendingRegistration;
    setUser({
      id: Date.now().toString(),
      name,
      email,
      role: 'cidadao',
    });
    setPendingRegistration(null);
    setPendingPhone(null);
    return true;
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
