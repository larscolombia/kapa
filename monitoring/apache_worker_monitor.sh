#!/bin/bash

# Script de monitoreo de workers Apache
# Detecta acumulación de workers y conexiones persistentes

LOG_FILE="/var/log/apache_worker_monitor.log"
MAX_APACHE_PROCESSES=200
MAX_CONNECTIONS_PER_WORKER=5

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_apache_workers() {
    local worker_count=$(ps aux | grep -c "[a]pache2")
    echo "$worker_count"
}

check_apache_memory() {
    local total_mb=$(ps aux | grep "[a]pache2" | awk '{sum+=$6} END {print int(sum/1024)}')
    echo "$total_mb"
}

reload_apache_if_needed() {
    local workers=$(check_apache_workers)
    local memory=$(check_apache_memory)
    
    log_message "Workers Apache: $workers | Memoria total: ${memory}MB"
    
    if [ "$workers" -ge "$MAX_APACHE_PROCESSES" ]; then
        log_message "❌ ALERTA: $workers workers Apache (umbral: $MAX_APACHE_PROCESSES)"
        log_message "Acción: Reload Apache para reciclar workers"
        systemctl reload apache2
        sleep 3
        local new_count=$(check_apache_workers)
        log_message "✓ Apache recargado. Workers ahora: $new_count"
    fi
    
    if [ "$memory" -ge 4096 ]; then
        log_message "❌ ALERTA: Apache usando ${memory}MB de memoria (>4GB)"
        log_message "Acción: Restart Apache para liberar memoria"
        systemctl restart apache2
        sleep 5
        log_message "✓ Apache reiniciado"
    fi
}

main() {
    log_message "=== Verificación de workers Apache ==="
    reload_apache_if_needed
    log_message "✓ Verificación completada\n"
}

main
