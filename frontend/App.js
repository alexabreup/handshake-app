import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const DeviceIcon = ({ type }) => {
  const icons = {
    'Router/Gateway': '🌐',
    'Smartphone': '📱',
    'Dispositivo Apple': '🍎',
    'Computador': '💻',
    'Smart TV': '📺',
    'Impressora': '🖨️',
    'Câmera': '📷',
    'Dispositivo IoT': '🔧',
    'HLK-RM04': '📡',
    'Raspberry Pi': '🍓',
    'Dispositivo de Rede': '❓'
  };
  
  return <span className="device-icon">{icons[type] || '❓'}</span>;
};

const NetworkInfo = ({ networkInfo }) => {
  if (!networkInfo) return null;

  return (
    <div className="network-info">
      <h3>🌐 Informações da Rede</h3>
      <div className="info-grid">
        <div className="info-item">
          <label>IP Local:</label>
          <span>{networkInfo.local_ip}</span>
        </div>
        <div className="info-item">
          <label>Interface:</label>
          <span>{networkInfo.interface}</span>
        </div>
        <div className="info-item">
          <label>Gateway:</label>
          <span>{networkInfo.gateway}</span>
        </div>
        <div className="info-item">
          <label>Range:</label>
          <span>{networkInfo.range}</span>
        </div>
      </div>
    </div>
  );
};

const DeviceTable = ({ devices, loading }) => {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Escaneando rede... Aguarde alguns minutos.</p>
      </div>
    );
  }

  if (!devices || devices.length === 0) {
    return (
      <div className="no-devices">
        <p>Nenhum dispositivo encontrado. Execute um scan para descobrir dispositivos.</p>
      </div>
    );
  }

  return (
    <div className="devices-table">
      <h3>📋 Dispositivos Encontrados ({devices.length})</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>IP Address</th>
              <th>MAC Address</th>
              <th>Hostname</th>
              <th>Fabricante</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device, index) => (
              <tr key={index} className={
                device.is_local ? 'local-device' : 
                device.is_hlk ? 'hlk-device' : ''
              }>
                <td>
                  <DeviceIcon type={device.device_type} />
                  {device.device_type}
                </td>
                <td className="ip-address">{device.ip}</td>
                <td className="mac-address">{device.mac}</td>
                <td className="hostname">{device.hostname}</td>
                <td>{device.vendor}</td>
                <td>
                  <div className="status-badges">
                    {device.is_local && <span className="badge local">Local</span>}
                    {device.is_hlk && <span className="badge hlk">HLK-RM04</span>}
                    <span className="badge online">Online</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function App() {
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  const executeScan = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/scan');
      if (response.data.success) {
        setNetworkData(response.data.data);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const saveReport = async () => {
    if (!networkData) return;

    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const filename = `network-scan-${timestamp}.txt`;

      const response = await axios.post('/api/save-report', {
        data: networkData,
        filename: filename
      });

      if (response.data.success) {
        setSaveStatus({
          type: 'success',
          message: 'Relatório salvo com sucesso!',
          filename: response.data.filename
        });
      } else {
        setSaveStatus({
          type: 'error',
          message: 'Erro ao salvar relatório'
        });
      }
    } catch (err) {
      setSaveStatus({
        type: 'error',
        message: 'Erro ao conectar com o servidor'
      });
    }
  };

  const downloadReport = async () => {
    if (!saveStatus || !saveStatus.filename) return;
    
    window.open(`/api/download/${saveStatus.filename}`, '_blank');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🔍 Network Scanner</h1>
        <p>Escaneie sua rede local para descobrir dispositivos conectados</p>
      </header>

      <div className="actions">
        <button 
          className="scan-button" 
          onClick={executeScan} 
          disabled={loading}
        >
          {loading ? 'Escaneando...' : '🔍 Escanear Rede'}
        </button>

        <button 
          className="save-button" 
          onClick={saveReport} 
          disabled={!networkData || loading}
        >
          💾 Salvar Relatório
        </button>

        {saveStatus && saveStatus.type === 'success' && (
          <button 
            className="download-button" 
            onClick={downloadReport}
          >
            📥 Baixar Relatório
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {saveStatus && (
        <div className={`save-status ${saveStatus.type}`}>
          {saveStatus.type === 'success' ? '✅' : '❌'} {saveStatus.message}
        </div>
      )}

      <div className="content">
        {networkData && <NetworkInfo networkInfo={networkData.network_info} />}
        <DeviceTable devices={networkData?.devices || []} loading={loading} />
      </div>

      <footer>
        <p>© 2025 Network Scanner App</p>
      </footer>
    </div>
  );
}

export default App;
