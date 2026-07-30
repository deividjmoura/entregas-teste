import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { PresenceProvider } from "@/lib/presence-context";
import { NotificacoesProvider } from "@/lib/use-notificacoes-chat";
import { ModalNome } from "@/components/modal-nome";

export const metadata: Metadata = {
  metadataBase: new URL("https://entregas-teste.vercel.app"),
  title: "Entregas Internas | Sistema de Gestão de Entregas",
  description: "Sistema para gerenciamento de entregas internas com fila inteligente, prioridades, chat e histórico em tempo real.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try { const tema = localStorage.getItem('entregas:tema'); if (tema === 'light') document.documentElement.classList.add('light'); } catch (e) {}` }} />
      </head>
      <body className="font-body antialiased selection:bg-indigo-500/10 selection:text-ink">
        <AuthProvider>
          <PresenceProvider>
            <NotificacoesProvider>
              <ModalNome />
              <div className="relative min-h-screen flex flex-col">{children}</div>
              <ThemeToggle />
            </NotificacoesProvider>
          </PresenceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
