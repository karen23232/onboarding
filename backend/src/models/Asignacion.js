const pool = require('../config/database');

class Asignacion {
  // ✅ QUERY CORRECTO - Incluye todas las fechas del evento
  static async obtenerTodas() {
    try {
      const query = `
        SELECT 
          a.colaborador_id,
          a.evento_id,
          a.completado,
          a.fecha_asignacion,
          c.nombre_completo,
          c.correo,
          co.nombre_evento,
          co.tipo,
          co.descripcion,
          co.fecha_inicio,
          co.fecha_fin,
          co.activo
        FROM asignaciones a
        INNER JOIN colaboradores c ON a.colaborador_id = c.id
        INNER JOIN calendario_onboardings co ON a.evento_id = co.id
        ORDER BY co.fecha_inicio DESC, c.nombre_completo ASC
      `;
      
      const resultado = await pool.query(query);
      return resultado.rows;
    } catch (error) {
      console.error('Error al obtener todas las asignaciones:', error);
      throw error;
    }
  }

  static async obtenerPorColaborador(colaborador_id) {
    try {
      const query = `
        SELECT 
          a.colaborador_id,
          a.evento_id,
          a.completado,
          a.fecha_asignacion,
          c.nombre_completo,
          c.correo,
          co.nombre_evento,
          co.tipo,
          co.descripcion,
          co.fecha_inicio,
          co.fecha_fin,
          co.activo
        FROM asignaciones a
        INNER JOIN colaboradores c ON a.colaborador_id = c.id
        INNER JOIN calendario_onboardings co ON a.evento_id = co.id
        WHERE a.colaborador_id = $1
        ORDER BY co.fecha_inicio DESC
      `;
      
      const resultado = await pool.query(query, [colaborador_id]);
      return resultado.rows;
    } catch (error) {
      console.error('Error al obtener asignaciones por colaborador:', error);
      throw error;
    }
  }

  static async obtenerPorEvento(evento_id) {
    try {
      const query = `
        SELECT 
          a.colaborador_id,
          a.evento_id,
          a.completado,
          a.fecha_asignacion,
          c.nombre_completo,
          c.correo,
          co.nombre_evento,
          co.tipo,
          co.descripcion,
          co.fecha_inicio,
          co.fecha_fin
        FROM asignaciones a
        INNER JOIN colaboradores c ON a.colaborador_id = c.id
        INNER JOIN calendario_onboardings co ON a.evento_id = co.id
        WHERE a.evento_id = $1
        ORDER BY c.nombre_completo ASC
      `;
      
      const resultado = await pool.query(query, [evento_id]);
      return resultado.rows;
    } catch (error) {
      console.error('Error al obtener asignaciones por evento:', error);
      throw error;
    }
  }

  static async obtenerPendientes(colaborador_id) {
    try {
      const query = `
        SELECT 
          a.colaborador_id,
          a.evento_id,
          a.completado,
          a.fecha_asignacion,
          c.nombre_completo,
          c.correo,
          co.nombre_evento,
          co.tipo,
          co.descripcion,
          co.fecha_inicio,
          co.fecha_fin
        FROM asignaciones a
        INNER JOIN colaboradores c ON a.colaborador_id = c.id
        INNER JOIN calendario_onboardings co ON a.evento_id = co.id
        WHERE a.colaborador_id = $1 AND a.completado = false
        ORDER BY co.fecha_inicio ASC
      `;
      
      const resultado = await pool.query(query, [colaborador_id]);
      return resultado.rows;
    } catch (error) {
      console.error('Error al obtener asignaciones pendientes:', error);
      throw error;
    }
  }

  static async obtenerCompletadas(colaborador_id) {
    try {
      const query = `
        SELECT 
          a.colaborador_id,
          a.evento_id,
          a.completado,
          a.fecha_asignacion,
          c.nombre_completo,
          c.correo,
          co.nombre_evento,
          co.tipo,
          co.descripcion,
          co.fecha_inicio,
          co.fecha_fin
        FROM asignaciones a
        INNER JOIN colaboradores c ON a.colaborador_id = c.id
        INNER JOIN calendario_onboardings co ON a.evento_id = co.id
        WHERE a.colaborador_id = $1 AND a.completado = true
        ORDER BY co.fecha_inicio DESC
      `;
      
      const resultado = await pool.query(query, [colaborador_id]);
      return resultado.rows;
    } catch (error) {
      console.error('Error al obtener asignaciones completadas:', error);
      throw error;
    }
  }

  static async crear(colaborador_id, evento_id) {
    try {
      const query = `
        INSERT INTO asignaciones (colaborador_id, evento_id, completado)
        VALUES ($1, $2, false)
        RETURNING *
      `;
      
      const resultado = await pool.query(query, [colaborador_id, evento_id]);
      return resultado.rows[0];
    } catch (error) {
      console.error('Error al crear asignación:', error);
      throw error;
    }
  }

  static async existe(colaborador_id, evento_id) {
    try {
      const query = `
        SELECT EXISTS(
          SELECT 1 FROM asignaciones 
          WHERE colaborador_id = $1 AND evento_id = $2
        ) as existe
      `;
      
      const resultado = await pool.query(query, [colaborador_id, evento_id]);
      return resultado.rows[0].existe;
    } catch (error) {
      console.error('Error al verificar existencia de asignación:', error);
      throw error;
    }
  }

  static async marcarCompletada(colaborador_id, evento_id) {
    try {
      const query = `
        UPDATE asignaciones 
        SET completado = true 
        WHERE colaborador_id = $1 AND evento_id = $2
        RETURNING *
      `;
      
      const resultado = await pool.query(query, [colaborador_id, evento_id]);
      return resultado.rows[0];
    } catch (error) {
      console.error('Error al marcar asignación como completada:', error);
      throw error;
    }
  }

  static async marcarNoCompletada(colaborador_id, evento_id) {
    try {
      const query = `
        UPDATE asignaciones 
        SET completado = false 
        WHERE colaborador_id = $1 AND evento_id = $2
        RETURNING *
      `;
      
      const resultado = await pool.query(query, [colaborador_id, evento_id]);
      return resultado.rows[0];
    } catch (error) {
      console.error('Error al marcar asignación como no completada:', error);
      throw error;
    }
  }

  static async eliminar(colaborador_id, evento_id) {
    try {
      const query = `
        DELETE FROM asignaciones 
        WHERE colaborador_id = $1 AND evento_id = $2
        RETURNING *
      `;
      
      const resultado = await pool.query(query, [colaborador_id, evento_id]);
      return resultado.rows[0];
    } catch (error) {
      console.error('Error al eliminar asignación:', error);
      throw error;
    }
  }

  static async asignarMultiples(colaboradores_ids, evento_id) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const asignaciones = [];
      
      for (const colaborador_id of colaboradores_ids) {
        // Verificar si ya existe
        const existeQuery = `
          SELECT EXISTS(
            SELECT 1 FROM asignaciones 
            WHERE colaborador_id = $1 AND evento_id = $2
          ) as existe
        `;
        
        const existeResult = await client.query(existeQuery, [colaborador_id, evento_id]);
        
        if (!existeResult.rows[0].existe) {
          const insertQuery = `
            INSERT INTO asignaciones (colaborador_id, evento_id, completado)
            VALUES ($1, $2, false)
            RETURNING *
          `;
          
          const resultado = await client.query(insertQuery, [colaborador_id, evento_id]);
          asignaciones.push(resultado.rows[0]);
        }
      }
      
      await client.query('COMMIT');
      return asignaciones;
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al asignar múltiples:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Asignacion;