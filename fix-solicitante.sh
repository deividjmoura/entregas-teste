#!/bin/bash
# ==============================================================================
# SCRIPT DE CORREÇÃO — PONTO DE NOTIFICAÇÃO DO CHAT SUMIU
# Alvo: lib/use-notificacoes-chat.tsx
# Objetivo: Corrigir o nome da função do estado de setSetMensagensNaoLidas para setMensagensNaoLidas.
# ==============================================================================
set -e

NOTIF_FILE="lib/use-notificacoes-chat.tsx"

if [ -f "$NOTIF_FILE" ]; then
  echo "🔧 Corrigindo nome da função de estado no arquivo de notificações..."
  
  # Utiliza o sed nativo para corrigir o erro de digitação duplicado de forma cirúrgica
  if grep -q "setSetMensagensNaoLidas" "$NOTIF_FILE"; then
    sed -i 's/setSetMensagensNaoLidas/setMensagensNaoLidas/g' "$NOTIF_FILE"
    echo "✅ Linha de estado corrigida com sucesso!"
  else
    echo "⚠️ O erro de digitação não foi encontrado. Verifique se o arquivo já está correto."
  fi
else
  echo "❌ Arquivo $NOTIF_FILE não encontrado. Verifique se o caminho está correto."
  exit 1
fi
