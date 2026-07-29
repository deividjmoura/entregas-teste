"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";

export default function Home() {
  const router = useRouter();
  const [entrando, setEntrando] = useState<"solicitante" | "entregador" | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const { abrirModalVisitante } = useAuth();

  async function entrarComGoogle(perfil: "solicitante" | "entregador") {
    setEntrando(perfil);
    setErro(null);
    try {
      await signInWithPopup(auth, googleProvider);
      localStorage.setItem("entregas:perfil", perfil);
      router.push(`/${perfil}`);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível entrar com o Google. Tente novamente.");
    } finally {
      setEntrando(null);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-panel-border bg-panel px-3 py-1">
            <span className="h-1.5 w-1.5 animate-pulse-led rounded-full bg-success" />
            <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-dim">
              central de despacho
            </span>
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Uma fila.
            <br />
            <span className="text-dim">Zero confusão.</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-dim">
            Entre com sua conta Google e escolha como vai usar o sistema
          </p>
        </div>

        {erro && (
          <p className="mb-4 rounded-lg border border-critical/20 bg-critical/5 px-3 py-2 text-center text-sm text-critical">
            {erro}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Card className="overflow-hidden p-0">
            <button
              onClick={() => entrarComGoogle("solicitante")}
              disabled={entrando !== null}
              className="flex w-full flex-col items-center gap-2.5 px-4 py-5 transition hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <GoogleIcon />
              <div className="font-display text-sm font-semibold text-ink">Solicitante</div>
              <div className="text-center text-xs leading-snug text-dim">
                Abrir e acompanhar urgência
              </div>
            </button>
          </Card>
          <Card className="overflow-hidden p-0">
            <button
              onClick={() => entrarComGoogle("entregador")}
              disabled={entrando !== null}
              className="flex w-full flex-col items-center gap-2.5 px-4 py-5 transition hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <GoogleIcon />
              <div className="font-display text-sm font-semibold text-ink">Entregador</div>
              <div className="text-center text-xs leading-snug text-dim">
                Ver fila e assumir entregas
              </div>
            </button>
          </Card>
        </div>

        <div className="mt-5 space-y-1.5 text-center">
          <button
            onClick={abrirModalVisitante}
            className="w-full text-center text-xs text-dim transition hover:text-ink"
          >
            Entrar como visitante →
          </button>
          <button
            onClick={() => router.push("/painel")}
            className="w-full text-center text-xs text-dim transition hover:text-ink"
          >
            Ver fila de solicitações sem login →
          </button>
        </div>

        <p className="mt-8 text-center font-mono text-[10px] leading-relaxed text-muted">
          Autenticado via Google — nenhuma senha própria armazenada
          <br />
          Feito com muito ☕ e ❤️ por{" "}
          <a
            href="https://deividmoura.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-ink hover:underline"
          >
            Deivid Moura
          </a>
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}
