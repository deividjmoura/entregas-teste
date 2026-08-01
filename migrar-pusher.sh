#!/bin/bash

echo "🚀 Iniciando a migração do Polling para Pusher em Tempo Real..."

# 1. Instalar dependências necessárias
echo "📦 Instalando pusher e pusher-js..."
npm install pusher pusher-js

# 2. Criar a instância do Pusher Client (Browser)
echo "📄 Criando lib/pusher-client.ts..."
mkdir -p lib
cat << 'EOF' > lib/pusher-client.ts
import PusherClient from 'pusher-js';

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  }
);
EOF

# 3. Garantir a existência do lib/pusher-server.ts
echo "📄 Atualizando/Validando lib/pusher-server.ts..."
cat << 'EOF' > lib/pusher-server.ts
import Pusher from 'pusher';

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});
EOF

# 4. Criar Hook Reutilizável de Tempo Real (usePusher)
echo "📄 Criando hook/utilitário em hooks/usePusherChannel.ts..."
mkdir -p hooks
cat << 'EOF' > hooks/usePusherChannel.ts
'use client';

import { useEffect } from 'react';
import { pusherClient } from '@/lib/pusher-client';

export function usePusherChannel(channelName: string, eventName: string, callback: (data: any) => void) {
  useEffect(() => {
    const channel = pusherClient.subscribe(channelName);
    channel.bind(eventName, callback);

    return () => {
      channel.unbind(eventName, callback);
      pusherClient.unsubscribe(channelName);
    };
  }, [channelName, eventName, callback]);
}
EOF

# 5. Criar Exemplo de Rota API disparando evento Pusher
echo "📄 Criando/Atualizando exemplo de rota API em app/api/entregas/route.ts..."
mkdir -p app/api/entregas
cat << 'EOF' > app/api/entregas/route.ts
import { NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher-server';

// Exemplo de Handler para criação/atualização disparando tempo real
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Aqui você salva no seu Banco com Prisma (Exemplo)
    // const novaEntrega = await prisma.entrega.create({ data: body });

    const novaEntrega = { id: Date.now().toString(), ...body, createdAt: new Date() };

    # Dispara o evento instantaneamente para todos os ouvintes no canal "painel-entregas"
    await pusherServer.trigger('painel-entregas', 'nova-entrega', novaEntrega);

    return NextResponse.json({ success: true, data: novaEntrega });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro ao processar entrega' }, { status: 500 });
  }
}
EOF

echo "--------------------------------------------------------"
echo "✅ Migração de infraestrutura concluída com sucesso!"
echo "✨ Arquivos gerados:"
echo "   - lib/pusher-client.ts"
echo "   - lib/pusher-server.ts"
echo "   - hooks/usePusherChannel.ts"
echo "   - app/api/entregas/route.ts"
echo "--------------------------------------------------------"
echo "👉 Lembre-se de rodar seu projeto: 'npm run dev'"