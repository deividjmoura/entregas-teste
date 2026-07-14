# Entregas Internas — Demo

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-2C5282?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma.io)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

**Central de despacho** — Substitui rádio e WhatsApp por uma fila única com atribuição travada em tempo real.

**Demo online**: [https://entregas-teste.vercel.app](https://entregas-teste.vercel.app)

## Funcionalidades atuais

- Autenticação com **Google (Firebase)**
- Painel de **Solicitante**: abrir, editar, remover e acompanhar urgências
- Painel de **Entregador**: fila ordenada por urgência com timer de espera
- **Lock otimista real** — dois entregadores não conseguem assumir a mesma tarefa simultaneamente
- Confirmação de entrega com atualização em tempo real (polling)
- Visualização e ampliação de fotos das solicitações
- Busca e filtros no painel do solicitante
- Design responsivo e polido (layout fixo, sem scroll duplo)

### O que ainda não tem (evolução futura)
- Notificações push
- IA para detecção de duplicatas
- Observabilidade e logs avançados
- Infraestrutura completa em GCP

---

## Como rodar localmente

```bash
git clone https://github.com/deividjmoura/entregas-teste.git
cd entregas-teste

cp .env.example .env
# Configure DATABASE_URL e as credenciais do Firebase no .env

npm install
npx prisma db push
npm run dev