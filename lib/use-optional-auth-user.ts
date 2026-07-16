"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "./firebase";

/**
 * Igual ao useAuthUser, mas NUNCA redireciona — usado em telas públicas
 * (como o painel) que só precisam saber SE tem alguém logado, sem forçar
 * login pra acessar.
 */
export function useOptionalAuthUser(): User | null | undefined {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  return user;
}