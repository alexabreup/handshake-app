const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function executeNetworkScan() {
    return new Promise((resolve, reject) => {
        try {
            // Get local IP address and network information
            exec('ip route get 8.8.8.8 2>/dev/null | awk \'NR==1 {print $7}\' || hostname -I | awk \'NR==1 {print $1}\'', (err, localIp) => {
                if (err) {
                    reject({ error: 'Erro ao obter IP local', details: err.message });
                    return;
                }
                
                localIp = localIp.trim();
                
                // Get interface name
                exec('ip route get 8.8.8.8 2>/dev/null | awk \'NR==1 {print $5}\' || echo "eth0"', (err, iface) => {
                    const interface = iface ? iface.trim() : 'unknown';
                    
                    // Get gateway
                    exec('ip route | grep default | awk \'NR==1 {print $3}\' || echo "unknown"', (err, gw) => {
                        const gateway = gw ? gw.trim() : 'unknown';
                        
                        // Calculate network range
                        const ipParts = localIp.split('.');
                        const networkRange = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.0/24`;
                        
                        // Get local MAC address
                        exec(`ip link show $(ip route get 8.8.8.8 | awk 'NR==1 {print $5}') | awk '/link\/ether/ {print $2}'`, (err, localMac) => {
                            const localMacAddress = err ? 'local-device' : localMac.trim();
                            
                            // Get gateway MAC address from ARP table
                            exec(`arp -n ${gateway} | awk 'NR==2 {print $3}'`, (err, gatewayMac) => {
                                const gatewayMacAddress = err || !gatewayMac.trim() ? 'gateway-device' : gatewayMac.trim();
                                
                                // Create a simulated network scan with at least the local machine
                                const devices = [
                                    {
                                        ip: localIp,
                                        mac: localMacAddress,
                                        hostname: 'SEU COMPUTADOR',
                                        device_type: 'Computador',
                                        vendor: 'Local',
                                        is_hlk: false,
                                        is_router: false,
                                        scan_time: new Date().toISOString(),
                                        is_local: true
                                    }
                                ];
                                
                                // Add gateway as a device if it's not the same as local IP
                                if (gateway && gateway !== 'unknown' && gateway !== localIp) {
                                    devices.push({
                                        ip: gateway,
                                        mac: gatewayMacAddress,
                                        hostname: 'Gateway',
                                        device_type: 'Router/Gateway',
                                        vendor: 'Router',
                                        is_hlk: false,
                                        is_router: true,
                                        scan_time: new Date().toISOString(),
                                        is_local: false
                                    });
                                }
                                
                                // Try to find other devices using arp
                                exec('arp -a | grep -v incomplete', (err, arpOutput) => {
                                    if (!err && arpOutput) {
                                        const arpLines = arpOutput.split('\n');
                                        arpLines.forEach(line => {
                                            const match = line.match(/\(([0-9.]+)\) at ([0-9a-f:]+)/i);
                                            if (match && match[1] && match[1] !== localIp && match[1] !== gateway) {
                                                const ip = match[1];
                                                const mac = match[2];
                                                
                                                // Determine if it's a router based on common router MAC prefixes
                                                const isRouter = /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/i.test(mac) && 
                                                    (mac.toLowerCase().startsWith('00:14:a8') || // TP-Link
                                                     mac.toLowerCase().startsWith('00:05:5d') || // D-Link
                                                     mac.toLowerCase().startsWith('00:18:4d')); // Netgear
                                                
                                                devices.push({
                                                    ip: ip,
                                                    mac: mac,
                                                    hostname: 'Dispositivo ' + ip,
                                                    device_type: isRouter ? 'Router/Gateway' : 'Dispositivo de Rede',
                                                    vendor: isRouter ? 'Router' : 'Desconhecido',
                                                    is_hlk: false,
                                                    is_router: isRouter,
                                                    scan_time: new Date().toISOString(),
                                                    is_local: false
                                                });
                                            }
                                        });
                                    }
                                    
                                    // Create the final result object
                                    const result = {
                                        network_info: {
                                            local_ip: localIp,
                                            interface: interface,
                                            gateway: gateway,
                                            range: networkRange
                                        },
                                        devices: devices,
                                        summary: {
                                            total_devices: devices.length,
                                            scan_time: new Date().toISOString(),
                                            hlk_found: false,
                                            router_found: devices.some(d => d.is_router)
                                        }
                                    };
                                    
                                    resolve(result);
                                });
                            });
                        });
                    });
                });
            });
        } catch (error) {
            reject({ error: 'Erro ao executar scan', details: error.message });
        }
    });
}

app.post('/api/scan', async (req, res) => {
    try {
        const result = await executeNetworkScan();
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao executar scan', details: error });
    }
});

app.post('/api/handshake', async (req, res) => {
    const { ip, deviceType } = req.body;
    
    if (!ip) {
        return res.status(400).json({ success: false, error: 'IP não fornecido' });
    }
    
    // Store handshake attempts in memory
    if (!global.handshakeHistory) {
        global.handshakeHistory = [];
    }
    
    // Add to history
    const historyEntry = {
        ip,
        deviceType,
        timestamp: new Date().toISOString(),
        success: false
    };
    
    try {
        // Attempt handshake based on device type
        const handshakeScript = `
#!/bin/bash
IP="${ip}"
DEVICE_TYPE="${deviceType ? deviceType.replace(/"/g, '\\"') : 'unknown'}"

echo "Iniciando handshake com $IP ($DEVICE_TYPE)..." >&2

# Ping para verificar se o dispositivo está acessível
ping -c 3 -W 2 "$IP" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo '{"success": false, "message": "Dispositivo não está respondendo"}'
    exit 1
fi

# Tenta conexão HTTP para verificar se há interface web
TIMEOUT=5
HTTP_RESPONSE=$(curl -s -m $TIMEOUT -o /dev/null -w "%{http_code}" "http://$IP" 2>/dev/null || echo "failed")
HTTPS_RESPONSE=$(curl -s -m $TIMEOUT -o /dev/null -w "%{http_code}" -k "https://$IP" 2>/dev/null || echo "failed")

PORT_80_OPEN=false
PORT_443_OPEN=false

if [ "$HTTP_RESPONSE" != "failed" ]; then
    PORT_80_OPEN=true
fi

if [ "$HTTPS_RESPONSE" != "failed" ]; then
    PORT_443_OPEN=true
fi

# Verifica portas comuns de administração
TELNET_OPEN=false
SSH_OPEN=false

nc -z -w2 "$IP" 23 >/dev/null 2>&1 && TELNET_OPEN=true
nc -z -w2 "$IP" 22 >/dev/null 2>&1 && SSH_OPEN=true

# Determina o tipo de dispositivo e método de acesso recomendado
ACCESS_METHOD="unknown"
DEFAULT_CREDENTIALS="unknown"

case "$DEVICE_TYPE" in
    "HLK-RM04")
        ACCESS_METHOD="http"
        DEFAULT_CREDENTIALS="admin:admin"
        ;;
    "TP-Link")
        ACCESS_METHOD="http"
        DEFAULT_CREDENTIALS="admin:admin"
        ;;
    "D-Link")
        ACCESS_METHOD="http"
        DEFAULT_CREDENTIALS="admin:admin"
        ;;
    "Netgear")
        ACCESS_METHOD="http"
        DEFAULT_CREDENTIALS="admin:password"
        ;;
    "Linksys")
        ACCESS_METHOD="http"
        DEFAULT_CREDENTIALS="admin:admin"
        ;;
    "Huawei")
        ACCESS_METHOD="http"
        DEFAULT_CREDENTIALS="admin:admin"
        ;;
    "ZTE")
        ACCESS_METHOD="http"
        DEFAULT_CREDENTIALS="admin:admin"
        ;;
    "Arris")
        ACCESS_METHOD="http"
        DEFAULT_CREDENTIALS="admin:password"
        ;;
    "Motorola")
        ACCESS_METHOD="http"
        DEFAULT_CREDENTIALS="admin:motorola"
        ;;
    "Router/Gateway")
        if [ "$PORT_80_OPEN" = true ]; then
            ACCESS_METHOD="http"
            DEFAULT_CREDENTIALS="admin:admin ou admin:password"
        elif [ "$PORT_443_OPEN" = true ]; then
            ACCESS_METHOD="https"
            DEFAULT_CREDENTIALS="admin:admin ou admin:password"
        elif [ "$TELNET_OPEN" = true ]; then
            ACCESS_METHOD="telnet"
            DEFAULT_CREDENTIALS="admin:admin"
        elif [ "$SSH_OPEN" = true ]; then
            ACCESS_METHOD="ssh"
            DEFAULT_CREDENTIALS="admin:admin"
        fi
        ;;
    *)
        if [ "$PORT_80_OPEN" = true ]; then
            ACCESS_METHOD="http"
        elif [ "$PORT_443_OPEN" = true ]; then
            ACCESS_METHOD="https"
        elif [ "$TELNET_OPEN" = true ]; then
            ACCESS_METHOD="telnet"
        elif [ "$SSH_OPEN" = true ]; then
            ACCESS_METHOD="ssh"
        fi
        DEFAULT_CREDENTIALS="Tente: admin:admin, admin:password, admin:[em branco]"
        ;;
