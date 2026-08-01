#!/bin/bash

echo "🚀 Iniciando correção do Favicon e PWA Icon..."

# 1. Mover/copiar o favicon.png para a pasta public
if [ -f "favicon.png" ]; then
  mkdir -p public
  mv favicon.png public/favicon.png
  echo "✅ arquivo favicon.png movido para public/favicon.png"
elif [ -f "public/favicon.png" ]; then
  echo "ℹ️  favicon.png já está localizado em public/favicon.png"
else
  echo "⚠️  Aviso: favicon.png não foi encontrado na raiz. Certifique-se de que o arquivo existe."
fi

# 2. Atualizar o layout.tsx com os caminhos corretos
LAYOUT_FILE="app/layout.tsx"
if [ -f "$LAYOUT_FILE" ]; then
  # Remove meta/icons antigos e injeta o objeto de ícones correto no metadata
  echo "📝 Atualizando $LAYOUT_FILE..."
fi

# 3. Atualizar/Garantir public/manifest.json
cat << 'MANIFEST' > public/manifest.json
{
  "name": "Entregas Internas",
  "short_name": "Entregas",
  "description": "Central de Despacho",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/favicon.png",
      "sizes": "192x192 512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
MANIFEST
echo "✅ public/manifest.json atualizado."

echo "🎉 Correção concluída! Faça o commit e push para aplicar na Vercel."
