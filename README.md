# ElectroNetScan

Aplicação web para escaneamento de redes locais e estabelecimento de conexões com dispositivos conectados.

## Funcionalidades

- **Scan de Rede**: Descoberta de dispositivos conectados na rede local
- **Handshake Automático**: Estabelecimento de conexões com roteadores e dispositivos
- **Interface Responsiva**: UI moderna construída com Tailwind CSS
- **Geração de Relatórios**: Criação e salvamento de relatórios de scan
- **Histórico de Conexões**: Registro de todas as conexões realizadas

## Stack Tecnológica

### Frontend
- React 19
- Tailwind CSS 3.3.0
- Axios para requisições HTTP
- Lodash para utilitários

### Backend
- Node.js
- Express.js
- CORS habilitado
- Execução de comandos de sistema

### Deploy
- Configurado para Netlify
- Build otimizado para produção
- Variáveis de ambiente configuráveis

## Configuração para Deploy no Netlify

Este aplicativo está configurado para deploy automático no Netlify. Consulte o arquivo `INSTRUCOES-NETLIFY.md` para instruções detalhadas.

### Configurações do Netlify

- **Build Command**: `npm run build`
- **Publish Directory**: `build`
- **Base Directory**: `frontend`

## Instalação e Execução

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Acesso à rede local

### Desenvolvimento Local

1. Clone o repositório:
```bash
git clone https://github.com/alexabreup/handshake-app.git
cd handshake-app
```

2. Instalação de dependências:
```bash
# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install
```

3. Execução do aplicativo:
```bash
# Terminal 1 - Backend (porta 5001)
cd backend && npm start

# Terminal 2 - Frontend (porta 3000)
cd frontend && npm start
```

### Deploy em Produção

1. Deploy do backend em plataforma de hospedagem (Heroku, Railway, Render)
2. Configuração das variáveis de ambiente no Netlify
3. Conexão do repositório ao Netlify
4. Deploy automático a cada push na branch principal

## Estrutura do Projeto

```
handshake-app/
├── frontend/                 # Aplicação React
│   ├── src/                 # Código fonte
│   │   ├── App.js          # Componente principal
│   │   └── index.js        # Ponto de entrada
│   ├── public/             # Arquivos públicos
│   ├── netlify.toml        # Configuração do Netlify
│   ├── tailwind.config.js  # Configuração do Tailwind
│   └── package.json        # Dependências do frontend
├── backend/                 # Servidor Node.js
│   ├── server.js           # Servidor Express
│   ├── package.json        # Dependências do backend
│   └── reports/            # Relatórios gerados
└── docs/                   # Documentação
```

## Configuração de Ambiente

### Variáveis de Ambiente

```bash
# Frontend (Netlify)
REACT_APP_API_URL=https://seu-backend.herokuapp.com
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0

# Backend
PORT=5001
NODE_ENV=production
```

### Configuração de CORS

O backend está configurado para aceitar requisições de qualquer origem em desenvolvimento. Para produção, configure o CORS adequadamente.

## API Endpoints

### Backend (porta 5001)

- `POST /api/scan` - Executa scan da rede
- `POST /api/handshake` - Estabelece handshake com dispositivo
- `POST /api/auto-connect` - Tenta conexão automática
- `POST /api/save-report` - Salva relatório de scan
- `GET /api/download/:filename` - Download de relatório
- `POST /api/shutdown` - Desliga o servidor
- `POST /api/restart` - Reinicia o servidor
- `GET /api/status` - Status do servidor

## Build e Deploy

### Build Local

```bash
cd frontend
npm run build
```

### Script de Build Otimizado

```bash
./build-prod.sh
```

### Verificação de Build

Após o build, verifique se a pasta `build/` foi criada com sucesso e contém:
- `index.html`
- `static/js/` (arquivos JavaScript)
- `static/css/` (arquivos CSS)
- `_redirects` (redirecionamentos para SPA)

## Solução de Problemas

### Erro de CORS

Verifique se o backend está configurado para aceitar requisições do domínio do Netlify.

### API não encontrada

Confirme se a variável `REACT_APP_API_URL` está configurada corretamente no Netlify.

### Build falhando

1. Execute `npm run build` localmente para identificar problemas
2. Verifique se todas as dependências estão no `package.json`
3. Consulte os logs de build no Netlify

## Documentação Adicional

- [Instruções para Netlify](INSTRUCOES-NETLIFY.md)
- [Guia de Deploy Detalhado](frontend/DEPLOY-NETLIFY.md)
- [Scripts de Automação](README-SCRIPTS.md)

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## Autor

**Alexandre Abreu**
- GitHub: [@alexabreup](https://github.com/alexabreup)

## Agradecimentos

- React Team pela framework
- Tailwind CSS pela biblioteca de componentes
- Netlify pela plataforma de deploy

---

**Se este projeto te ajudou, considere dar uma estrela no repositório.**
