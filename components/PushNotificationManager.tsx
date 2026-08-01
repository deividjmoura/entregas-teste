'use client';

import { useEffect, useState } from 'react';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!publicKey) {
        console.error('VAPID Public Key não configurada!');
        return;
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      setSubscription(sub);

      // Envia a subscrição para o backend
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      });

      alert('🔔 Notificações ativadas com sucesso!');
    } catch (error) {
      console.error('Erro ao ativar notificações:', error);
    }
  }

  if (!isSupported) return null;

  return (
    <div className="p-2">
      {!subscription ? (
        <button
          onClick={subscribeToPush}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center gap-2 transition-all shadow-md"
        >
          🔔 Ativar Notificações Push
        </button>
      ) : (
        <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
          ✅ Notificações Ativas
        </span>
      )}
    </div>
  );
}
