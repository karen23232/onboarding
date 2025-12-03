const pool = require('../config/database');

class CalendarioOnboarding {
  static async crear(datosEvento) {
    const {
      nombre_evento,
      descripcion,
      fecha_inicio,
      fecha_fin,
      tipo,
      activo = true
    } = datosEvento;

    const query = `
      INSERT INTO calendario_onboardings 
      (nombre_evento, descripcion, fecha_inicio, fecha_fin, tipo, activo)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const valores = [nombre_evento, descripcion, fecha_inicio, fecha_fin, tipo, activo];
    const resultado = await pool.query(query, valores);
    return resultado.rows[0];
  }

  static async obtenerTodos() {
    const query = `
      SELECT * FROM calendario_onboardings 
      ORDER BY fecha_inicio ASC
    `;
    const resultado = await pool.query(query);
    return resultado.rows;
  }

  static async obtenerActivos() {
    const query = `
      SELECT * FROM calendario_onboardings 
      WHERE activo = true
      ORDER BY fecha_inicio ASC
    `;
    const resultado = await pool.query(query);
    return resultado.rows;
  }

  static async obtenerPorId(id) {
    const query = `SELECT * FROM calendario_onboardings WHERE id = $1`;
    const resultado = await pool.query(query, [id]);
    return resultado.rows[0];
  }

  static async obtenerPorTipo(tipo) {
    const query = `
      SELECT * FROM calendario_onboardings 
      WHERE tipo = $1 AND activo = true
      ORDER BY fecha_inicio ASC
    `;
    const resultado = await pool.query(query, [tipo]);
    return resultado.rows;
  }

  static async obtenerProximos(dias = 7) {
    const query = `
      SELECT * FROM calendario_onboardings 
      WHERE fecha_inicio >= CURRENT_DATE 
      AND fecha_inicio <= CURRENT_DATE + $1 * INTERVAL '1 day'
      AND activo = true
      ORDER BY fecha_inicio ASC
    `;
    const resultado = await pool.query(query, [dias]);
    return resultado.rows;
  }

  static async obtenerParaAlertas() {
    const query = `
      SELECT co.*, 
             ARRAY_AGG(
               json_build_object(
                 'colaborador_id', c.id,
                 'colaborador_nombre', c.nombre_completo,
                 'colaborador_correo', c.correo
               )
             ) FILTER (WHERE c.id IS NOT NULL) as colaboradores_asignados
      FROM calendario_onboardings co
      LEFT JOIN asignaciones a ON co.id = a.evento_id AND a.completado = false
      LEFT JOIN colaboradores c ON a.colaborador_id = c.id
      WHERE co.fecha_inicio >= CURRENT_DATE + 6 * INTERVAL '1 day'
      AND co.fecha_inicio <= CURRENT_DATE + 8 * INTERVAL '1 day'
      AND co.activo = true
      GROUP BY co.id
      ORDER BY co.fecha_inicio ASC
    `;
    const resultado = await pool.query(query);
    return resultado.rows;
  }

  static async actualizar(id, datosActualizados) {
    const campos = [];
    const valores = [];
    let contador = 1;

    Object.keys(datosActualizados).forEach(key => {
      if (datosActualizados[key] !== undefined) {
        campos.push(`${key} = $${contador}`);
        valores.push(datosActualizados[key]);
        contador++;
      }
    });

    if (campos.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    valores.push(id);

    const query = `
      UPDATE calendario_onboardings 
      SET ${campos.join(', ')}
      WHERE id = $${contador}
      RETURNING *
    `;

    const resultado = await pool.query(query, valores);
    return resultado.rows[0];
  }

  static async eliminar(id) {
    const query = `DELETE FROM calendario_onboardings WHERE id = $1 RETURNING *`;
    const resultado = await pool.query(query, [id]);
    return resultado.rows[0];
  }

  static async desactivar(id) {
    const query = `
      UPDATE calendario_onboardings 
      SET activo = false
      WHERE id = $1
      RETURNING *
    `;
    const resultado = await pool.query(query, [id]);
    return resultado.rows[0];
  }

  static async activar(id) {
    const query = `
      UPDATE calendario_onboardings 
      SET activo = true
      WHERE id = $1
      RETURNING *
    `;
    const resultado = await pool.query(query, [id]);
    return resultado.rows[0];
  }

  static async obtenerPorRangoFechas(fechaInicio, fechaFin) {
    const query = `
      SELECT * FROM calendario_onboardings 
      WHERE fecha_inicio >= $1 AND fecha_fin <= $2
      AND activo = true
      ORDER BY fecha_inicio ASC
    `;
    const resultado = await pool.query(query, [fechaInicio, fechaFin]);
    return resultado.rows;
  }

  static async obtenerDelAnio(anio) {
    const query = `
      SELECT * FROM calendario_onboardings 
      WHERE EXTRACT(YEAR FROM fecha_inicio) = $1
      AND activo = true
      ORDER BY fecha_inicio ASC
    `;
    const resultado = await pool.query(query, [anio]);
    return resultado.rows;
  }
}

module.exports = CalendarioOnboarding;