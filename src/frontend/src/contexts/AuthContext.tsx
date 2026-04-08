import { createContext, useContext, useEffect, useState } from "react";

const ADMIN_EMAIL = "vikaskharb00007@gmail.com";
const ADMIN_PASSWORD = "miku@03love";
const STORAGE_KEY = "vn_auth";

// Default public user with full access (no login required)
const PUBLIC_DEFAULT: AuthState = {
  username: "Guest",
  sectionLevel: 3,
  isAdmin: false,
};

export interface AuthState {
  username: string;
  sectionLevel: number;
  isAdmin: boolean;
}

interface AuthContextValue {
  auth: AuthState | null;
  login: (username: string, sectionLevel: number) => void;
  loginAdmin: (email: string, password: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
  sectionLevel: number;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthState;
        // If stored state is admin, keep it; otherwise use public default
        if (parsed.isAdmin) return parsed;
      }
    } catch {
      // ignore
    }
    return PUBLIC_DEFAULT;
  });

  useEffect(() => {
    if (auth?.isAdmin) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [auth]);

  function login(username: string, sectionLevel: number) {
    setAuth({ username, sectionLevel, isAdmin: false });
  }

  function loginAdmin(email: string, password: string): boolean {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setAuth({ username: "Admin", sectionLevel: 3, isAdmin: true });
      return true;
    }
    return false;
  }

  function logout() {
    setAuth(PUBLIC_DEFAULT);
  }

  return (
    <AuthContext.Provider
      value={{
        auth,
        login,
        loginAdmin,
        logout,
        isAdmin: auth?.isAdmin ?? false,
        sectionLevel: auth?.sectionLevel ?? 3,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
