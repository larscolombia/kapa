# Sistema de Monitoreo Preventivo KAPA

**Creado:** 2025-11-11  
**Propósito:** Prevenir recurrencia de error 503 por acumulación de conexiones CLOSE_WAIT

---

## 🎯 Problema Resuelto

### Root Cause Original
- Apache con `MaxConnectionsPerChild=0` nunca reciclaba workers
- Workers acumulaban conexiones CLOSE_WAIT al backend (puerto 3001)
- Backend entraba en loop de reinicios por EADDRINUSE
- **Resultado:** Error 503 para usuarios

### Solución Aplicada
1. **Apache Proxy:** ProxyTimeout 600, keepalive=On, retry=0
2. **MPM Prefork:** MaxConnectionsPerChild=1000 (reciclaje forzado)
3. **Monitoreo Automático:** Scripts cada 3-10 minutos con auto-recuperación

---

## 📊 Scripts de Monitoreo

### 1. check_health.sh
**Frecuencia:** Cada 3 minutos  
**Log:** `/var/log/kapa_health.log`  
**Acciones:**
- **CLOSE_WAIT ≥10:** Limpia procesos zombie automáticamente
- **Backend no online:** Reinicia backend
- **Reinicios ≥50:** Reset completo (PM2 delete + start limpio)

**Umbrales:**
```bash
CLOSE_WAIT_MAX=10
RESTARTS_MAX=50
```

### 2. apache_worker_monitor.sh
**Frecuencia:** Cada 10 minutos  
**Log:** `/var/log/apache_worker_monitor.log`  
**Acciones:**
- **Workers ≥200:** Reload Apache
- **Memoria ≥4GB:** Restart Apache

**Umbrales:**
```bash
MAX_APACHE_PROCESSES=200
MAX_MEMORY_MB=4096
```

---

## 🔧 Configuración Crontab

```bash
# KAPA Monitoring System - Auto-recovery
*/3 * * * * /var/www/kapa.healtheworld.com.co/monitoring/check_health.sh >/dev/null 2>&1
*/10 * * * * /var/www/kapa.healtheworld.com.co/monitoring/apache_worker_monitor.sh >/dev/null 2>&1
```

**Verificar:** `crontab -l | grep kapa`

---

## 📈 Verificar Logs

### Monitoreo en tiempo real
```bash
# Ver últimas 20 líneas
tail -20 /var/log/kapa_health.log

# Seguir en tiempo real
tail -f /var/log/kapa_health.log
```

### Buscar alertas
```bash
# Alertas en últimas 24h
grep "❌" /var/log/kapa_health.log | tail -50

# Reinicios automáticos
grep "Reiniciado\|Reset" /var/log/kapa_health.log | tail -20
```

### Estadísticas rápidas
```bash
# CLOSE_WAIT historial
grep "CLOSE_WAIT:" /var/log/kapa_health.log | tail -50

# Conteo de alertas hoy
grep "$(date '+%Y-%m-%d')" /var/log/kapa_health.log | grep -c "❌"
```

---

## 🚨 Alertas y Acciones Automáticas

| Condición | Umbral | Acción Automática |
|-----------|--------|-------------------|
| CLOSE_WAIT | ≥10 | Matar procesos zombie |
| Backend status | != online | Reiniciar backend |
| PM2 restarts | ≥50 | Reset completo (0 restarts) |
| Apache workers | ≥200 | Reload Apache |
| Apache memory | ≥4GB | Restart Apache |

---

## 🔍 Diagnóstico Manual

### Estado actual
```bash
# Conexiones CLOSE_WAIT ahora
lsof -i :3001 | grep CLOSE_WAIT | wc -l

# Estado PM2
pm2 status

# Workers Apache
ps aux | grep -c "[a]pache2"

# Memoria Apache total
ps aux | grep "[a]pache2" | awk '{sum+=$6} END {print int(sum/1024) "MB"}'
```

