# Guia de Implementação - ElectroNetScan PWA

## 🎯 Resumo Executivo

O ElectroNetScan foi projetado como uma aplicação PWA moderna para análise e monitoramento de redes WiFi, com foco em dispositivos móveis mas adaptável para desktop/tablet. A solução utiliza **Tailwind CSS** para implementar os princípios do **Material Design Dark Theme**.

## 🏗️ Arquitetura Técnica

### Stack Recomendado
```
Frontend: React 18+ + Tailwind CSS 3+
Backend: Node.js + Express
PWA: Service Workers + Workbox
Icons: Lucide React
Bundler: Vite (para melhor performance PWA)
```

### Estrutura de Pastas
```
src/
├── components/
│   ├── common/          # Componentes reutilizáveis
│   ├── network/         # Componentes específicos de rede
│   ├── security/        # Componentes de segurança
│   └── charts/          # Gráficos e visualizações
├── hooks/               # Custom hooks
├── services/            # Serviços API
├── utils/               # Utilitários
├── styles/              # Estilos Tailwind customizados
└── assets/              # Assets PWA (ícones, etc.)
```

## 🎨 Design System

### Paleta de Cores (Material Dark Theme)
```css
/* Tailwind config customizado */
module.exports = {
  theme: {
    extend: {
      colors: {
        // Surfaces
        'surface': {
          900: '#111827', // Background principal
          800: '#1F2937', // Cards e modais
          700: '#374151', // Elementos interativos
        },
        // Primary
        'primary': {
          600: '#2563EB', // Azul principal
          700: '#1D4ED8', // Azul hover
        },
        // Status colors
        'success': '#10B981',
        'warning': '#F59E0B',
        'error': '#EF4444',
        'info': '#3B82F6'
      }
    }
  }
}
```

### Tipografia
```css
/* Hierarquia de textos */
.text-display: text-3xl font-bold    /* Títulos principais */
.text-headline: text-2xl font-bold   /* Títulos de seção */
.text-title: text-xl font-semibold   /* Títulos de card */
.text-body: text-base                /* Texto principal */
.text-caption: text-sm text-gray-400 /* Textos secundários */
```

## 📱 Implementação PWA

