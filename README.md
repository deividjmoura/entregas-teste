# Entregas Internas — Demo

Versão simplificada para apresentação: **um único app Next.js**, sem
GCP, sem Firebase, sem microserviços. Zero custo. Pensado pra ir do zero
a um link público em ~15 minutos.

O que já funciona:
- Solicitante abre urgência (tipo, item, local, urgência)
- Entregador vê a fila ordenada por urgência e assume — com **lock
  otimista real** (dois entregadores não conseguem assumir a mesma
  urgência, mesmo clicando ao mesmo tempo)
- Confirmação de entrega
- Atualização quase em tempo real via polling (a cada 2,5–3s)

O que **não** está aqui ainda (fica pra proposta de evolução paga):
autenticação real, notificação push, IA de detecção de duplicatas,
observabilidade, microserviços, infraestrutura GCP.

---

## Deploy gratuito (Neon + Vercel) — passo a passo

### 1. Banco de dados gratuito (Neon)
1. Acesse [neon.tech](https://neon.tech) e crie uma conta grátis (não
   pede cartão)
2. Crie um projeto novo → copie a **Connection String** (algo como
   `postgresql://usuario:senha@ep-xxxx.neon.tech/neondb?sslmode=require`)

### 2. Subir o código pro GitHub
```bash
cd entregas-demo
git init
git add .
git commit -m "feat: primeira versão do demo de entregas internas"
git branch -M main
git remote add origin <URL_DO_SEU_REPO_NO_GITHUB>
git push -u origin main
```

### 3. Deploy gratuito (Vercel)
1. Acesse [vercel.com](https://vercel.com) → login com GitHub
2. "Add New Project" → selecione o repositório que você acabou de subir
3. Em **Environment Variables**, adicione:
   - `DATABASE_URL` = a connection string do Neon (passo 1)
4. Clique em Deploy

### 4. Criar as tabelas no banco (uma vez só)
Depois do primeiro deploy, rode localmente (com o `.env` apontando pro
Neon) ou via terminal da Vercel:
```bash
npx prisma db push
```
Isso cria a tabela `Solicitacao` no banco gratuito do Neon.

### 5. Pronto
A Vercel te dá uma URL tipo `https://seu-projeto.vercel.app` — esse é o
link que você usa na apresentação amanhã, acessível de qualquer lugar.

---

## Rodar local (antes de fazer deploy, pra testar)

```bash
cp .env.example .env
# edite o .env com a connection string do Neon
npm install
npx prisma db push
npm run dev
```
Abra `http://localhost:3000`.

---

## Roteiro sugerido pra apresentação

1. Abrir em duas abas: uma como **Solicitante**, outra como **Entregador**
2. Na aba Solicitante: abrir uma urgência crítica
3. Trocar pra aba Entregador: mostrar a urgência aparecendo na fila com
   destaque vermelho pulsante
4. Clicar "Assumir" → mostrar que o status muda em tempo real na aba do
   Solicitante também (sem dar refresh)
5. **Mostrar o ponto forte**: abrir duas abas de Entregador diferentes
   (nomes diferentes), tentar assumir a mesma urgência nas duas ao mesmo
   tempo → só uma consegue, a outra recebe o erro "já foi assumida" —
   isso prova o mecanismo central do sistema
6. Confirmar a entrega → status muda pra "Entregue"
7. Fechar com o roadmap: "isso aqui é o núcleo funcionando sem custo.
   A proposta de evolução adiciona autenticação real, notificação push,
   IA pra detectar duplicata automaticamente, e infraestrutura escalável
   — com investimento X."
