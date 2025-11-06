-- Agregar permisos ILB a la tabla access

INSERT INTO access (module_name, can_view, can_edit, role_id) VALUES
('ilv_management', TRUE, TRUE, 1),  -- Admin KAPA: full access
('ilv_management', TRUE, TRUE, 2),  -- Usuario KAPA: full access
('ilv_management', TRUE, TRUE, 3),  -- Cliente: crear/ver sus reportes
('ilv_management', TRUE, FALSE, 4), -- Contratista: solo ver los suyos
('ilv_management', TRUE, FALSE, 5)  -- Subcontratista: solo ver los suyos
ON CONFLICT (module_name, role_id) DO UPDATE SET
  can_view = EXCLUDED.can_view,
  can_edit = EXCLUDED.can_edit;
