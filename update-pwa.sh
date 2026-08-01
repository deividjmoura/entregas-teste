#!/bin/bash

echo "🚀 Atualizando arquivos e estrutura do PWA..."

# 1. Garantir pasta de ícones e gerar SVGs de fallback
mkdir -p public/icons

cat << 'SVG' > public/icons/icon.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="100" fill="#4f46e5"/>
  <path d="M160 190h192v132H160z" fill="none" stroke="#ffffff" stroke-width="24" stroke-linejoin="round"/>
  <path d="M256 120v70M160 236h192" fill="none" stroke="#ffffff" stroke-width="24" stroke-linecap="round"/>
  <circle cx="200" cy="360" r="28" fill="#ffffff"/>
  <circle cx="312" cy="360" r="28" fill="#ffffff"/>
</svg>
SVG

# Copiar SVG para os nomes esperados pelo browser
cp public/icons/icon.svg public/icons/icon-192x192.png
cp public/icons/icon.svg public/icons/icon-512x512.png

# 2. Atualizar public/sw.js
cat << 'SW' > public/sw.js
const CACHE_NAME = 'entregas-pwa-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
SW

# 3. Atualizar components/PWAProvider.tsx
mkdir -p components
cat << 'PROVIDER' > components/PWAProvider.tsx
'use client';

import { useEffect, useState } from 'react';

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('✅ Service Worker Ativo:', reg.scope))
        .catch((err) => console.error('❌ Erro no SW:', err));
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  return (
    <>
      {children}
      {isInstallable && (
        <div className="fixed bottom-4 right-4 z-50 bg-indigo-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <span className="text-sm font-medium">Instalar app no dispositivo?</span>
          <button
            onClick={handleInstallClick}
            className="bg-white text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            Instalar
          </button>
        </div>
      )}
    </>
  );
}
PROVIDER

# 4. Atualizar app/layout.tsx
cat << 'LAYOUT' > app/layout.tsx
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { PresenceProvider } from "@/lib/presence-context";
import { NotificacoesProvider } from "@/lib/use-notificacoes-chat";
import { ModalNome } from "@/components/modal-nome";
import { PWAProvider } from "@/components/PWAProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://entregas-teste.vercel.app"),
  title: "Entregas Internas | Sistema de Gestão de Entregas",
  description: "Sistema para gerenciamento de entregas internas com fila inteligente, prioridades, chat e histórico em tempo real.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Entregas",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try { const tema = localStorage.getItem('entregas:tema'); if (tema === 'light') document.documentElement.classList.add('light'); } catch (e) {}`,
          }}
        />
      </head>
      <body className="font-body antialiased selection:bg-indigo-500/10 selection:text-ink">
        <PWAProvider>
          <AuthProvider>
            <PresenceProvider>
              <NotificacoesProvider>
                <ModalNome />
                <div className="relative min-h-screen flex flex-col">{children}</div>
                <ThemeToggle />
              </NotificacoesProvider>
            </PresenceProvider>
          </AuthProvider>
        </PWAProvider>
      </body>
    </html>
  );
}
LAYOUT

echo "✅ Arquivos atualizados com sucesso!"
