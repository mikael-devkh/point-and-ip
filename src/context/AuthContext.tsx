import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { User } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

interface AuthContextValue {
  user: User | null | undefined;
  loadingAuth: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, loadingAuth] = useAuthState(auth);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loadingAuth }),
    [user, loadingAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
