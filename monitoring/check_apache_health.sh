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
    local close_wait_count=$(lsof -i :3001 2>/dev/null | grep -c "CLOSE_WAIT" || echo "0")
    echo "$close_wait_count"
}

# Verificar reinicios de PM2
check_pm2_restarts() {
    local restarts=$($PM2 list 2>/dev/null | grep "kapa-backend" | awk '{print $6}' | tr -d '↺' || echo "0")
    echo "$restarts"
}

# Verificar CPU del backend
check_backend_cpu() {
    local cpu=$($PM2 list 2>/dev/null | grep "kapa-backend" | awk '{print $8}' | tr -d '%' || echo "0")
    echo "$cpu"
}

# Verificar status del backend
check_backend_status() {
    local status=$($PM2 list 2>/dev/null | grep "kapa-backend" | awk '{print $10}' || echo "offline")
    echo "$status"
}

# Limpiar conexiones CLOSE_WAIT
clean_close_wait() {
    log_message "⚠️  Limpiando conexiones CLOSE_WAIT..."
    lsof -i :3001 2>/dev/null | grep "CLOSE_WAIT" | awk '{print $2}' | sort -u | xargs -r kill -9
    sleep 2
    local remaining=$(check_close_wait)
    log_message "✓ Conexiones CLOSE_WAIT limpiadas. Restantes: $remaining"
}

# Reiniciar backend si es necesario
restart_backend() {
    log_message "🔄 Reiniciando backend debido a problemas críticos..."
    cd /var/www/kapa.healtheworld.com.co/backend
    $PM2 restart kapa-backend 2>&1 | grep -E "(Applying|✓)" | head -2
    sleep 3
    local status=$(check_backend_status)
    log_message "✓ Backend reiniciado. Estado: $status"
}

# Verificación principal
main() {
    log_message "=== Iniciando verificación de salud ==="
    
    # Verificar conexiones CLOSE_WAIT
    close_wait=$(check_close_wait)
    log_message "Conexiones CLOSE_WAIT: $close_wait"
    
    if [ "$close_wait" -ge "$ALERT_THRESHOLD_CLOSE_WAIT" ]; then
        log_message "❌ ALERTA: $close_wait conexiones CLOSE_WAIT detectadas (umbral: $ALERT_THRESHOLD_CLOSE_WAIT)"
        clean_close_wait
    fi
    
    # Verificar reinicios de PM2
    restarts=$(check_pm2_restarts)
    log_message "Reinicios PM2: $restarts"
    
    if [ "$restarts" -ge "$ALERT_THRESHOLD_RESTARTS" ]; then
        log_message "❌ ALERTA: Backend con $restarts reinicios (umbral: $ALERT_THRESHOLD_RESTARTS)"
        log_message "Acción: Reinicio limpio necesario"
        $PM2 delete kapa-backend 2>&1 | grep -E "(Applying|✓|deleted)" | head -1
        sleep 2
        lsof -ti :3001 | xargs -r kill -9
        sleep 2
        cd /var/www/kapa.healtheworld.com.co/backend
        $PM2 start ecosystem.config.js 2>&1 | grep -E "(Done|Started)" | head -1
        $PM2 save 2>&1 | grep -E "(saved|Successfully)" | head -1
        log_message "✓ Backend reiniciado limpiamente desde 0 reinicios"
    fi
    
    # Verificar CPU
    cpu=$(check_backend_cpu)
    log_message "CPU Backend: ${cpu}%"
    
    if [ "${cpu%.*}" -ge 90 ] 2>/dev/null; then
        log_message "❌ ALERTA: CPU al ${cpu}% (crítico)"
        restart_backend
    fi
    
    # Verificar estado general
    backend_status=$(check_backend_status)
    if [ "$backend_status" != "online" ]; then
        log_message "❌ ALERTA: Backend no está online. Estado: $backend_status"
        restart_backend
    fi
    
    log_message "✓ Verificación completada"
}

main
