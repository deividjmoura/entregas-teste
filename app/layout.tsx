import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { PresenceProvider } from "@/lib/presence-context";
import { NotificacoesProvider } from "@/lib/use-notificacoes-chat";
import { ModalNome } from "@/components/modal-nome";

const display = Inter({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://entregas-teste.vercel.app"),
  title: "Entregas Internas | Sistema de Gestão de Entregas",
  description:
    "Sistema para gerenciamento de entregas internas com fila inteligente, prioridades, chat e histórico em tempo real.",
  keywords: [
    "entregas",
    "gestão",
    "nextjs",
    "prisma",
    "firebase",
    "controle de entregas",
  ],
  openGraph: {
    title: "Entregas Internas | Sistema de Gestão de Entregas",
    description: "Fila inteligente, prioridades, chat e histórico em tempo real.",
    url: "https://entregas-teste.vercel.app",
    siteName: "Entregas Internas",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Entregas Internas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Entregas Internas | Sistema de Gestão de Entregas",
    description: "Fila inteligente, prioridades, chat e histórico em tempo real.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
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
      <body className={`${display.variable} ${body.variable} ${mono.variable} font-body antialiased`}>
        <AuthProvider>
          <PresenceProvider>
            <NotificacoesProvider>
              <ModalNome />
              <div className="relative min-h-screen">{children}</div>
              <ThemeToggle />
            </NotificacoesProvider>
          </PresenceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
