-- SCRIPT OPCIONAL: Migración de Auditoría para Documentos Históricos
-- Este script crea registros de auditoría para documentos que ya existían antes del sistema

-- IMPORTANTE: Solo ejecutar UNA VEZ y después de verificar que no hay registros duplicados

-- Insertar registro inicial para todos los documentos existentes que no tienen auditoría
INSERT INTO document_state_audit (
    document_id, 
    previous_state, 
    new_state, 
    comments, 
    changed_at, 
    time_in_previous_state_hours
)
SELECT 
    d.document_id,
    'none' as previous_state,
    d.state as new_state,
    'Migración histórica - documento existente antes del sistema de auditoría' as comments,
    NOW() as changed_at,
    0 as time_in_previous_state_hours
FROM document d
WHERE d.document_id NOT IN (
    SELECT DISTINCT document_id 
    FROM document_state_audit
)
ORDER BY d.document_id;

-- Verificar cuántos registros se crearon
SELECT 
    COUNT(*) as total_documentos_migrados,
    MIN(changed_at) as primera_migracion,
    MAX(changed_at) as ultima_migracion
FROM document_state_audit 
WHERE comments LIKE '%Migración histórica%';

-- Ver resumen por estado
SELECT 
    new_state,
    COUNT(*) as cantidad
FROM document_state_audit 
WHERE comments LIKE '%Migración histórica%'
GROUP BY new_state
ORDER BY cantidad DESC;
