#!/bin/bash

echo "📱 Iniciando a configuração do PWA e Suporte Offline..."

# 1. Criar o Web App Manifest em public/manifest.json
echo "📄 Criando public/manifest.json..."
mkdir -p public
cat << 'EOF' > public/manifest.json
{
  "name": "Entregas Internas — Central de Despacho",
  "short_name": "Entregas",
  "description": "Central de despacho e logística interna para galpões e fábricas.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#09090b",
  "theme_color": "#09090b",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
EOF

# 2. Criar o Service Worker em public/sw.js
echo "📄 Criando public/sw.js (Service Worker)..."
cat << 'EOF' > public/sw.js
const CACHE_NAME = 'entregas-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico'
];

// Instalação: Armazena recursos estáticos em cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Ativação: Limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Interceptação de requisições: Estratégia Network First com fallback para Cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
EOF

# 3. Criar Componente para Registrar o Service Worker (components/PWAProvider.tsx)
echo "📄 Criando components/PWAProvider.tsx..."
mkdir -p components
cat << 'EOF' > components/PWAProvider.tsx
'use client';

import { useEffect } from 'react';

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('✅ Service Worker registrado:', reg.scope))
        .catch((err) => console.error('❌ Erro no Service Worker:', err));
    }
  }, []);

  return <>{children}</>;
}
EOF

# 4. Criar Gerenciador de Fila Offline com IndexedDB (lib/offline-queue.ts)
echo "📄 Criando lib/offline-queue.ts para sincronização de pendências..."
mkdir -p lib
cat << 'EOF' > lib/offline-queue.ts
'use client';

const DB_NAME = 'entregas_offline_db';
const STORE_NAME = 'fila_requisicoes';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function salvarAcaoOffline(url: string, payload: any) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.add({ url, payload, timestamp: Date.now() });
}

export async function sincronizarFilaOffline() {
  if (!navigator.onLine) return;

  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const request = store.getAll();

  request.onsuccess = async () => {
    const itens = request.result;
    for (const item of itens) {
      try {
        const res = await fetch(item.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload),
        });
        if (res.ok) {
          const deleteTx = db.transaction(STORE_NAME, 'readwrite');
          deleteTx.objectStore(STORE_NAME).delete(item.id);
        }
      } catch (err) {
        console.error('Falha ao sincronizar item offline:', item, err);
      }
    }
  };
}
EOF

echo "--------------------------------------------------------"
echo "✅ Configuração PWA concluída!"
echo "✨ Lembre-se de adicionar as tags do manifest no seu layout.tsx!"
echo "--------------------------------------------------------"