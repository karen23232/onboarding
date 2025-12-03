-- =========================================
-- SCRIPT COMPLETO DE INICIALIZACIÓN BD
-- Onboarding Banco
-- =========================================

------------------------------------------------------------
-- TABLA: usuarios
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(255) NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'colaborador' 
        CHECK (rol IN ('admin', 'rrhh', 'colaborador')),
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso TIMESTAMP,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

------------------------------------------------------------
-- TABLA: colaboradores
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS colaboradores (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(255) NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    fecha_ingreso DATE NOT NULL,
    onboarding_bienvenida BOOLEAN DEFAULT FALSE,
    onboarding_tecnico BOOLEAN DEFAULT FALSE,
    fecha_onboarding_tecnico DATE,
    notas TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

------------------------------------------------------------
-- TABLA: calendario_onboardings
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS calendario_onboardings (
    id SERIAL PRIMARY KEY,
    nombre_evento VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

------------------------------------------------------------
-- TABLA: asignaciones
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS asignaciones (
    id SERIAL PRIMARY KEY,
    colaborador_id INTEGER REFERENCES colaboradores(id) ON DELETE CASCADE,
    evento_id INTEGER REFERENCES calendario_onboardings(id) ON DELETE CASCADE,
    completado BOOLEAN DEFAULT FALSE,
    fecha_completado DATE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(colaborador_id, evento_id)
);

------------------------------------------------------------
-- TABLA: notificaciones_enviadas
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notificaciones_enviadas (
    id SERIAL PRIMARY KEY,
    evento_id INTEGER REFERENCES calendario_onboardings(id) ON DELETE CASCADE,
    colaborador_id INTEGER REFERENCES colaboradores(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(evento_id, colaborador_id, tipo)
);

------------------------------------------------------------
-- ⭐ PRIMERO: Crear función actualizar_timestamp()
------------------------------------------------------------
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

------------------------------------------------------------
-- ⭐ SEGUNDO: Crear triggers
------------------------------------------------------------
CREATE TRIGGER trigger_actualizar_usuarios
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_actualizar_colaboradores
BEFORE UPDATE ON colaboradores
FOR EACH ROW
EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_actualizar_calendario
BEFORE UPDATE ON calendario_onboardings
FOR EACH ROW
EXECUTE FUNCTION actualizar_timestamp();

------------------------------------------------------------
-- INSERTAR USUARIO ADMIN POR DEFECTO
------------------------------------------------------------
INSERT INTO usuarios (nombre_completo, correo, password, rol)
VALUES (
    'Administrador',
    'admin@bancobogota.com',
    '$2b$10$rKZvVvHzf1qE.yKJxR8ZPOxGVGvZ8YdZ5QmXhF8BJ4qNp8YhWXqBq',
    'admin'
)
ON CONFLICT (correo) DO NOTHING;

------------------------------------------------------------
-- INSERTAR EVENTOS DE ONBOARDING (AÑO 2025)
------------------------------------------------------------
INSERT INTO calendario_onboardings (nombre_evento, descripcion, fecha_inicio, fecha_fin, tipo) VALUES
('Journey to Cloud - Q1', 'Onboarding técnico Journey to Cloud primer trimestre', '2025-01-15', '2025-01-21', 'Journey to Cloud'),
('Journey to Cloud - Q2', 'Onboarding técnico Journey to Cloud segundo trimestre', '2025-04-14', '2025-04-20', 'Journey to Cloud'),
('Journey to Cloud - Q3', 'Onboarding técnico Journey to Cloud tercer trimestre', '2025-07-14', '2025-07-20', 'Journey to Cloud'),
('Journey to Cloud - Q4', 'Onboarding técnico Journey to Cloud cuarto trimestre', '2025-10-13', '2025-10-19', 'Journey to Cloud'),
('Capítulo Fundamentos - Feb', 'Onboarding técnico capítulo fundamentos', '2025-02-10', '2025-02-14', 'Capítulo Técnico'),
('Capítulo Fundamentos - May', 'Onboarding técnico capítulo fundamentos', '2025-05-12', '2025-05-16', 'Capítulo Técnico'),
('Capítulo Fundamentos - Ago', 'Onboarding técnico capítulo fundamentos', '2025-08-11', '2025-08-15', 'Capítulo Técnico'),
('Capítulo Fundamentos - Nov', 'Onboarding técnico capítulo fundamentos', '2025-11-10', '2025-11-14', 'Capítulo Técnico'),
('Capítulo Avanzado - Mar', 'Onboarding técnico capítulo avanzado', '2025-03-17', '2025-03-21', 'Capítulo Técnico'),
('Capítulo Avanzado - Jun', 'Onboarding técnico capítulo avanzado', '2025-06-16', '2025-06-20', 'Capítulo Técnico'),
('Capítulo Avanzado - Sep', 'Onboarding técnico capítulo avanzado', '2025-09-15', '2025-09-19', 'Capítulo Técnico'),
('Capítulo Avanzado - Dic', 'Onboarding técnico capítulo avanzado', '2025-12-08', '2025-12-12', 'Capítulo Técnico')
ON CONFLICT DO NOTHING;

------------------------------------------------------------
-- VISTA: Vista completa de colaboradores
------------------------------------------------------------
CREATE OR REPLACE VIEW vista_colaboradores_completa AS
SELECT 
    c.id,
    c.nombre_completo,
    c.correo,
    c.fecha_ingreso,
    c.onboarding_bienvenida,
    c.onboarding_tecnico,
    c.fecha_onboarding_tecnico,
    c.notas,
    c.creado_en,
    c.actualizado_en,
    json_agg(
        json_build_object(
            'evento_id', co.id,
            'evento_nombre', co.nombre_evento,
            'fecha_inicio', co.fecha_inicio,
            'fecha_fin', co.fecha_fin,
            'completado', a.completado
        )
    ) FILTER (WHERE co.id IS NOT NULL) AS eventos_asignados
FROM colaboradores c
LEFT JOIN asignaciones a ON c.id = a.colaborador_id
LEFT JOIN calendario_onboardings co ON a.evento_id = co.id
GROUP BY c.id;

------------------------------------------------------------
-- COMENTARIOS
------------------------------------------------------------
COMMENT ON TABLE colaboradores IS 'Tabla de colaboradores del banco';
COMMENT ON TABLE calendario_onboardings IS 'Calendario anual de eventos';
COMMENT ON TABLE asignaciones IS 'Relación colaboradores-eventos';
COMMENT ON TABLE notificaciones_enviadas IS 'Notificaciones enviadas por correo';
