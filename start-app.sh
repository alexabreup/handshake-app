#!/bin/bash

# Script para ligar o HandShake App
# Autor: Gerado por Claude Code

echo "🚀 Iniciando HandShake App..."
echo "================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Diretório do projeto
PROJECT_DIR="/home/alxp/Desktop/handshake-app"

# Verificar se o diretório existe
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Erro: Diretório do projeto não encontrado: $PROJECT_DIR${NC}"
    exit 1
fi

# Função para verificar se porta está ocupada
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Porta ocupada
    else
        return 1  # Porta livre
    fi
}

# Função para aguardar até que o servidor esteja rodando
wait_for_server() {
    local port=$1
    local name=$2
    local max_attempts=30
    local attempt=0
    
    echo -e "${YELLOW}⏳ Aguardando $name iniciar na porta $port...${NC}"
    
    while [ $attempt -lt $max_attempts ]; do
        if check_port $port; then
            echo -e "${GREEN}✅ $name iniciado com sucesso!${NC}"
            return 0
        fi
        
        attempt=$((attempt + 1))
        sleep 1
        echo -n "."
    done
    
    echo -e "${RED}❌ Timeout: $name não iniciou em $max_attempts segundos${NC}"
    return 1
}

# Matar processos existentes primeiro
echo -e "${YELLOW}🔄 Finalizando processos existentes...${NC}"
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true

# Aguardar um pouco para os processos terminarem
sleep 2

# Iniciar Backend
echo -e "${BLUE}🖥️  Iniciando Backend (porta 5001)...${NC}"
cd "$PROJECT_DIR/backend"

if [ ! -f "server.js" ]; then
    echo -e "${RED}❌ Erro: server.js não encontrado em $PROJECT_DIR/backend${NC}"
    exit 1
fi

# Iniciar backend em background
nohup node server.js > /tmp/handshake-backend.log 2>&1 &
BACKEND_PID=$!

# Aguardar backend iniciar
if wait_for_server 5001 "Backend"; then
    echo -e "${GREEN}📊 Backend PID: $BACKEND_PID${NC}"
else
    echo -e "${RED}❌ Falha ao iniciar backend${NC}"
    exit 1
fi

# Iniciar Frontend
echo -e "${BLUE}🌐 Iniciando Frontend (porta 3000)...${NC}"
cd "$PROJECT_DIR/frontend"

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: package.json não encontrado em $PROJECT_DIR/frontend${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependências...${NC}"
    npm install
fi

# Iniciar frontend em background
nohup npm start > /tmp/handshake-frontend.log 2>&1 &
FRONTEND_PID=$!

# Aguardar frontend iniciar
if wait_for_server 3000 "Frontend"; then
    echo -e "${GREEN}🖼️  Frontend PID: $FRONTEND_PID${NC}"
else
    echo -e "${RED}❌ Falha ao iniciar frontend${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Salvar PIDs para facilitar o shutdown depois
echo "$BACKEND_PID" > /tmp/handshake-backend.pid
echo "$FRONTEND_PID" > /tmp/handshake-frontend.pid

echo ""
echo -e "${GREEN}🎉 HandShake App iniciado com sucesso!${NC}"
echo "================================"
echo -e "${BLUE}📱 Frontend:${NC} http://localhost:3000"
echo -e "${BLUE}🔗 Rede local:${NC} http://$(hostname -I | awk '{print $1}'):3000"
echo -e "${BLUE}🖥️  Backend:${NC} http://localhost:5001"
echo ""
echo -e "${YELLOW}📋 Funcionalidades disponíveis:${NC}"
echo "   🔍 Escaneamento de rede"
echo "   🤝 Handshake com dispositivos"
echo "   💾 Salvar relatórios"
echo "   📃 Histórico de conexões"
echo "   🛑 Botão de desligamento integrado"
echo ""
echo -e "${BLUE}📝 Logs:${NC}"
echo "   Backend: tail -f /tmp/handshake-backend.log"
echo "   Frontend: tail -f /tmp/handshake-frontend.log"
echo ""
echo -e "${YELLOW}Para parar os servidores:${NC}"
echo "   Use o botão 🛑 no aplicativo ou execute:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo -e "${GREEN}✨ Aplicação pronta para uso!${NC}"