import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "entregas_acesso";

// Headers de CORS aplicados só nas rotas /api, pro app Flutter (web/desktop)
// conseguir chamar o backend de uma origem diferente. A autenticação
// cross-origin usa Bearer token, não cookie, então liberar "*" aqui é seguro.
function comCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api");

  // Preflight: o browser manda OPTIONS antes do request real.
  // Responde direto aqui, sem passar pela lógica de auth abaixo.
  if (isApi && request.method === "OPTIONS") {
    return comCors(new NextResponse(null, { status: 204 }));
  }

  const liberado =
    pathname.startsWith("/acesso") ||
    pathname.startsWith("/api/acesso") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/notification.mp3";

  if (liberado) {
    const response = NextResponse.next();
    return isApi ? comCors(response) : response;
  }

  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (cookie && cookie === process.env.ACCESS_TOKEN) {
    const response = NextResponse.next();
    return isApi ? comCors(response) : response;
  }

  // NOVO: aceita o mesmo token via header Authorization (usado pelo app Flutter)
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;
  if (bearerToken && bearerToken === process.env.ACCESS_TOKEN) {
    const response = NextResponse.next();
    return isApi ? comCors(response) : response;
  }

  // Rota de API sem autenticação válida: responde 401 com CORS
  // em vez de redirecionar (redirect não faz sentido pra uma chamada de API).
  if (isApi) {
    return comCors(NextResponse.json({ error: "Não autorizado" }, { status: 401 }));
  }

  const url = request.nextUrl.clone();
  url.pathname = "/acesso";
  url.searchParams.set("redirect", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};