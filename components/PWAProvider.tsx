'use client';

import { useEffect, useState } from 'react';

const CHAVE_DISMISS = 'entregas:pwa-install-dismissed';

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Já dispensou antes? Não mostra de novo
    if (localStorage.getItem(CHAVE_DISMISS) === '1') return;

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
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('Resultado do prompt de instalação:', outcome);
    setIsInstallable(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(CHAVE_DISMISS, '1');
    setIsInstallable(false);
    setDeferredPrompt(null);
  };

  return (
    <>
      {children}
      {isInstallable && (
        <div className="fixed bottom-4 right-4 z-50 bg-indigo-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3">
          <span className="text-sm font-medium">Instalar app no dispositivo?</span>
          <button
            onClick={handleInstallClick}
            className="bg-white text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            Instalar
          </button>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white text-xs font-medium px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Não instalar"
          >
            Não
          </button>
        </div>
      )}
    </>
  );
}