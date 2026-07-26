import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Central de Despacho — Entregas Internas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#090A0E",
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(129,140,248,0.25), transparent 45%), radial-gradient(circle at 85% 80%, rgba(45,212,191,0.18), transparent 45%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#949EAB",
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: "#F2B705",
            }}
          />
          central de despacho
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: 700,
            color: "#EEF0F5",
            lineHeight: 1.15,
            maxWidth: 980,
          }}
        >
          Nenhum item entregue duas vezes.
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 28,
            color: "#949EAB",
            maxWidth: 880,
          }}
        >
          Substitui rádio e WhatsApp por uma fila única, com atribuição travada em tempo real.
        </div>
      </div>
    ),
    { ...size },
  );
}