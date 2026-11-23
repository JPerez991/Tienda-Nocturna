import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, ApiError } from "../lib/api";
import type { LoginInput, RegisterInput, User } from "../lib/types";

interface AuthContextValue {
  user: User | null;
  /** true mientras se verifica la sesión inicial con GET /api/auth/me */
  loading: boolean;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setUser(await api.auth.me());
    } catch (err) {
      // 401 = sin sesión; cualquier otro error también deja al usuario "fuera"
      // pero no rompe la app.
      if (err instanceof ApiError && err.statusCode === 401) setUser(null);
      else setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (input: LoginInput) => {
    const reducido = await api.auth.login(input);
    // El contrato devuelve un usuario reducido al iniciar sesión (id, nombre y
    // rol). Hidratamos con /api/auth/me para tener correo y apellidos en el
    // header y en la cuenta; si falla, seguimos con lo que dio el login.
    try {
      const completo = await api.auth.me();
      setUser(completo);
      return completo;
    } catch {
      setUser(reducido);
      return reducido;
    }
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const u = await api.auth.register(input);
    // El registro no garantiza sesión según el contrato; verificamos.
    try {
      setUser(await api.auth.me());
    } catch {
      setUser(null);
    }
    return u;
  }, []);

  const logout = useCallback(async () => {
    await api.auth.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
