"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInAnonymously,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextValue {
  user: User | null;
  nome: string | null;
  carregando: boolean;
  modalVisitanteAberto: boolean;
  abrirModalVisitante: () => void;
  fecharModalVisitante: () => void;
  entrarComoVisitante: (nome: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [modalVisitanteAberto, setModalVisitanteAberto] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setCarregando(false);
    });
    return unsubscribe;
  }, []);

  function abrirModalVisitante() {
    setModalVisitanteAberto(true);
  }

  function fecharModalVisitante() {
    setModalVisitanteAberto(false);
  }

  // Só é chamada quando o usuário confirma o modal de visitante —
  // nunca dispara sozinha, diferente da primeira versão.
  async function entrarComoVisitante(nome: string) {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) throw new Error("Nome obrigatório");

    const currentUser = auth.currentUser ?? (await signInAnonymously(auth)).user;
    await updateProfile(currentUser, { displayName: nomeLimpo });
    setUser({ ...currentUser, displayName: nomeLimpo } as User);
    localStorage.setItem("nomeUsuario", nomeLimpo);
    setModalVisitanteAberto(false);
    return currentUser;
  }

  const nome = user?.displayName ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        nome,
        carregando,
        modalVisitanteAberto,
        abrirModalVisitante,
        fecharModalVisitante,
        entrarComoVisitante,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}