esac

# Gera URL de acesso
ACCESS_URL=""
if [ "$ACCESS_METHOD" = "http" ]; then
    ACCESS_URL="http://$IP"
elif [ "$ACCESS_METHOD" = "https" ]; then
    ACCESS_URL="https://$IP"
fi

# Retorna resultado do handshake
echo "{"
echo "  \\"success\\": true,"
echo "  \\"device\\": {"
echo "    \\"ip\\": \\"$IP\\","
echo "    \\"type\\": \\"$DEVICE_TYPE\\","
echo "    \\"ports\\": {"
echo "      \\"http\\": $PORT_80_OPEN,"
echo "      \\"https\\": $PORT_443_OPEN,"
echo "      \\"telnet\\": $TELNET_OPEN,"
echo "      \\"ssh\\": $SSH_OPEN"
echo "    },"
echo "    \\"access\\": {"
echo "      \\"method\\": \\"$ACCESS_METHOD\\","
echo "      \\"url\\": \\"$ACCESS_URL\\","
echo "      \\"default_credentials\\": \\"$DEFAULT_CREDENTIALS\\""
echo "    }"
echo "  }"
echo "}"
`;

        const tempScript = '/tmp/handshake_script.sh';
        fs.writeFileSync(tempScript, handshakeScript);
        fs.chmodSync(tempScript, '755');

        exec(`${tempScript}`, { timeout: 30000 }, (error, stdout, stderr) => {
            try { fs.unlinkSync(tempScript); } catch (e) {}

            if (error) {
                return res.status(500).json({ 
                    success: false, 
                    error: 'Erro ao executar handshake', 
                    details: error.message 
                });
            }

            try {
                const result = JSON.parse(stdout);
                
                // Update history entry with success status
                if (result.success) {
                    historyEntry.success = true;
                    historyEntry.accessMethod = result.device?.access?.method || 'unknown';
                }
                
                // Add to history (limit to last 50 entries)
                global.handshakeHistory.unshift(historyEntry);
                if (global.handshakeHistory.length > 50) {
                    global.handshakeHistory = global.handshakeHistory.slice(0, 50);
                }
                
                res.json(result);
            } catch (parseError) {
                res.status(500).json({ 
                    success: false, 
                    error: 'Erro ao processar resultado do handshake', 
                    details: parseError.message 
                });
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Erro ao iniciar handshake', 
            details: error.message 
        });
    }
});

app.get('/api/handshake-history', (req, res) => {
    try {
        const history = global.handshakeHistory || [];
        res.json({ success: true, history });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao obter histórico' });
    }
});

app.post('/api/shutdown', (req, res) => {
    try {
        console.log('🛑 Shutdown request received');
        res.json({ success: true, message: 'Servers shutting down...' });
        
        // Shutdown after sending response
        setTimeout(() => {
            console.log('🛑 Shutting down backend server');
            process.exit(0);
        }, 1000);
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao desligar servidor' });
    }
});

app.post('/api/restart', (req, res) => {
    try {
        console.log('🔄 Restart request received');
        res.json({ success: true, message: 'Restarting servers...' });
        
        const { exec } = require('child_process');
        const path = require('path');
        
        // Execute restart script after sending response
        setTimeout(() => {
            console.log('🔄 Executing restart script');
            const projectDir = path.dirname(__dirname);
            const scriptPath = path.join(projectDir, 'start-app.sh');
            
            exec(`bash "${scriptPath}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ Restart error:', error);
                } else {
                    console.log('✅ Restart script executed:', stdout);
                }
            });
            
            // Exit current process to allow restart
            process.exit(0);
        }, 1000);
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao reiniciar servidores' });
    }
});

