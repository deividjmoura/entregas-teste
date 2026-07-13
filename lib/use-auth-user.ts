"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "./firebase";

/**
 * undefined = ainda carregando o estado de auth
 * null      = confirmado que não está logado (já redireciona pra "/")
 * User      = logado
 */
export function useAuthUser(): User | null | undefined {
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) router.push("/");
    });
    return () => unsubscribe();
  }, [router]);

  return user;
}
