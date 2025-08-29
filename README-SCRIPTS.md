# 🚀 Scripts HandShake App

Scripts para facilitar o gerenciamento da aplicação HandShake.

## 📋 Arquivos Disponíveis

- `start-app.sh` - Script para iniciar a aplicação
- `stop-app.sh` - Script para parar a aplicação
- `README-SCRIPTS.md` - Este arquivo de instruções

## 🎯 Como Usar

### ▶️ Iniciar Aplicação

```bash
cd /home/alxp/Desktop/handshake-app
./start-app.sh
```

**O que o script faz:**
- ✅ Verifica e mata processos existentes
- ✅ Inicia o backend na porta 5001
- ✅ Inicia o frontend na porta 3000
- ✅ Aguarda os servidores ficarem prontos
- ✅ Salva PIDs para controle posterior
- ✅ Mostra informações de acesso

### ⏹️ Parar Aplicação

```bash
cd /home/alxp/Desktop/handshake-app
./stop-app.sh
```

**O que o script faz:**
- ✅ Para os servidores usando PIDs salvos
- ✅ Remove processos restantes
- ✅ Limpa arquivos temporários
- ✅ Opção para limpar logs

### 🌐 Acesso após inicialização

- **Frontend:** http://localhost:3000
- **Rede Local:** http://192.168.15.13:3000
- **Backend API:** http://localhost:5001

## 🛠️ Funcionalidades da Aplicação

- 🔍 **Escaneamento de rede** - Descobre dispositivos na rede local
- 🤝 **Handshake** - Testa conectividade com dispositivos
- 💾 **Relatórios** - Salva resultados de scan
- 📃 **Histórico** - Visualiza conexões anteriores
- 🛑 **Shutdown integrado** - Botão para parar servidores

## 📝 Logs

Os logs são salvos automaticamente em:
- Backend: `/tmp/handshake-backend.log`
- Frontend: `/tmp/handshake-frontend.log`

Para visualizar em tempo real:
```bash
# Backend
tail -f /tmp/handshake-backend.log

# Frontend  
tail -f /tmp/handshake-frontend.log
```

## 🔧 Solução de Problemas

### Se os scripts não executarem:
```bash
chmod +x start-app.sh stop-app.sh
```

### Se as portas estiverem ocupadas:
O script `start-app.sh` automaticamente mata processos existentes, mas se houver problemas:
```bash
# Matar manualmente
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:5001 | xargs kill -9
```

### Verificar se está rodando:
```bash
# Verificar portas
lsof -i :3000
lsof -i :5001

# Verificar processos
ps aux | grep -E "node|npm"
```

## 🎉 Pronto!

Agora você pode facilmente iniciar e parar o HandShake App com um comando simples!