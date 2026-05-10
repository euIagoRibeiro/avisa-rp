import React, { createContext, useContext, useState } from 'react';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const MOCK_USERS: Array<User & { password: string }> = [
  { id: '1', name: 'João Silva', email: 'cidadao@avisa.rp', role: 'cidadao', password: '123456' },
  { id: '2', name: 'Prefeitura RP', email: 'admin@avisa.rp', role: 'admin', password: 'admin123' },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  function login(email: string, password: string): boolean {
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!found) return false;
    setUser({ id: found.id, name: found.name, email: found.email, role: found.role });
    return true;
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