app.get('/api/status', (req, res) => {
    try {
        const uptime = process.uptime();
        res.json({ 
            success: true, 
            status: 'online',
            uptime: Math.floor(uptime),
            timestamp: new Date().toISOString(),
            message: 'Servers are running'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao verificar status' });
    }
});

app.post('/api/auto-connect', async (req, res) => {
    const { ip, deviceType, username, password } = req.body;
    
    if (!ip) {
        return res.status(400).json({ success: false, error: 'IP não fornecido' });
    }
    
    try {
        // Script to attempt automatic connection
        const autoConnectScript = `
#!/bin/bash
IP="${ip}"
DEVICE_TYPE="${deviceType || 'unknown'}"
USERNAME="${username || 'admin'}"
PASSWORD="${password || 'admin'}"

echo "Tentando conexão automática com $IP ($DEVICE_TYPE)..."

# Ping para verificar se o dispositivo está acessível
ping -c 2 -W 2 "$IP" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo '{"success": false, "message": "Dispositivo não está respondendo"}'
    exit 1
fi

# Tenta conexão HTTP para verificar se há interface web
TIMEOUT=5
HTTP_RESPONSE=$(curl -s -m $TIMEOUT -o /dev/null -w "%{http_code}" "http://$IP" 2>/dev/null || echo "failed")
HTTPS_RESPONSE=$(curl -s -m $TIMEOUT -o /dev/null -w "%{http_code}" -k "https://$IP" 2>/dev/null || echo "failed")

CONNECTION_SUCCESS=false
CONNECTION_METHOD=""
CONNECTION_URL=""
AUTH_RESULT=""

# Tenta autenticação HTTP Basic
if [ "$HTTP_RESPONSE" != "failed" ] && [ "$HTTP_RESPONSE" != "404" ]; then
    CONNECTION_METHOD="http"
    CONNECTION_URL="http://$IP"
    
    # Tenta autenticação básica
    AUTH_RESPONSE=$(curl -s -m $TIMEOUT --user "$USERNAME:$PASSWORD" "http://$IP" -o /dev/null -w "%{http_code}" 2>/dev/null || echo "failed")
    
    if [ "$AUTH_RESPONSE" == "200" ] || [ "$AUTH_RESPONSE" == "302" ]; then
        CONNECTION_SUCCESS=true
        AUTH_RESULT="Autenticação bem-sucedida via HTTP Basic"
    else
        # Tenta detectar formulário de login
        LOGIN_FORM=$(curl -s -m $TIMEOUT "http://$IP" | grep -i "<form" | grep -i "login\|auth\|password" || echo "")
        
        if [ -n "$LOGIN_FORM" ]; then
            AUTH_RESULT="Interface de login detectada. Tente acessar manualmente."
        else
            AUTH_RESULT="Não foi possível autenticar automaticamente. Tente acessar manualmente."
        fi
    fi
elif [ "$HTTPS_RESPONSE" != "failed" ] && [ "$HTTPS_RESPONSE" != "404" ]; then
    CONNECTION_METHOD="https"
    CONNECTION_URL="https://$IP"
    
    # Tenta autenticação básica
    AUTH_RESPONSE=$(curl -s -k -m $TIMEOUT --user "$USERNAME:$PASSWORD" "https://$IP" -o /dev/null -w "%{http_code}" 2>/dev/null || echo "failed")
    
    if [ "$AUTH_RESPONSE" == "200" ] || [ "$AUTH_RESPONSE" == "302" ]; then
        CONNECTION_SUCCESS=true
        AUTH_RESULT="Autenticação bem-sucedida via HTTPS Basic"
    else
        AUTH_RESULT="Não foi possível autenticar automaticamente. Tente acessar manualmente."
    fi
else
    # Tenta Telnet
    nc -z -w2 "$IP" 23 >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        CONNECTION_METHOD="telnet"
        CONNECTION_URL="telnet://$IP"
        AUTH_RESULT="Porta Telnet disponível. Use 'telnet $IP' e tente as credenciais $USERNAME:$PASSWORD"
    else
        # Tenta SSH
        nc -z -w2 "$IP" 22 >/dev/null 2>&1
        if [ $? -eq 0 ]; then
            CONNECTION_METHOD="ssh"
            CONNECTION_URL="ssh://$USERNAME@$IP"
            AUTH_RESULT="Porta SSH disponível. Use 'ssh $USERNAME@$IP' e tente a senha $PASSWORD"
        else
            CONNECTION_METHOD="unknown"
            AUTH_RESULT="Não foi possível detectar método de conexão padrão"
        fi
    fi
fi

# Retorna resultado da tentativa de conexão
echo "{
  \"success\": true,
  \"connection\": {
    \"ip\": \"$IP\",
    \"type\": \"$DEVICE_TYPE\",
    \"connection_success\": $CONNECTION_SUCCESS,
    \"connection_method\": \"$CONNECTION_METHOD\",
    \"connection_url\": \"$CONNECTION_URL\",
    \"auth_result\": \"$AUTH_RESULT\"
  }
}"
`;

        const tempScript = '/tmp/auto_connect_script.sh';
        fs.writeFileSync(tempScript, autoConnectScript);
        fs.chmodSync(tempScript, '755');

        exec(`${tempScript}`, { timeout: 30000 }, (error, stdout, stderr) => {
            try { fs.unlinkSync(tempScript); } catch (e) {}

            if (error) {
                return res.status(500).json({ 
                    success: false, 
                    error: 'Erro ao tentar conexão automática', 
                    details: error.message 
                });
            }

            try {
                const result = JSON.parse(stdout);
                res.json(result);
            } catch (parseError) {
                res.status(500).json({ 
                    success: false, 
                    error: 'Erro ao processar resultado da conexão', 
                    details: parseError.message 
                });
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Erro ao iniciar conexão automática', 
            details: error.message 
        });
    }
});

app.post('/api/save-report', (req, res) => {
    const { data, filename } = req.body;
    if (!data) {
        return res.status(400).json({ success: false, error: 'Dados não fornecidos' });
    }

    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const finalFilename = filename || `network-scan-${timestamp}.txt`;
        const filePath = path.join(__dirname, 'reports', finalFilename);

        let txtContent = `RELATÓRIO DE SCAN DE REDE\n================================\n\n`;
        txtContent += `Data/Hora: ${data.summary.scan_time}\n`;
        txtContent += `Rede: ${data.network_info.local_ip}\n`;
        txtContent += `Dispositivos: ${data.summary.total_devices}\n\n`;
        
        data.devices.forEach((device, index) => {
            txtContent += `${index + 1}. ${device.ip}\n`;
            txtContent += `   MAC: ${device.mac}\n`;
            txtContent += `   Host: ${device.hostname}\n`;
            txtContent += `   Tipo: ${device.device_type}\n\n`;
        });

        fs.writeFileSync(filePath, txtContent);
        res.json({ success: true, message: 'Relatório salvo', filename: finalFilename });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao salvar relatório' });
    }
});

app.get('/api/download/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'reports', req.params.filename);
    if (fs.existsSync(filePath)) {
        // Set CORS headers for download
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="${req.params.filename}"`);
        
        // Stream the file instead of using res.download
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } else {
        res.status(404).json({ error: 'Arquivo não encontrado' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
