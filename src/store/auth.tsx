import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { setAuthToken, api } from '../lib/axios';

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
}

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** True while the initial session-restore check is in flight. */
  isInitialising: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const SESSION_KEY = 'tb_token';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitialising, setIsInitialising] = useState(true);

  // On mount: try to restore session from sessionStorage.
  // If a token is found, validate it with /auth/me before trusting it.
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) {
      setIsInitialising(false);
      return;
    }

    setAuthToken(stored);
    api
      .get<AuthUser>('/auth/me')
      .then(({ data }) => {
        setToken(stored);
        setUser(data);
      })
      .catch(() => {
        // Token expired or invalid — clear it.
        sessionStorage.removeItem(SESSION_KEY);
        setAuthToken(null);
      })
      .finally(() => setIsInitialising(false));
  }, []);

  const login = (newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
    setAuthToken(newToken);
    sessionStorage.setItem(SESSION_KEY, newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider
      value={{ token, user, isAuthenticated: !!token, isInitialising, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within <AuthProvider>');
  return ctx;
}
