#!/bin/bash

echo "🚀 Iniciando build de produção para Netlify..."

# Limpar builds anteriores
echo "🧹 Limpando builds anteriores..."
rm -rf build/

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci --only=production

# Build de produção
echo "🔨 Executando build de produção..."
npm run build

# Verificar se o build foi bem-sucedido
if [ -d "build" ]; then
    echo "✅ Build concluído com sucesso!"
    echo "📁 Conteúdo da pasta build:"
    ls -la build/
    
    echo ""
    echo "🎯 Arquivos prontos para deploy no Netlify:"
    echo "   - Pasta 'build' contém todos os arquivos necessários"
    echo "   - Configure o Netlify para usar 'build' como pasta de publicação"
    echo "   - Use 'npm run build' como comando de build"
else
    echo "❌ Erro no build!"
    exit 1
fi
