# Entregas Internas — Central de Despacho

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-2C5282?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma.io)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

**Central de despacho** — Substitui rádio e WhatsApp por uma fila única com atribuição travada em tempo real.

**Demo online**: [https://entregas-teste.vercel.app](https://entregas-teste.vercel.app)

## Funcionalidades atuais

**Acesso e autenticação**
- Portão de acesso por código — cada instância/cliente libera o sistema com seu próprio código
- Autenticação com **Google (Firebase)** ou entrada como **visitante** (nome, sem senha)

**Painel de Solicitante**
- Abrir, editar urgência, remover e acompanhar solicitações em tempo real
- Foto opcional anexada à solicitação, com visualização ampliada
- Linha/destino padrão pré-preenchido, configurável por usuário
- Notificação de mensagens não lidas por solicitação

**Painel de Entregador**
- Fila ordenada por urgência, agrupada por local de destino, com timer de espera
- **Lock otimista real** — dois entregadores não conseguem assumir a mesma tarefa
- Confirmação de entrega com atualização em tempo real (polling)
- Cadastro e histórico de endereço no estoque por item, com autopreenchimento em novas solicitações

**Chat por entrega**
- Conversa dedicada entre solicitante e entregador durante o transporte
- Notificação sonora e notificação nativa do navegador (fora de foco)
- Contagem de mensagens não lidas em tempo real

**Painel geral (dashboard)**
- Métricas em tempo real: pendentes, em curso, entregas do dia, rotas atendidas
- Busca e filtros por período, item, local, rack/slide ou solicitante
- Acessível sem login, para acompanhamento público da operação

**Extras**
- Indicador de usuários online em tempo real
- Tema claro/escuro
- Design responsivo, com layout fixo e sem scroll duplicado

## Próximos passos (evolução futura)

- Notificações push nativas (mobile/desktop), além das notificações do navegador atuais
- IA para detecção de solicitações duplicadas
- Observabilidade e logs avançados de uso
- Painel administrativo para gestão de códigos de acesso por cliente
- Infraestrutura completa em GCP

---

## Como rodar localmente

```bash
git clone https://github.com/deividjmoura/entregas-teste.git
cd entregas-teste

cp .env.example .env
# Configure DATABASE_URL, as credenciais do Firebase e o portão de
# acesso (ACCESS_CODE / ACCESS_TOKEN) no .env

npm install
npx prisma db push
npm run dev
```