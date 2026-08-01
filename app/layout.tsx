import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { PresenceProvider } from "@/lib/presence-context";
import { NotificacoesProvider } from "@/lib/use-notificacoes-chat";
import { ModalNome } from "@/components/modal-nome";
import { PWAProvider } from "@/components/PWAProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://entregas-teste.vercel.app"),
  title: "Entregas Internas | Sistema de Gestão de Entregas",
  description: "Sistema para gerenciamento de entregas internas com fila inteligente, prioridades, chat e histórico em tempo real.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Entregas",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try { const tema = localStorage.getItem('entregas:tema'); if (tema === 'light') document.documentElement.classList.add('light'); } catch (e) {}`,
          }}
        />
      </head>
      <body className="font-body antialiased selection:bg-indigo-500/10 selection:text-ink">
        <PWAProvider>
          <AuthProvider>
            <PresenceProvider>
              <NotificacoesProvider>
                <ModalNome />
                <div className="relative min-h-screen flex flex-col">{children}</div>
                <ThemeToggle />
              </NotificacoesProvider>
            </PresenceProvider>
          </AuthProvider>
        </PWAProvider>
      </body>
    </html>
  );
}