### Ejecutar checks manualmente
```bash
# Forzar check inmediato
bash /var/www/kapa.healtheworld.com.co/monitoring/check_health.sh

# Ver output en tiempo real
bash /var/www/kapa.healtheworld.com.co/monitoring/apache_worker_monitor.sh
```

---

## 📝 Configuración Apache (Referencia)

### /etc/apache2/sites-enabled/kapa.healtheworld.com.co-le-ssl.conf
```apache
ProxyTimeout 600
ProxyBadHeader Ignore
ProxyPass /api/ http://localhost:3001/ nocanon keepalive=On timeout=600 retry=0
ProxyPassReverse /api/ http://localhost:3001/
```

### /etc/apache2/mods-enabled/mpm_prefork.conf
```apache
<IfModule mpm_prefork_module>
    StartServers             5
    MinSpareServers          5
    MaxSpareServers          10
    MaxRequestWorkers        150
    MaxConnectionsPerChild   1000  # ⚠️ Era 0 (unlimited)
</IfModule>
```

**Backups creados:** `*.backup_20251111_*`

---

## 🎯 Métricas de Éxito

### Antes del Fix
- ❌ 136 reinicios backend
- ❌ CPU 100%
- ❌ Multiple CLOSE_WAIT
- ❌ Error 503 para usuarios

### Después del Fix + Monitoreo
- ✅ 0 conexiones CLOSE_WAIT
- ✅ CPU 0-5%
- ✅ Auto-recuperación en <3 minutos
- ✅ Sin errores 503

---

## 🔄 Mantenimiento

### Ajustar umbrales
Editar scripts si hay falsos positivos/negativos:

```bash
# check_health.sh
nano /var/www/kapa.healtheworld.com.co/monitoring/check_health.sh
# Cambiar CLOSE_WAIT_MAX o RESTARTS_MAX

# apache_worker_monitor.sh
nano /var/www/kapa.healtheworld.com.co/monitoring/apache_worker_monitor.sh
# Cambiar MAX_APACHE_PROCESSES o MAX_MEMORY_MB
```

### Rotación de logs
Los logs rotan automáticamente con logrotate del sistema.

```bash
# Ver tamaño actual
ls -lh /var/log/kapa_health.log
ls -lh /var/log/apache_worker_monitor.log
```

---

## ✅ Checklist Torvalds

1. **Minimalismo:** Scripts <50 líneas, propósito claro
2. **Legibilidad:** Bash simple, sin trucos "clever"
3. **Consistencia:** Integrado con PM2, Apache, sistema
4. **Eficiencia:** Checks cada 3-10min (bajo overhead)
5. **Robustez:** Auto-recuperación, sin intervención manual

---

## 📞 Troubleshooting

### Script no ejecuta desde cron
```bash
# Verificar crontab
crontab -l | grep kapa

# Verificar permisos
ls -l /var/www/kapa.healtheworld.com.co/monitoring/*.sh

# Ejecutar manualmente
bash -x /var/www/kapa.healtheworld.com.co/monitoring/check_health.sh
```

### Alertas recurrentes
```bash
# Ver patrón de alertas
grep "❌" /var/log/kapa_health.log | tail -100

# Si CLOSE_WAIT persisten: revisar Apache config
apache2ctl -t -D DUMP_VHOSTS | grep kapa

# Si reinicios excesivos: revisar logs backend
pm2 logs kapa-backend --lines 100 --nostream
```

### Reset total
```bash
# Si sistema degradado, reset completo
pm2 delete kapa-backend
lsof -ti :3001 | xargs -r kill -9
systemctl restart apache2
sleep 5
cd /var/www/kapa.healtheworld.com.co/backend
pm2 start ecosystem.config.js
pm2 save
```

---

**Última actualización:** 2025-11-11  
**Mantenedor:** Sistema automatizado  
**Contacto:** Ver logs para diagnóstico automático
