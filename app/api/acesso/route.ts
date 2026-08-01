import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { codigo } = await request.json();

  if (!codigo || codigo !== process.env.ACCESS_CODE) {
    return NextResponse.json({ erro: "Código inválido" }, { status: 401 });
  }

  const res = NextResponse.json({
    ok: true,
    token: process.env.ACCESS_TOKEN, // NOVO: app guarda isso pra usar como Bearer
  });
  res.cookies.set("entregas_acesso", process.env.ACCESS_TOKEN!, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}