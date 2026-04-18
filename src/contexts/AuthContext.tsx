import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin as apiLoginAdmin } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function parseJwtExpires(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.exp ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('adminToken'));
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem('adminToken');
    setToken(null);
    navigate('/admin/login');
  }, [navigate]);

  useEffect(() => {
    if (!token) return;

    const expiresAt = parseJwtExpires(token);
    if (!expiresAt) return;

    const now = Date.now();
    if (expiresAt <= now) {
      logout();
      return;
    }

    const timeout = expiresAt - now;
    const timer = setTimeout(logout, timeout);
    return () => clearTimeout(timer);
  }, [token, logout]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'adminToken' && !e.newValue) {
        setToken(null);
        navigate('/admin/login');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [navigate]);

  const login = async (username: string, password: string) => {
    const data = await apiLoginAdmin(username, password);
    localStorage.setItem('adminToken', data.token);
    setToken(data.token);
    navigate('/admin');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}