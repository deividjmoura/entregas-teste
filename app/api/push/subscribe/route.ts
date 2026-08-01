import { NextResponse } from 'next/server';

// Em produção, salve a 'subscription' no seu banco de dados (ex: Supabase / Postgres)
let subscriptions: any[] = [];

export async function POST(request: Request) {
  try {
    const subscription = await request.json();
    subscriptions.push(subscription);
    
    return NextResponse.json({ success: true, message: 'Subscrição registrada!' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro ao assinar notificações' }, { status: 500 });
  }
}
