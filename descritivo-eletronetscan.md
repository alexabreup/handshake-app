# ElectroNetScan - Documentação Técnica e Funcional

## Visão Geral

ElectroNetScan é uma aplicação de escaneamento de rede local que permite aos usuários descobrir, identificar e interagir com dispositivos conectados à mesma rede. A aplicação possui funcionalidades avançadas como detecção de dispositivos, identificação de roteadores/modems, tentativas de handshake automático e conexão com interfaces administrativas de dispositivos de rede.

## Arquitetura

A aplicação segue uma arquitetura cliente-servidor:

- **Backend**: Servidor Node.js com Express que executa comandos de sistema para escanear a rede e interagir com dispositivos
- **Frontend**: Aplicação React que fornece uma interface de usuário para visualizar e interagir com os dispositivos descobertos

### Portas e Endpoints

- **Backend**: Porta 5001
- **Frontend**: Porta 3099

## Funcionalidades Principais

### 1. Escaneamento de Rede

A aplicação escaneia a rede local para descobrir dispositivos conectados utilizando:

- Identificação do IP local e gateway
- Ping para dispositivos na mesma sub-rede
- Consulta à tabela ARP para identificar dispositivos
- Identificação de tipos de dispositivos baseada em padrões de MAC address e hostnames

**Dados coletados por dispositivo:**
- Endereço IP
- Endereço MAC
- Hostname (quando disponível)
- Tipo de dispositivo (identificado por heurística)
- Fabricante (baseado em prefixos MAC)
- Status (online/offline)
- Identificação de roteadores/modems

### 2. Handshake com Dispositivos

A funcionalidade de handshake permite:

- Verificar portas abertas em dispositivos (HTTP, HTTPS, Telnet, SSH)
- Identificar interfaces administrativas
- Sugerir credenciais padrão baseadas no tipo/fabricante do dispositivo
- Gerar URLs de acesso para interfaces administrativas

**Dispositivos suportados para handshake:**
- HLK-RM04
- Roteadores TP-Link
- Roteadores D-Link
- Roteadores Netgear
- Roteadores Linksys
- Roteadores Huawei
- Roteadores ZTE
- Modems Arris
- Modems Motorola
- Outros roteadores/gateways genéricos

### 3. Conexão Automática

A funcionalidade de conexão automática tenta:

- Autenticar em interfaces web usando credenciais fornecidas
- Detectar formulários de login
- Tentar conexão via Telnet/SSH quando disponível
- Fornecer feedback sobre o resultado da tentativa de conexão

### 4. Histórico de Conexões

A aplicação mantém um histórico de:

- Tentativas de handshake
- Dispositivos acessados
- Resultados de conexão
- Timestamps de acesso

### 5. Geração de Relatórios

A aplicação permite salvar e baixar relatórios contendo:

- Informações da rede local
- Lista de dispositivos encontrados
- Detalhes técnicos de cada dispositivo
- Timestamp do escaneamento

## Fluxos de Usuário

### Fluxo Principal

1. Usuário inicia o escaneamento de rede
2. Aplicação exibe informações da rede local (IP, gateway, interface)
3. Aplicação exibe lista de dispositivos encontrados com seus detalhes
4. Usuário pode selecionar dispositivos para realizar handshake
5. Usuário pode tentar conexão automática com credenciais
6. Usuário pode acessar interfaces administrativas diretamente
7. Usuário pode salvar e baixar relatórios do escaneamento

### Fluxo de Handshake

1. Usuário seleciona um dispositivo (geralmente roteador/modem)
2. Aplicação verifica portas abertas e serviços disponíveis
3. Aplicação sugere método de acesso e credenciais padrão
4. Usuário pode tentar conexão automática com credenciais personalizadas
5. Aplicação registra a tentativa no histórico de conexões

## Detalhes Técnicos

### Backend (Node.js/Express)

#### Dependências Principais
- express: Framework web
- cors: Middleware para habilitar CORS
- child_process: Módulo para executar comandos de sistema
- fs: Módulo para operações de arquivo

#### Endpoints da API

1. **POST /api/scan**
   - Executa o escaneamento de rede
   - Retorna informações da rede e dispositivos encontrados

