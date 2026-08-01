import { NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher-server';

// Exemplo de Handler para criação/atualização disparando tempo real
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Aqui você salva no seu Banco com Prisma (Exemplo)
    // const novaEntrega = await prisma.entrega.create({ data: body });

    const novaEntrega = { id: Date.now().toString(), ...body, createdAt: new Date() };

    // Dispara o evento instantaneamente para todos os ouvintes no canal "painel-entregas"
    await pusherServer.trigger('painel-entregas', 'nova-entrega', novaEntrega);

    return NextResponse.json({ success: true, data: novaEntrega });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro ao processar entrega' }, { status: 500 });
  }
}
