#!/bin/bash

# Script para parar o HandShake App
# Autor: Gerado por Claude Code

echo "🛑 Parando HandShake App..."
echo "=========================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar se processo está rodando
is_running() {
    local pid=$1
    if kill -0 $pid 2>/dev/null; then
        return 0  # Processo rodando
    else
        return 1  # Processo não está rodando
    fi
}

# Parar usando PIDs salvos se disponível
if [ -f "/tmp/handshake-backend.pid" ]; then
    BACKEND_PID=$(cat /tmp/handshake-backend.pid)
    if is_running $BACKEND_PID; then
        echo -e "${YELLOW}🖥️  Parando Backend (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID 2>/dev/null
        sleep 2
        if is_running $BACKEND_PID; then
            echo -e "${RED}⚠️  Forçando parada do Backend...${NC}"
            kill -9 $BACKEND_PID 2>/dev/null
        fi
        echo -e "${GREEN}✅ Backend parado${NC}"
    else
        echo -e "${YELLOW}ℹ️  Backend já estava parado${NC}"
    fi
    rm -f /tmp/handshake-backend.pid
fi

if [ -f "/tmp/handshake-frontend.pid" ]; then
    FRONTEND_PID=$(cat /tmp/handshake-frontend.pid)
    if is_running $FRONTEND_PID; then
        echo -e "${YELLOW}🌐 Parando Frontend (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID 2>/dev/null
        sleep 2
        if is_running $FRONTEND_PID; then
            echo -e "${RED}⚠️  Forçando parada do Frontend...${NC}"
            kill -9 $FRONTEND_PID 2>/dev/null
        fi
        echo -e "${GREEN}✅ Frontend parado${NC}"
    else
        echo -e "${YELLOW}ℹ️  Frontend já estava parado${NC}"
    fi
    rm -f /tmp/handshake-frontend.pid
fi

# Parar qualquer processo restante relacionado ao HandShake App
echo -e "${YELLOW}🔄 Verificando processos restantes...${NC}"

# Parar processos Node.js relacionados
pkill -f "node.*server.js" 2>/dev/null && echo -e "${GREEN}✅ Processos backend restantes finalizados${NC}" || true
pkill -f "react-scripts" 2>/dev/null && echo -e "${GREEN}✅ Processos React restantes finalizados${NC}" || true
pkill -f "npm start" 2>/dev/null && echo -e "${GREEN}✅ Processos npm restantes finalizados${NC}" || true

# Limpar logs se desejado
read -p "🗑️  Limpar logs? (y/N): " clear_logs
if [[ $clear_logs =~ ^[Yy]$ ]]; then
    rm -f /tmp/handshake-backend.log /tmp/handshake-frontend.log
    echo -e "${GREEN}✅ Logs limpos${NC}"
fi

echo ""
echo -e "${GREEN}🎉 HandShake App parado com sucesso!${NC}"
echo -e "${YELLOW}Para reiniciar, execute: ./start-app.sh${NC}"