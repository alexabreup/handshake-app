import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';

// Configuração da API baseada no ambiente
const API_BASE_URL = process.env.REACT_APP_API_URL || '';
const API_ENDPOINTS = {
  SCAN: `${API_BASE_URL}/api/scan`,
  HANDSHAKE: `${API_BASE_URL}/api/handshake`,
  AUTO_CONNECT: `${API_BASE_URL}/api/auto-connect`,
  HANDSHAKE_HISTORY: `${API_BASE_URL}/api/handshake-history`,
  SAVE_REPORT: `${API_BASE_URL}/api/save-report`,
  DOWNLOAD: `${API_BASE_URL}/api/download`,
  SHUTDOWN: `${API_BASE_URL}/api/shutdown`,
  RESTART: `${API_BASE_URL}/api/restart`,
  STATUS: `${API_BASE_URL}/api/status`
};

// Componente HandshakeModal
const HandshakeModal = ({ device, onClose }) => {
  const [handshakeResult, setHandshakeResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [autoConnectLoading, setAutoConnectLoading] = useState(false);
  const [autoConnectResult, setAutoConnectResult] = useState(null);

  const executeHandshake = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Executando handshake para dispositivo:', device);
      
      const response = await axios.post(API_ENDPOINTS.HANDSHAKE, {
        ip: device.ip,
        deviceType: device.device_type || device.type || 'unknown'
      });
      
      console.log('Resposta do handshake:', response.data);
      
      if (response.data.success) {
        setHandshakeResult(response.data.data);
      } else {
        setError(response.data.message || 'Erro no handshake');
      }
    } catch (err) {
      console.error('Erro no handshake:', err);
      setError('Erro ao executar handshake: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const executeAutoConnect = async () => {
    if (autoConnectLoading || !username || !password) return;
    
    setAutoConnectLoading(true);
    setAutoConnectResult(null);
    
    try {
      const response = await axios.post(API_ENDPOINTS.AUTO_CONNECT, {
        ip: device.ip,
        deviceType: device.device_type || device.type || 'unknown',
        username: username,
        password: password
      });
      
      if (response.data.success) {
        setAutoConnectResult(response.data.data);
      } else {
        setAutoConnectResult({ error: response.data.message || 'Falha na conexão automática' });
      }
    } catch (err) {
      console.error('Erro na conexão automática:', err);
      setAutoConnectResult({ error: 'Erro na conexão: ' + (err.response?.data?.message || err.message) });
    } finally {
      setAutoConnectLoading(false);
    }
  };

  useEffect(() => {
    if (device) {
      executeHandshake();
    }
  }, [device]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!device) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">
              Handshake: {device.hostname || device.ip}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-300">Executando handshake...</span>
            </div>
          )}
          
          {error && (
            <div className="bg-red-900 text-red-100 p-4 rounded mb-4 flex items-center">
              <div className="text-2xl mr-3">❌</div>
              <div>
                <div className="font-semibold text-lg">Handshake Falhou</div>
                <div className="text-red-200">{error}</div>
              </div>
            </div>
          )}
          
          {handshakeResult && (
            <>
              {/* Status de Sucesso */}
              <div className="bg-green-900 text-green-100 p-4 rounded mb-4 flex items-center">
                <div className="text-2xl mr-3">✅</div>
                <div>
                  <div className="font-semibold text-lg">Handshake Bem-Sucedido!</div>
                  <div className="text-green-200">
                    Conexão estabelecida com {device.hostname || device.ip}
                    {handshakeResult.device?.access?.method && (
                      <span> • Acesso via {handshakeResult.device.access.method.toUpperCase()}</span>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
          
          {handshakeResult && (
            <div className="space-y-4">
              <div className="bg-gray-700 p-4 rounded">
                <h3 className="text-lg font-semibold text-white mb-2">Informações do Dispositivo</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">IP:</span>
                    <span className="text-white ml-2">{handshakeResult.device?.ip || device.ip}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Tipo:</span>
                    <span className="text-white ml-2">{handshakeResult.device?.type || device.device_type || device.type || 'Desconhecido'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">MAC:</span>
                    <span className="text-white ml-2">{device.mac}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Fabricante:</span>
                    <span className="text-white ml-2">{device.vendor || 'Desconhecido'}</span>
                  </div>
                </div>
              </div>

              {/* Portas Detectadas */}
              {handshakeResult.device?.ports && (
                <div className="bg-gray-700 p-4 rounded">
                  <h3 className="text-lg font-semibold text-white mb-2">Portas Detectadas</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <span className="text-gray-400">HTTP (80):</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        handshakeResult.device.ports.http 
                          ? 'bg-green-600 text-green-100' 
                          : 'bg-red-600 text-red-100'
                      }`}>
                        {handshakeResult.device.ports.http ? 'Aberta ✅' : 'Fechada ❌'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-400">HTTPS (443):</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        handshakeResult.device.ports.https 
                          ? 'bg-green-600 text-green-100' 
                          : 'bg-red-600 text-red-100'
                      }`}>
                        {handshakeResult.device.ports.https ? 'Aberta ✅' : 'Fechada ❌'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-400">SSH (22):</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        handshakeResult.device.ports.ssh 
                          ? 'bg-green-600 text-green-100' 
                          : 'bg-red-600 text-red-100'
                      }`}>
                        {handshakeResult.device.ports.ssh ? 'Aberta ✅' : 'Fechada ❌'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-400">Telnet (23):</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        handshakeResult.device.ports.telnet 
                          ? 'bg-green-600 text-green-100' 
                          : 'bg-red-600 text-red-100'
                      }`}>
                        {handshakeResult.device.ports.telnet ? 'Aberta ✅' : 'Fechada ❌'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Acesso Recomendado */}
              {handshakeResult.device?.access && (
                <div className="bg-blue-900 p-4 rounded border border-blue-700">
                  <h3 className="text-lg font-semibold text-white mb-2">💡 Acesso Recomendado</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-blue-200">Método:</span>
                      <span className="text-white ml-2 font-medium">{handshakeResult.device.access.method?.toUpperCase()}</span>
                    </div>
                    {handshakeResult.device.access.url && (
                      <div>
                        <span className="text-blue-200">URL:</span>
                        <a 
                          href={handshakeResult.device.access.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-300 hover:text-blue-100 underline ml-2"
                        >
                          {handshakeResult.device.access.url}
                        </a>
                      </div>
                    )}
                    {handshakeResult.device.access.default_credentials && (
                      <div>
                        <span className="text-blue-200">Credenciais padrão:</span>
                        <span className="text-yellow-300 ml-2 font-mono text-xs bg-gray-800 px-2 py-1 rounded">
                          {handshakeResult.device.access.default_credentials}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="bg-gray-700 p-4 rounded">
                <h3 className="text-lg font-semibold text-white mb-3">Conexão Automática</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Usuário"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="password"
                      placeholder="Senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={executeAutoConnect}
                    disabled={autoConnectLoading || !username || !password}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white py-2 px-4 rounded font-medium transition-colors"
                  >
                    {autoConnectLoading ? 'Conectando...' : 'Tentar Conexão Automática'}
                  </button>
                </div>
                
                {autoConnectResult && (
                  <div className={`mt-3 p-3 rounded ${
                    autoConnectResult.error 
                      ? 'bg-red-900 text-red-100' 
                      : 'bg-green-900 text-green-100'
                  }`}>
                    {autoConnectResult.error || autoConnectResult.message || 'Conexão realizada com sucesso!'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente principal App
function App() {
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [shutdownLoading, setShutdownLoading] = useState(false);
  const [restartLoading, setRestartLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('online');
  
  // Refs para controlar chamadas API
  const isScanningRef = useRef(false);
  const isSavingReportRef = useRef(false);
  const abortControllerRef = useRef(null);

  // Função executeScan
  const executeScan = useCallback(async () => {
    if (isScanningRef.current) {
      console.log('Já existe um scan em andamento, ignorando chamada duplicada');
      return;
    }
    
    console.log('Iniciando scan de rede...');
    setLoading(true);
    setError(null);
    isScanningRef.current = true;

    try {
      console.log('Enviando requisição para:', API_ENDPOINTS.SCAN);
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      const timeoutId = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      }, 30000);
      
      const response = await axios.post(API_ENDPOINTS.SCAN, {}, {
        signal: abortControllerRef.current.signal,
        timeout: 30000
      });

      clearTimeout(timeoutId);
      
      console.log('Resposta recebida:', response);
      
      if (response.data) {
        if (response.data.success && response.data.data) {
          console.log('Dados válidos recebidos, atualizando estado...');
          console.log('Devices found:', response.data.data.devices?.length || 0);
          setNetworkData(response.data.data);
        } else if (response.data.network_info && response.data.devices) {
          console.log('Formato alternativo de dados detectado, atualizando estado...');
          setNetworkData(response.data);
        } else {
          console.error('Estrutura de resposta inválida:', response.data);
          setError('Estrutura de resposta inválida do servidor');
        }
      } else {
        console.error('Resposta vazia ou inválida');
        setError('Resposta vazia ou inválida do servidor');
      }
    } catch (err) {
      console.error('Erro na requisição:', err);
      if (err.name === 'AbortError') {
        setError('Tempo limite da requisição excedido. Verifique se o servidor está online.');
      } else {
        setError('Erro ao conectar com o servidor: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setLoading(false);
      isScanningRef.current = false;
      abortControllerRef.current = null;
      console.log('Scan finalizado');
    }
  }, []);

  // Função para desligar os servidores
  const handleShutdown = useCallback(async () => {
    if (!window.confirm('Deseja realmente desligar o frontend e backend?')) {
      return;
    }
    
    setShutdownLoading(true);
    
    try {
      await axios.post(API_ENDPOINTS.SHUTDOWN);
      
      // Show success message and close frontend after a delay
      alert('Servidores sendo desligados...');
      
      // Close current window/tab
      setTimeout(() => {
        window.close();
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao desligar servidores:', error);
      alert('Erro ao desligar servidores: ' + (error.response?.data?.error || error.message));
    } finally {
      setShutdownLoading(false);
    }
  }, []);

  // Função para reiniciar os servidores
  const handleRestart = useCallback(async () => {
    if (!window.confirm('Deseja reiniciar o frontend e backend?')) {
      return;
    }
    
    setRestartLoading(true);
    
    try {
      await axios.post(API_ENDPOINTS.RESTART);
      
      // Show success message
      alert('Servidores sendo reiniciados... A página será recarregada automaticamente.');
      
      // Wait a bit then reload page
      setTimeout(() => {
        window.location.reload();
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao reiniciar servidores:', error);
      alert('Erro ao reiniciar servidores: ' + (error.response?.data?.error || error.message));
      setRestartLoading(false);
    }
  }, []);

  // useEffect simples apenas para limpeza
  useEffect(() => {
    console.log('App montado');
    
    return () => {
      console.log('App desmontado');
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Função para salvar relatório
  const handleSaveReport = async () => {
    if (!networkData || isSavingReportRef.current) return;
    
    isSavingReportRef.current = true;
    setSaveStatus('saving');
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `network-scan-${timestamp}.txt`;
      
      const reportData = {
        timestamp: new Date().toISOString(),
        network_info: networkData.network_info,
        devices: networkData.devices,
        summary: networkData.summary
      };
      
      const response = await axios.post(API_ENDPOINTS.SAVE_REPORT, {
        data: reportData,
        filename: filename
      });
      
      if (response.data.success) {
        setSaveStatus('success');
        // Download automático do arquivo
        const downloadUrl = `${API_ENDPOINTS.DOWNLOAD}/${filename}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      console.error('Erro ao salvar relatório:', err);
      setSaveStatus('error');
    } finally {
      isSavingReportRef.current = false;
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center mb-2">
          <h1 className="text-3xl font-bold text-blue-400">
            🔍 ElectroNetScan
          </h1>
          <div className={`ml-4 px-3 py-1 rounded-full text-sm font-medium flex items-center ${
            serverStatus === 'online' 
              ? 'bg-green-900 text-green-100' 
              : 'bg-red-900 text-red-100'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              serverStatus === 'online' ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            {serverStatus === 'online' ? '🟢 Online' : '🔴 Offline'}
          </div>
        </div>
        <p className="text-gray-400">
          Escaneie sua rede local para descobrir dispositivos conectados
        </p>
      </header>

      <div className="flex flex-wrap gap-3 justify-center mb-6">
        <button 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center" 
          onClick={executeScan} 
          disabled={loading || isScanningRef.current}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-t-2 border-blue-200 border-solid rounded-full animate-spin mr-2"></div>
              Escaneando...
            </>
          ) : (
            <>🔍 Escanear Rede</>
          )}
        </button>

        <button 
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed" 
          onClick={handleSaveReport} 
          disabled={!networkData || saveStatus === 'saving'}
        >
          {saveStatus === 'saving' ? '💾 Salvando...' : '💾 Salvar Relatório'}
        </button>

        <button 
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          onClick={() => setShowHistory(true)}
        >
          📃 Histórico de Conexões
        </button>

        <button 
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          onClick={handleRestart}
          disabled={restartLoading}
        >
          {restartLoading ? (
            <>
              <div className="w-5 h-5 border-t-2 border-orange-200 border-solid rounded-full animate-spin mr-2"></div>
              Reiniciando...
            </>
          ) : (
            <>🔄 Reiniciar Servidores</>
          )}
        </button>

        <button 
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          onClick={handleShutdown}
          disabled={shutdownLoading}
        >
          {shutdownLoading ? (
            <>
              <div className="w-5 h-5 border-t-2 border-red-200 border-solid rounded-full animate-spin mr-2"></div>
              Desligando...
            </>
          ) : (
            <>🛑 Desligar Servidores</>
          )}
        </button>
      </div>

      {saveStatus && (
        <div className={`mb-4 p-3 rounded text-center ${
          saveStatus === 'success' ? 'bg-green-900 text-green-100' : 
          saveStatus === 'error' ? 'bg-red-900 text-red-100' : 
          'bg-blue-900 text-blue-100'
        }`}>
          {saveStatus === 'saving' && 'Salvando relatório...'}
          {saveStatus === 'success' && 'Relatório salvo e baixado com sucesso!'}
          {saveStatus === 'error' && 'Erro ao salvar relatório. Tente novamente.'}
        </div>
      )}

      <div className="space-y-6 max-w-7xl mx-auto">
        {error && (
          <div className="bg-red-900 text-red-100 p-4 rounded-lg">
            <p className="font-semibold">Erro:</p>
            <p>{error}</p>
          </div>
        )}

        {!networkData && !loading && !error && (
          <div className="bg-gray-800 rounded-lg p-6 text-center shadow-lg">
            <p className="text-gray-300 mb-2">Nenhum dispositivo encontrado na rede.</p>
            <p className="text-gray-400 text-sm">Tente escanear novamente ou verifique sua conexão.</p>
            <p className="text-xs text-gray-500 mt-2">Debug: networkData={JSON.stringify(!!networkData)}, loading={JSON.stringify(loading)}, error={JSON.stringify(!!error)}</p>
          </div>
        )}

        {networkData && (
          <>
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold text-blue-400 mb-4">ℹ️ Informações da Rede</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">IP Local</p>
                  <p className="text-white font-mono">{networkData.network_info?.local_ip || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Gateway</p>
                  <p className="text-white font-mono">{networkData.network_info?.gateway || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Interface</p>
                  <p className="text-white font-mono">{networkData.network_info?.interface || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Faixa de IP</p>
                  <p className="text-white font-mono">{networkData.network_info?.range || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold text-green-400 mb-4">📱 Dispositivos Encontrados</h2>
              <div className="mb-4 flex flex-wrap gap-4 text-sm">
                <div className="bg-blue-900 px-3 py-1 rounded">
                  <span className="text-blue-200">Total: {networkData.devices?.length || 0}</span>
                </div>
                <div className="bg-green-900 px-3 py-1 rounded">
                  <span className="text-green-200">
                    Online: {networkData.devices?.filter(d => d.status !== 'offline').length || 0}
                  </span>
                </div>
                <div className="bg-purple-900 px-3 py-1 rounded">
                  <span className="text-purple-200">
                    Roteadores: {networkData.devices?.filter(d => d.is_router).length || 0}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {networkData.devices?.map((device, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-lg">{device.hostname}</h3>
                        <p className="text-blue-300 font-mono text-sm">{device.ip}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        device.is_local 
                          ? 'bg-purple-900 text-purple-200' 
                          : device.is_router 
                            ? 'bg-orange-900 text-orange-200' 
                            : 'bg-gray-900 text-gray-300'
                      }`}>
                        {device.is_local ? 'SEU PC' : device.is_router ? 'ROTEADOR' : 'DISPOSITIVO'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">MAC:</span>
                        <span className="text-gray-200 ml-2 font-mono">{device.mac}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Tipo:</span>
                        <span className="text-gray-200 ml-2">{device.device_type}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Fabricante:</span>
                        <span className="text-gray-200 ml-2">{device.vendor}</span>
                      </div>
                    </div>
                    
                    {(device.is_router || device.device_type?.toLowerCase().includes('router')) && (
                      <button
                        onClick={() => setSelectedDevice(device)}
                        className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                      >
                        🤝 Fazer Handshake
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>© 2025 ElectroNetScan</p>
      </footer>

      {selectedDevice && (
        <HandshakeModal 
          device={selectedDevice}
          onClose={() => setSelectedDevice(null)}
        />
      )}
    </div>
  );
}

export default App;