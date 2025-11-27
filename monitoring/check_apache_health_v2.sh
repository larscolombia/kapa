#!/bin/bash

# Script de monitoreo de salud Apache-Backend
# Detecta conexiones CLOSE_WAIT y reinicia si es necesario

PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
PM2="/usr/local/bin/pm2"

LOG_FILE="/var/log/apache_backend_health.log"
ALERT_THRESHOLD_CLOSE_WAIT=10
ALERT_THRESHOLD_RESTARTS=50

# Función de logging
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Verificar conexiones CLOSE_WAIT
check_close_wait() {
    lsof -i :3001 2>/dev/null | grep -c "CLOSE_WAIT" || echo "0"
}

# Verificar reinicios de PM2
check_pm2_restarts() {
    $PM2 show kapa-backend 2>/dev/null | grep "restarts" | head -1 | awk '{print $4}' || echo "0"
}

# Verificar CPU del backend
check_backend_cpu() {
    $PM2 show kapa-backend 2>/dev/null | grep "cpu" | head -1 | awk '{print $3}' | tr -d '%' || echo "0"
}

# Verificar status del backend
check_backend_status() {
    $PM2 show kapa-backend 2>/dev/null | grep "status" | head -1 | awk '{print $3}' || echo "offline"
}

# Limpiar conexiones CLOSE_WAIT
clean_close_wait() {
    log_message "⚠️  Limpiando conexiones CLOSE_WAIT..."
    lsof -i :3001 2>/dev/null | grep "CLOSE_WAIT" | awk '{print $2}' | sort -u | xargs -r kill -9 2>/dev/null
    sleep 2
    local remaining=$(check_close_wait)
    log_message "✓ Conexiones CLOSE_WAIT limpiadas. Restantes: $remaining"
}

# Reiniciar backend si es necesario
restart_backend() {
    log_message "🔄 Reiniciando backend..."
    cd /var/www/kapa.healtheworld.com.co/backend
    $PM2 restart kapa-backend >/dev/null 2>&1
    sleep 3
    local status=$(check_backend_status)
    log_message "✓ Backend reiniciado. Estado: $status"
}

# Verificación principal
main() {
    log_message "=== Verificación de salud ==="
    
    # Verificar conexiones CLOSE_WAIT
    close_wait=$(check_close_wait)
    log_message "CLOSE_WAIT: $close_wait"
    
    if [ "$close_wait" -ge "$ALERT_THRESHOLD_CLOSE_WAIT" ]; then
        log_message "❌ ALERTA: $close_wait CLOSE_WAIT (umbral: $ALERT_THRESHOLD_CLOSE_WAIT)"
        clean_close_wait
    fi
    
    # Verificar reinicios de PM2
    restarts=$(check_pm2_restarts)
    log_message "Reinicios: $restarts"
    
    # Solo alertar si restarts es un número y supera umbral
    if [ "$restarts" -eq "$restarts" ] 2>/dev/null && [ "$restarts" -ge "$ALERT_THRESHOLD_RESTARTS" ]; then
        log_message "❌ ALERTA: $restarts reinicios (umbral: $ALERT_THRESHOLD_RESTARTS)"
        log_message "Ejecutando reinicio limpio..."
        $PM2 delete kapa-backend >/dev/null 2>&1
        sleep 2
        lsof -ti :3001 | xargs -r kill -9 2>/dev/null
        sleep 2
        cd /var/www/kapa.healtheworld.com.co/backend
        $PM2 start ecosystem.config.js >/dev/null 2>&1
        $PM2 save >/dev/null 2>&1
        log_message "✓ Backend reiniciado limpio (0 reinicios)"
    fi
    
    # Verificar CPU
    cpu=$(check_backend_cpu)
    log_message "CPU: ${cpu}%"
    
    if [ "$cpu" -eq "$cpu" ] 2>/dev/null && [ "$cpu" -ge 90 ]; then
        log_message "❌ ALERTA: CPU ${cpu}% (crítico)"
        restart_backend
    fi
    
    # Verificar estado general
    backend_status=$(check_backend_status)
    log_message "Estado: $backend_status"
    
    if [ "$backend_status" != "online" ]; then
        log_message "❌ Backend no online, reiniciando..."
        restart_backend
    fi
    
    log_message "✓ OK"
}

main
