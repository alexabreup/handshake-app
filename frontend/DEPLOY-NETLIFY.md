# 🚀 Deploy no Netlify - ElectroNetScan

Este guia explica como fazer o deploy do aplicativo ElectroNetScan no Netlify.

## 📋 Pré-requisitos

- Conta no [Netlify](https://netlify.com)
- Backend rodando em um serviço de hospedagem (Heroku, Railway, etc.)
- Código fonte do frontend

## 🔧 Configuração do Backend

Antes de fazer o deploy do frontend, você precisa:

1. **Deployar o backend** em um serviço como:
   - Heroku
   - Railway
   - Render
   - DigitalOcean App Platform

2. **Obter a URL do backend** (ex: `https://seu-app.herokuapp.com`)

3. **Configurar as variáveis de ambiente** no Netlify

## 🌐 Configuração no Netlify

### 1. Conectar o Repositório

1. Acesse [app.netlify.com](https://app.netlify.com)
2. Clique em "New site from Git"
3. Conecte seu repositório GitHub/GitLab/Bitbucket
4. Selecione o repositório do projeto

### 2. Configurações de Build

Configure as seguintes opções:

- **Build command**: `npm run build`
- **Publish directory**: `build`
- **Base directory**: `frontend` (se o projeto estiver na raiz)

### 3. Variáveis de Ambiente

Adicione as seguintes variáveis de ambiente no Netlify:

```
REACT_APP_API_URL=https://seu-backend.herokuapp.com
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
```

**Importante**: Substitua `https://seu-backend.herokuapp.com` pela URL real do seu backend.

### 4. Deploy

1. Clique em "Deploy site"
2. Aguarde o build ser concluído
3. Verifique se o site está funcionando

## 🔍 Verificação do Deploy

Após o deploy, verifique:

1. **Console do navegador** para erros de CORS
2. **Network tab** para ver se as requisições estão sendo feitas
3. **Funcionalidades principais**:
   - Scan de rede
   - Handshake com dispositivos
   - Salvamento de relatórios

## 🛠️ Solução de Problemas

### Erro de CORS

Se houver erro de CORS, verifique se o backend está configurado para aceitar requisições do domínio do Netlify.

### API não encontrada

Verifique se a variável `REACT_APP_API_URL` está configurada corretamente.

### Build falhando

1. Verifique se todas as dependências estão no `package.json`
2. Execute `npm run build` localmente para identificar problemas
3. Verifique os logs de build no Netlify

## 📱 Configurações Adicionais

### Domínio Personalizado

1. Vá em "Domain settings"
2. Clique em "Add custom domain"
3. Configure seu domínio

### HTTPS

O Netlify fornece HTTPS automaticamente para todos os sites.

### Cache e Performance

O Netlify otimiza automaticamente:
- Minificação de CSS/JS
- Compressão gzip
- CDN global
- Cache de assets

## 🔄 Deploy Automático

O Netlify faz deploy automático sempre que você fizer push para a branch principal.

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs de build no Netlify
2. Teste localmente com `npm run build`
3. Verifique a documentação do Netlify
4. Consulte os issues do projeto

---

**🎯 Seu aplicativo ElectroNetScan está pronto para o deploy no Netlify!**
