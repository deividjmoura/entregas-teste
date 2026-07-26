import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { PresenceProvider } from "@/lib/presence-context";
import { NotificacoesProvider } from "@/lib/use-notificacoes-chat";
import { ModalNome } from "@/components/modal-nome";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://entregas-teste.vercel.app"),
  title: "Despacho — Entregas Internas",
  description: "Central de coordenação de entregas internas",
  openGraph: {
    title: "Despacho — Entregas Internas",
    description:
      "Substitui rádio e WhatsApp por uma fila única com atribuição travada em tempo real.",
    url: "https://entregas-teste.vercel.app",
    siteName: "Entregas Internas",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Despacho — Entregas Internas",
    description:
      "Substitui rádio e WhatsApp por uma fila única com atribuição travada em tempo real.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const tema = localStorage.getItem('entregas:tema');
                if (tema === 'light') document.documentElement.classList.add('light');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${display.variable} ${body.variable} ${mono.variable} font-body`}>
        <div className="aurora-scene" aria-hidden="true">
          <div className="aurora-blob aurora-blob--1" />
          <div className="aurora-blob aurora-blob--2" />
          <div className="aurora-blob aurora-blob--3" />
        </div>
        <AuthProvider>
        <PresenceProvider>
        <NotificacoesProvider>
        <ModalNome />
        <div className="relative z-[1]">{children}</div>
        <ThemeToggle />
        </NotificacoesProvider>
        </PresenceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}