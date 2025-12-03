const pool = require('../config/database');

class Asignacion {
  static async crear(colaborador_id, evento_id) {
    const query = `
      INSERT INTO asignaciones (colaborador_id, evento_id)
      VALUES ($1, $2)
      ON CONFLICT (colaborador_id, evento_id) DO NOTHING
      RETURNING *
    `;
    const resultado = await pool.query(query, [colaborador_id, evento_id]);
    return resultado.rows[0];
  }

  static async obtenerTodas() {
    const query = `
      SELECT 
        a.*,
        c.nombre_completo,
        c.correo,
        co.nombre_evento,
        co.fecha_inicio,
        co.fecha_fin,
        co.tipo
      FROM asignaciones a
      JOIN colaboradores c ON a.colaborador_id = c.id
      JOIN calendario_onboardings co ON a.evento_id = co.id
      ORDER BY co.fecha_inicio DESC
    `;
    const resultado = await pool.query(query);
    return resultado.rows;
  }

  static async obtenerPorColaborador(colaborador_id) {
    const query = `
      SELECT 
        a.*,
        co.nombre_evento,
        co.descripcion,
        co.fecha_inicio,
        co.fecha_fin,
        co.tipo
      FROM asignaciones a
      JOIN calendario_onboardings co ON a.evento_id = co.id
      WHERE a.colaborador_id = $1
      ORDER BY co.fecha_inicio DESC
    `;
    const resultado = await pool.query(query, [colaborador_id]);
    return resultado.rows;
  }

  static async obtenerPorEvento(evento_id) {
    const query = `
      SELECT 
        a.*,
        c.nombre_completo,
        c.correo,
        c.fecha_ingreso
      FROM asignaciones a
      JOIN colaboradores c ON a.colaborador_id = c.id
      WHERE a.evento_id = $1
      ORDER BY c.nombre_completo ASC
    `;
    const resultado = await pool.query(query, [evento_id]);
    return resultado.rows;
  }

  static async marcarCompletada(colaborador_id, evento_id) {
    const fechaCompletado = new Date().toISOString().split('T')[0];
    const query = `
      UPDATE asignaciones 
      SET completado = true, fecha_completado = $3
      WHERE colaborador_id = $1 AND evento_id = $2
      RETURNING *
    `;
    const resultado = await pool.query(query, [colaborador_id, evento_id, fechaCompletado]);
    return resultado.rows[0];
  }

  static async marcarNoCompletada(colaborador_id, evento_id) {
    const query = `
      UPDATE asignaciones 
      SET completado = false, fecha_completado = NULL
      WHERE colaborador_id = $1 AND evento_id = $2
      RETURNING *
    `;
    const resultado = await pool.query(query, [colaborador_id, evento_id]);
    return resultado.rows[0];
  }

  static async eliminar(colaborador_id, evento_id) {
    const query = `
      DELETE FROM asignaciones 
      WHERE colaborador_id = $1 AND evento_id = $2
      RETURNING *
    `;
    const resultado = await pool.query(query, [colaborador_id, evento_id]);
    return resultado.rows[0];
  }

  static async obtenerPendientes(colaborador_id) {
    const query = `
      SELECT 
        a.*,
        co.nombre_evento,
        co.descripcion,
        co.fecha_inicio,
        co.fecha_fin,
        co.tipo
      FROM asignaciones a
      JOIN calendario_onboardings co ON a.evento_id = co.id
      WHERE a.colaborador_id = $1 AND a.completado = false
      ORDER BY co.fecha_inicio ASC
    `;
    const resultado = await pool.query(query, [colaborador_id]);
    return resultado.rows;
  }

  static async obtenerCompletadas(colaborador_id) {
    const query = `
      SELECT 
        a.*,
        co.nombre_evento,
        co.descripcion,
        co.fecha_inicio,
        co.fecha_fin,
        co.tipo
      FROM asignaciones a
      JOIN calendario_onboardings co ON a.evento_id = co.id
      WHERE a.colaborador_id = $1 AND a.completado = true
      ORDER BY a.fecha_completado DESC
    `;
    const resultado = await pool.query(query, [colaborador_id]);
    return resultado.rows;
  }

  static async asignarMultiples(colaboradores_ids, evento_id) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      const asignaciones = [];
      
      for (const colaborador_id of colaboradores_ids) {
        const query = `
          INSERT INTO asignaciones (colaborador_id, evento_id)
          VALUES ($1, $2)
          ON CONFLICT (colaborador_id, evento_id) DO NOTHING
          RETURNING *
        `;
        const resultado = await client.query(query, [colaborador_id, evento_id]);
        if (resultado.rows[0]) {
          asignaciones.push(resultado.rows[0]);
        }
      }
      
      await client.query('COMMIT');
      return asignaciones;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async existe(colaborador_id, evento_id) {
    const query = `
      SELECT EXISTS(
        SELECT 1 FROM asignaciones 
        WHERE colaborador_id = $1 AND evento_id = $2
      ) as existe
    `;
    const resultado = await pool.query(query, [colaborador_id, evento_id]);
    return resultado.rows[0].existe;
  }
}

module.exports = Asignacion;