### 1. Configuração do Manifest
```json
{
  "name": "ElectroNetScan",
  "short_name": "NetScan",
  "theme_color": "#1f2937",
  "background_color": "#111827",
  "display": "standalone",
  "scope": "/",
  "start_url": "/",
  "icons": [
    {
      "src": "icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### 2. Service Worker Strategy
```javascript
// Estratégia de cache para PWA
const CACHE_STRATEGY = {
  'api/scan': 'NetworkFirst',      // Dados dinâmicos
  'api/devices': 'CacheFirst',     // Dados estáticos
  'static/': 'CacheFirst',         // Assets
  '/': 'StaleWhileRevalidate'      // HTML principal
};
```

## 🔧 Funcionalidades Core

### 1. Scanner de Rede
```javascript
// Hook customizado para scanning
const useNetworkScanner = () => {
  const [devices, setDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  
  const startScan = async () => {
    setIsScanning(true);
    try {
      const response = await fetch('/api/scan', {
        method: 'POST'
      });
      const data = await response.json();
      setDevices(data.devices);
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };
  
  return { devices, isScanning, startScan };
};
```

### 2. Análise de Performance
```javascript
// Componente para métricas em tempo real
const NetworkMetrics = () => {
  const [metrics, setMetrics] = useState({
    throughput: 0,
    latency: 0,
    packetLoss: 0,
    jitter: 0
  });
  
  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await fetch('/api/metrics').then(r => r.json());
      setMetrics(data);
    }, 5000); // Atualização a cada 5s
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <MetricsGrid metrics={metrics} />
  );
};
```

### 3. Geração de Relatórios
```javascript
// Utilitário para export de relatórios
const generateReport = (networkData, format = 'txt') => {
  const timestamp = new Date().toISOString();
  const filename = `ElectroNetScan_${timestamp.slice(0, 19).replace(/:/g, '-')}.${format}`;
  
  const reportContent = `
ELECTRONET SCAN REPORT
======================
Generated: ${new Date().toLocaleString()}

NETWORK INFORMATION
-------------------
Local IP: ${networkData.localIP}
Gateway: ${networkData.gateway}
SSID: ${networkData.ssid}

DEVICES SUMMARY
---------------
Total: ${networkData.devices.length}
Online: ${networkData.devices.filter(d => d.status === 'online').length}
Offline: ${networkData.devices.filter(d => d.status === 'offline').length}

DEVICE LIST
-----------
${networkData.devices.map(device => `
IP: ${device.ip}
MAC: ${device.mac}
Hostname: ${device.hostname}
Type: ${device.type}
Manufacturer: ${device.manufacturer}
Status: ${device.status}
Signal: ${device.signal}dBm
Security: ${device.security}
---`).join('')}
  `;
  
  // Download do arquivo
  const blob = new Blob([reportContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
```

## 🛡️ Segurança e Performance

### 1. Otimizações de Performance
```javascript
// Lazy loading para componentes pesados
const NetworkAnalyzer = lazy(() => import('./components/NetworkAnalyzer'));
const SecurityPanel = lazy(() => import('./components/SecurityPanel'));

// Memoização para evitar re-renders
const DeviceCard = memo(({ device }) => {
  return (
    <div className="device-card">
      {/* Conteúdo do card */}
    </div>
  );
});

// Debounce para inputs de busca
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};
```

### 2. Tratamento de Erros
```javascript
// Hook para tratamento global de erros
const useErrorHandler = () => {
  const [errors, setErrors] = useState([]);
  
  const addError = (error) => {
    const errorObj = {
      id: Date.now(),
      message: error.message,
      timestamp: new Date().toISOString()
    };
    setErrors(prev => [...prev, errorObj]);
  };
  
  const removeError = (id) => {
    setErrors(prev => prev.filter(err => err.id !== id));
  };
  
  return { errors, addError, removeError };
};
```

## 📊 Monitoramento e Analytics

### 1. Métricas de Uso
```javascript
// Analytics para PWA
const trackEvent = (event, properties) => {
  // Implementar analytics (Google Analytics, Mixpanel, etc.)
  console.log('Track:', event, properties);
};

// Exemplos de uso
trackEvent('network_scan_started');
trackEvent('device_handshake_success', { deviceType: 'router' });
trackEvent('report_generated', { format: 'txt' });
```

### 2. Health Checks
```javascript
// Monitoramento de saúde da aplicação
const useHealthCheck = () => {
  const [health, setHealth] = useState({
    api: 'unknown',
    network: 'unknown',
    storage: 'unknown'
  });
  
  useEffect(() => {
    const checkHealth = async () => {
      try {
        // Check API
        const apiHealth = await fetch('/api/health').then(r => r.ok);
        
        // Check Network
        const networkHealth = navigator.onLine;
        
        // Check Storage
        const storageHealth = 'localStorage' in window;
        
        setHealth({
          api: apiHealth ? 'healthy' : 'unhealthy',
          network: networkHealth ? 'healthy' : 'unhealthy',
          storage: storageHealth ? 'healthy' : 'unhealthy'
        });
      } catch (error) {
        console.error('Health check failed:', error);
      }
    };
    
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check a cada 30s
    
    return () => clearInterval(interval);
  }, []);
  
  return health;
};
```

## 🚀 Deploy e Distribuição

### 1. Build Otimizado
```json
// package.json scripts
{
  "scripts": {
    "build": "vite build",
    "build:pwa": "vite build --mode pwa",
    "preview": "vite preview",
    "lighthouse": "lighthouse http://localhost:4173 --output=json"
  }
}
```

### 2. Configuração de Deploy
```yaml
# deploy.yml (GitHub Actions exemplo)
name: Deploy PWA
on:
  push:
    branches: [main]
    
jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build:pwa
      - run: npm run lighthouse
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 🔄 Próximos Passos

### Fase 1 - MVP (4 semanas)
- [ ] Interface base com Tailwind CSS
- [ ] Scanner básico de rede
- [ ] Lista de dispositivos
- [ ] Geração de relatórios TXT
- [ ] PWA básico (manifest + service worker)

### Fase 2 - Melhorias (6 semanas)
- [ ] Análise avançada de canais WiFi
- [ ] Mapa de calor de sinal
- [ ] Detecção de ameaças de segurança
- [ ] Handshake automático com dispositivos
- [ ] Histórico de conexões

### Fase 3 - Features Avançadas (8 semanas)
- [ ] Monitoramento em tempo real
- [ ] Dashboard de performance
- [ ] Alertas e notificações
- [ ] Exportação em múltiplos formatos
- [ ] Integração com APIs externas

## 📝 Conclusão

Esta implementação fornece uma base sólida para o ElectroNetScan como PWA, seguindo as melhores práticas de desenvolvimento moderno, design responsivo e experiência do usuário. O uso do Tailwind CSS permite flexibilidade total na implementação do Material Design Dark Theme, enquanto mantém performance otimizada para dispositivos móveis.

### Benefícios da Abordagem
✅ **Performance**: Bundle otimizado e carregamento rápido  
✅ **Responsividade**: Layout adaptável mobile-first  
✅ **Acessibilidade**: Componentes semânticos e navegação clara  
✅ **Manutenibilidade**: Código modular e bem estruturado  
✅ **Escalabilidade**: Arquitetura preparada para crescimento  

### Métricas de Sucesso
- Lighthouse Score > 90 (Performance, Accessibility, SEO)
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- PWA installability 100%



# Melhorias para PWA
Para tornar sua aplicação uma PWA completa, adicione:


// manifest.json
{
  "name": "ElectroNetScan - WiFi Network Scanner",
  "short_name": "ElectroNetScan",
  "description": "Ferramenta avançada para escaneamento e análise de redes WiFi",
  "version": "1.0.0",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#1f2937",
  "background_color": "#111827",
  "scope": "/",
  "lang": "pt-BR",
  "categories": ["utilities", "productivity"],
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "shortcuts": [
    {
      "name": "Scan Rápido",
      "short_name": "Scan",
      "description": "Iniciar escaneamento da rede",
      "url": "/scan",
      "icons": [
        {
          "src": "/icons/scan-icon.png",
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "Relatório",
      "short_name": "Report",
      "description": "Gerar relatório da rede",
      "url": "/report",
      "icons": [
        {
          "src": "/icons/report-icon.png",
          "sizes": "96x96"
        }
      ]
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/mobile1.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Dashboard principal mobile"
    },
    {
      "src": "/screenshots/desktop1.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Dashboard principal desktop"
    }
  ]
}

// service-worker.js
const CACHE_NAME = 'electronet-v1.0.0';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Adicionar ao index.html
/*
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#1f2937">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="ElectroNetScan">
<link rel="apple-touch-icon" href="/icons/icon-192x192.png">
*/


 



 Analisando seu documento e requisitos, vou criar uma interface moderna e responsiva para o ElectroNetScan. Baseando-me no Material Design Dark Theme, recomendo usar Tailwind CSS ao invés do Material UI pelos seguintes motivos:
Tailwind CSS é melhor para seu caso porque:

✅ Melhor performance para PWAs
✅ Bundle size menor
✅ Flexibilidade total para responsividade mobile-first
✅ Fácil implementação dos princípios do Material Design
✅ Melhor controle sobre animações e transições

Vou criar uma solução completa seguindo o Material Dark Theme:


import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  Router, 
  Smartphone, 
  Monitor, 
  Search, 
  Download, 
  History, 
  Settings,
  Shield,
  Signal,
  MapPin,
  Clock,
  FileText,
  Activity,
  Zap,
  Lock,
  Unlock,
  RefreshCw,
  Menu,
  X,
  ChevronRight,
  Home,
  Users,
  BarChart3
} from 'lucide-react';

const ElectroNetScan = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isScanning, setIsScanning] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showHandshakeModal, setShowHandshakeModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Mock data baseado na documentação
  const [networkData, setNetworkData] = useState({
    localIP: '192.168.1.105',
    gateway: '192.168.1.1',
    interface: 'wlan0',
    ssid: 'MyNetwork_5G',
    devices: [
      {
        id: 1,
        ip: '192.168.1.1',
        mac: '00:1B:2F:AA:BB:CC',
        hostname: 'Router_TP-Link',
        type: 'router',
        manufacturer: 'TP-Link',
        status: 'online',
        signal: -35,
        security: 'WPA2',
        isRouter: true
      },
      {
        id: 2,
        ip: '192.168.1.15',
        mac: '00:1A:2B:CC:DD:EE',
        hostname: 'iPhone-John',
        type: 'smartphone',
        manufacturer: 'Apple',
        status: 'online',
        signal: -45,
        security: 'WPA2'
      },
      {
        id: 3,
        ip: '192.168.1.23',
        mac: '00:2A:3B:FF:GG:HH',
        hostname: 'DESKTOP-WORK',
        type: 'computer',
        manufacturer: 'Dell',
        status: 'online',
        signal: -52,
        security: 'WPA2'
      },
      {
        id: 4,
        ip: '192.168.1.45',
        mac: '00:3A:4B:II:JJ:KK',
        hostname: 'Smart-TV-Samsung',
        type: 'smart_tv',
        manufacturer: 'Samsung',
        status: 'offline',
        signal: -67,
        security: 'WPA2'
      }
    ]
  });

  const [connectionHistory, setConnectionHistory] = useState([
    {
      id: 1,
      device: 'Router_TP-Link',
      ip: '192.168.1.1',
      timestamp: '2025-01-28 14:30:25',
      success: true,
      method: 'HTTP'
    },
    {
      id: 2,
      device: 'DESKTOP-WORK',
      ip: '192.168.1.23',
      timestamp: '2025-01-28 14:25:10',
      success: false,
      method: 'SSH'
    }
  ]);

  const getDeviceIcon = (type) => {
    switch(type) {
      case 'router': return Router;
      case 'smartphone': return Smartphone;
      case 'computer': return Monitor;
      case 'smart_tv': return Monitor;
      default: return Wifi;
    }
  };

  const getSignalStrength = (signal) => {
    if (signal >= -30) return { strength: 'Excelente', color: 'text-green-400', bars: 4 };
    if (signal >= -50) return { strength: 'Bom', color: 'text-blue-400', bars: 3 };
    if (signal >= -70) return { strength: 'Regular', color: 'text-yellow-400', bars: 2 };
    return { strength: 'Fraco', color: 'text-red-400', bars: 1 };
  };

  const startScan = () => {
    setIsScanning(true);
    // Simula escaneamento
    setTimeout(() => {
      setIsScanning(false);
    }, 3000);
  };

  const handleHandshake = (device) => {
    setSelectedDevice(device);
    setShowHandshakeModal(true);
  };

  const generateReport = () => {
    const reportData = {
      timestamp: new Date().toLocaleString(),
      network: networkData,
      deviceCount: networkData.devices.length,
      onlineDevices: networkData.devices.filter(d => d.status === 'online').length
    };
    
    const reportText = `
ELECTRONET SCAN REPORT
======================
Gerado em: ${reportData.timestamp}

INFORMAÇÕES DA REDE
-------------------
IP Local: ${networkData.localIP}
Gateway: ${networkData.gateway}
Interface: ${networkData.interface}
SSID: ${networkData.ssid}

RESUMO
------
Total de Dispositivos: ${reportData.deviceCount}
Dispositivos Online: ${reportData.onlineDevices}
Dispositivos Offline: ${reportData.deviceCount - reportData.onlineDevices}

DISPOSITIVOS ENCONTRADOS
------------------------
${networkData.devices.map(device => `
IP: ${device.ip}
MAC: ${device.mac}
Hostname: ${device.hostname}
Tipo: ${device.type}
Fabricante: ${device.manufacturer}
Status: ${device.status}
Sinal: ${device.signal}dBm
Segurança: ${device.security}
---
`).join('')}
    `;

    // Criar e baixar arquivo
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ElectroNetScan_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setShowReportModal(false);
  };

  const Sidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between h-16 px-6 bg-gray-800 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-6 h-6 text-blue-400" />
          ElectroNetScan
        </h1>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <nav className="mt-8">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'devices', label: 'Dispositivos', icon: Users },
          { id: 'analysis', label: 'Análise', icon: BarChart3 },
          { id: 'history', label: 'Histórico', icon: History },
          { id: 'settings', label: 'Configurações', icon: Settings }
        ].map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white border-r-2 border-blue-400'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );

  const NetworkInfo = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-lg">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-400">IP Local</p>
            <p className="text-lg font-semibold text-white">{networkData.localIP}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-600 rounded-lg">
            <Router className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Gateway</p>
            <p className="text-lg font-semibold text-white">{networkData.gateway}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600 rounded-lg">
            <Wifi className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-400">SSID</p>
            <p className="text-lg font-semibold text-white">{networkData.ssid}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-600 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Interface</p>
            <p className="text-lg font-semibold text-white">{networkData.interface}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const DeviceCard = ({ device }) => {
    const DeviceIcon = getDeviceIcon(device.type);
    const signalInfo = getSignalStrength(device.signal);
    
    return (
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${device.status === 'online' ? 'bg-green-600' : 'bg-gray-600'}`}>
              <DeviceIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{device.hostname}</h3>
              <p className="text-sm text-gray-400">{device.ip}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            device.status === 'online' ? 'bg-green-900 text-green-300' : 'bg-gray-900 text-gray-400'
          }`}>
            {device.status}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-400">MAC Address</p>
            <p className="text-sm font-mono text-gray-300">{device.mac}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Fabricante</p>
            <p className="text-sm text-gray-300">{device.manufacturer}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Sinal</p>
            <p className={`text-sm font-semibold ${signalInfo.color}`}>
              {device.signal}dBm ({signalInfo.strength})
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Segurança</p>
            <p className="text-sm text-gray-300 flex items-center gap-1">
              {device.security === 'WPA2' ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              {device.security}
            </p>
          </div>
        </div>
        
        {device.isRouter && (
          <button
            onClick={() => handleHandshake(device)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Iniciar Handshake
          </button>
        )}
      </div>
    );
  };

  const DashboardContent = () => (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Dashboard</h2>
          <p className="text-gray-400">Visão geral da sua rede WiFi</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={startScan}
            disabled={isScanning}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Escaneando...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Iniciar Scan
              </>
            )}
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Download className="w-5 h-5" />
            Relatório
          </button>
        </div>
      </div>

      <NetworkInfo />

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Dispositivos Encontrados</h3>
          <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">
            {networkData.devices.length} dispositivos
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {networkData.devices.map(device => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      </div>
    </div>
  );

  const HandshakeModal = () => {
    if (!showHandshakeModal || !selectedDevice) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Handshake</h3>
            <button
              onClick={() => setShowHandshakeModal(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Router className="w-8 h-8 text-blue-400" />
              <div>
                <p className="font-semibold text-white">{selectedDevice.hostname}</p>
                <p className="text-sm text-gray-400">{selectedDevice.ip}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-gray-700 p-3 rounded-lg">
                <p className="text-sm text-gray-400">Status da Conexão</p>
                <p className="text-green-400 font-medium">Porta 80 (HTTP) - Aberta</p>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <p className="text-sm text-gray-400">Credenciais Sugeridas</p>
                <p className="text-gray-300">admin / admin</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
              Acessar Interface Web
            </button>
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors">
              Tentar Conexão Automática
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ReportModal = () => {
    if (!showReportModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Gerar Relatório</h3>
            <button
              onClick={() => setShowReportModal(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="mb-6">
            <div className="bg-gray-700 p-4 rounded-lg mb-4">
              <FileText className="w-8 h-8 text-blue-400 mb-2" />
              <p className="text-white font-medium">Relatório de Escaneamento</p>
              <p className="text-sm text-gray-400 mt-1">
                Inclui informações da rede, dispositivos encontrados e dados técnicos.
              </p>
            </div>
            
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Total de Dispositivos:</span>
                <span className="font-medium">{networkData.devices.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Dispositivos Online:</span>
                <span className="font-medium text-green-400">
                  {networkData.devices.filter(d => d.status === 'online').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Data/Hora:</span>
                <span className="font-medium">{new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={generateReport}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Baixar Relatório (.txt)
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Sidebar />
      
      {/* Mobile Header */}
      <div className="lg:hidden bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" />
            ElectroNetScan
          </h1>
          <div className="w-6" />
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 p-4 lg:p-8">
        <DashboardContent />
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <HandshakeModal />
      <ReportModal />
    </div>
  );
};

export default ElectroNetScan;