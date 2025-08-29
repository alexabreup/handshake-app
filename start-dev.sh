#!/bin/bash
echo "🚀 Iniciando Network Scanner..."

cleanup() {
    echo "Parando..."
    kill $backend_pid $frontend_pid 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

cd "$(dirname "$0")/backend" && npm run dev &
backend_pid=$!
sleep 5
cd "$(dirname "$0")/frontend" && PORT=3099 BROWSER=none npm start &
frontend_pid=$!

echo "🎉 Acesse: http://localhost:3099"
wait
