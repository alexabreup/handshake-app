# Documentação para Migração do ElectroNetScan para Kiro IDE

## Estrutura do Projeto

O projeto ElectroNetScan é composto por duas partes principais:

### Backend (Node.js/Express)
- Localizado em `/home/alxp/Desktop/handshake-app/backend/`
- Servidor Express rodando na porta 5001
- Endpoints principais:
  - `/api/scan` - Escaneia a rede WiFi conectada
  - `/api/handshake` - Realiza handshake com dispositivo selecionado
  - `/api/auto-connect` - Conecta automaticamente a um dispositivo
  - `/api/save-report` - Salva relatório de escaneamento
  - `/api/download-report` - Baixa relatório salvo

### Frontend (React)
- Localizado em `/home/alxp/Desktop/handshake-app/frontend/`
- Aplicação React com Tailwind CSS e Material Design Dark Theme
- Configurado como PWA com Service Worker

## Problemas Conhecidos

### Loop de Reload no Frontend
O principal problema que estamos enfrentando é um loop contínuo de recarregamento no frontend, que impede a captura estável da rede WiFi conectada. As seguintes tentativas de correção foram implementadas:

1. **Service Worker**: Modificado para não cachear requisições POST
2. **React.StrictMode**: Removido para evitar renderizações duplas
3. **useEffect**: Adicionado para executar scan automaticamente na montagem
4. **Tratamento de Erros**: Melhorado no método `executeScan`
5. **Timeout**: Adicionado para requisições para evitar pendências indefinidas

## Configuração para Kiro IDE

Para migrar o projeto para o Kiro IDE da Amazon, siga estas etapas:

1. **Clone o Repositório**:
   ```bash
   git clone [URL_DO_REPOSITÓRIO] handshake-app
   cd handshake-app
   ```

2. **Instale as Dependências**:
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Inicie o Backend**:
   ```bash
   cd backend
   node server.js
   ```

4. **Inicie o Frontend**:
   ```bash
   cd frontend
   npm start
   ```

## Arquivos Principais para Depuração

### Frontend
- `/frontend/src/App.js` - Componente principal com lógica de escaneamento
- `/frontend/src/index.js` - Configuração do Service Worker
- `/frontend/public/serviceWorker.js` - Implementação do Service Worker

### Backend
- `/backend/server.js` - Servidor Express com endpoints da API

## Próximos Passos Recomendados

1. Verificar se o problema de loop persiste no Kiro IDE
2. Analisar logs de console para identificar padrões de re-renderização
3. Isolar componentes para determinar qual parte do código está causando o loop
4. Considerar uma abordagem diferente para o gerenciamento de estado (Redux, Context API)
5. Testar com diferentes navegadores para verificar se é um problema específico do navegador

## Notas Adicionais

- O proxy está configurado no `package.json` do frontend para redirecionar chamadas API para o backend na porta 5001
- Os relatórios gerados são salvos em `/backend/reports/`
- O Service Worker foi configurado para estratégia network-first para APIs e cache-first para assets estáticos