2. **POST /api/handshake**
   - Parâmetros: `ip`, `deviceType`
   - Executa handshake com o dispositivo especificado
   - Retorna informações de portas abertas e métodos de acesso

3. **POST /api/auto-connect**
   - Parâmetros: `ip`, `deviceType`, `username`, `password`
   - Tenta conexão automática com as credenciais fornecidas
   - Retorna resultado da tentativa de conexão

4. **GET /api/handshake-history**
   - Retorna histórico de tentativas de handshake

5. **POST /api/save-report**
   - Parâmetros: `data`, `filename`
   - Salva relatório de escaneamento em formato texto
   - Retorna confirmação e nome do arquivo

6. **GET /api/download/:filename**
   - Permite download do relatório salvo

#### Comandos de Sistema Utilizados

- `ip route`: Obter informações de roteamento
- `arp -a`: Consultar tabela ARP
- `ping`: Verificar conectividade com dispositivos
- `nc` (netcat): Verificar portas abertas
- `curl`: Testar interfaces web e autenticação HTTP

### Frontend (React)

#### Componentes Principais

1. **App**: Componente principal que gerencia o estado da aplicação
2. **NetworkInfo**: Exibe informações da rede local
3. **DeviceTable**: Exibe tabela de dispositivos encontrados
4. **HandshakeModal**: Modal para realizar handshake com dispositivos
5. **ConnectionHistoryModal**: Modal para exibir histórico de conexões

#### Estados Principais

- `networkData`: Dados do escaneamento de rede
- `loading`: Estado de carregamento durante escaneamento
- `error`: Mensagens de erro
- `selectedDevice`: Dispositivo selecionado para handshake
- `handshakeResult`: Resultado do handshake
- `autoConnectResult`: Resultado da conexão automática
- `saveStatus`: Status do salvamento de relatório

## Requisitos de Sistema

### Backend
- Node.js 12+
- Sistema operacional Linux (utiliza comandos específicos do Linux)
- Ferramentas de rede: ip, arp, ping, nc, curl

### Frontend
- Navegador moderno com suporte a ES6+
- Conexão com o servidor backend

## Limitações Atuais

- Funciona apenas em sistemas Linux devido aos comandos utilizados
- Não possui autenticação ou controle de acesso
- Armazenamento de histórico em memória (não persistente)
- Identificação de dispositivos baseada em heurística (pode não ser 100% precisa)
- Handshake limitado a dispositivos específicos

## Oportunidades de Melhoria

### Funcionalidades
- Persistência de dados (banco de dados)
- Autenticação e controle de acesso
- Monitoramento contínuo de dispositivos
- Detecção de novos dispositivos em tempo real
- Integração com sistemas de gerenciamento de rede
- Suporte a mais tipos de dispositivos
- Detecção de vulnerabilidades em dispositivos

### Interface
- Dashboard com visualização gráfica da rede
- Mapa de topologia de rede
- Gráficos de utilização de rede por dispositivo
- Temas claro/escuro
- Interface responsiva para dispositivos móveis
- Notificações em tempo real
- Filtros avançados para dispositivos
- Visualização personalizada de relatórios

### Técnicas
- Migração para TypeScript
- Testes automatizados
- CI/CD
- Containerização (Docker)
- Suporte a múltiplos sistemas operacionais
- Otimização de performance para redes grandes
- API RESTful mais robusta
- Documentação OpenAPI/Swagger

## Casos de Uso

1. **Administradores de Rede**: Identificar todos os dispositivos conectados à rede local
2. **Técnicos de TI**: Acessar rapidamente interfaces administrativas de roteadores/modems
3. **Segurança**: Identificar dispositivos não autorizados na rede
4. **Suporte Técnico**: Diagnosticar problemas de conectividade
5. **Usuários Domésticos**: Verificar quais dispositivos estão conectados à sua rede

## Conclusão

ElectroNetScan é uma ferramenta poderosa para descoberta e interação com dispositivos em redes locais. Com uma interface intuitiva e funcionalidades avançadas de handshake e conexão automática, a aplicação facilita o trabalho de administradores de rede e técnicos de TI. As oportunidades de melhoria identificadas podem elevar ainda mais o valor e a utilidade da aplicação para diversos casos de uso.
