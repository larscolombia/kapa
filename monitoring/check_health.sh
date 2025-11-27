#!/bin/bash

PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
LOG="/var/log/kapa_health.log"
CLOSE_WAIT_MAX=10
RESTARTS_MAX=50

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG"; }

# Verificar conexiones CLOSE_WAIT
close_wait=$(lsof -i :3001 2>/dev/null | grep -c "CLOSE_WAIT" || echo 0)
log "CLOSE_WAIT: $close_wait"

if [ "$close_wait" -ge "$CLOSE_WAIT_MAX" ]; then
    log "❌ Limpiando $close_wait CLOSE_WAIT"
    lsof -i :3001 2>/dev/null | grep "CLOSE_WAIT" | awk '{print $2}' | sort -u | xargs -r kill -9 2>/dev/null
    sleep 2
    log "✓ Limpiado"
fi

# Verificar PM2 (usando descripción de status que es más confiable)
if ! /usr/local/bin/pm2 describe kapa-backend 2>/dev/null | grep -q "status.*online"; then
    log "❌ Backend no online, reiniciando"
    cd /var/www/kapa.healtheworld.com.co/backend
    /usr/local/bin/pm2 restart kapa-backend >/dev/null 2>&1
    sleep 3
    log "✓ Reiniciado"
fi

# Verificar reinicios excesivos
restarts=$(/usr/local/bin/pm2 describe kapa-backend 2>/dev/null | grep "restarts" | grep -oE '[0-9]+' | head -1)
if [ -n "$restarts" ] && [ "$restarts" -ge "$RESTARTS_MAX" ]; then
    log "❌ CRÍTICO: $restarts reinicios, reseteando"
    /usr/local/bin/pm2 delete kapa-backend >/dev/null 2>&1
    sleep 2
    lsof -ti :3001 | xargs -r kill -9 2>/dev/null
    sleep 2
    cd /var/www/kapa.healtheworld.com.co/backend
    /usr/local/bin/pm2 start ecosystem.config.js >/dev/null 2>&1
    /usr/local/bin/pm2 save >/dev/null 2>&1
    log "✓ Reset completo"
fi

log "✓ OK"
