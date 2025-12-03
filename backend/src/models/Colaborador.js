const pool = require('../config/database');

class Colaborador {
  static async crear(datosColaborador) {
    const {
      nombre_completo,
      correo,
      fecha_ingreso,
      onboarding_bienvenida = false,
      onboarding_tecnico = false,
      fecha_onboarding_tecnico = null,
      notas = ''
    } = datosColaborador;

    const query = `
      INSERT INTO colaboradores 
      (nombre_completo, correo, fecha_ingreso, onboarding_bienvenida, onboarding_tecnico, fecha_onboarding_tecnico, notas)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const valores = [
      nombre_completo,
      correo,
      fecha_ingreso,
      onboarding_bienvenida,
      onboarding_tecnico,
      fecha_onboarding_tecnico,
      notas
    ];

    const resultado = await pool.query(query, valores);
    return resultado.rows[0];
  }

  static async obtenerTodos() {
    const query = `
      SELECT 
        id,
        nombre_completo,
        correo,
        TO_CHAR(fecha_ingreso, 'YYYY-MM-DD') as fecha_ingreso,
        onboarding_bienvenida,
        onboarding_tecnico,
        TO_CHAR(fecha_onboarding_tecnico, 'YYYY-MM-DD') as fecha_onboarding_tecnico,
        notas,
        creado_en,
        actualizado_en
      FROM colaboradores
      ORDER BY fecha_ingreso DESC
    `;

    const resultado = await pool.query(query);
    return resultado.rows;
  }

  static async obtenerPorId(id) {
    const query = `
      SELECT 
        id,
        nombre_completo,
        correo,
        TO_CHAR(fecha_ingreso, 'YYYY-MM-DD') as fecha_ingreso,
        onboarding_bienvenida,
        onboarding_tecnico,
        TO_CHAR(fecha_onboarding_tecnico, 'YYYY-MM-DD') as fecha_onboarding_tecnico,
        notas,
        creado_en,
        actualizado_en
      FROM colaboradores 
      WHERE id = $1
    `;
    const resultado = await pool.query(query, [id]);
    return resultado.rows[0];
  }

  static async obtenerPorCorreo(correo) {
    const query = `SELECT * FROM colaboradores WHERE correo = $1`;
    const resultado = await pool.query(query, [correo]);
    return resultado.rows[0];
  }

  static async actualizar(id, datosActualizados) {
    const campos = [];
    const valores = [];
    let contador = 1;

    Object.keys(datosActualizados).forEach(key => {
      if (datosActualizados[key] !== undefined) {
        // Manejo especial para fecha_ingreso
        if (key === 'fecha_ingreso') {
          campos.push(`${key} = $${contador}::date`);
          valores.push(datosActualizados[key]);
        } else {
          campos.push(`${key} = $${contador}`);
          valores.push(datosActualizados[key]);
        }
        contador++;
      }
    });

    if (campos.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    campos.push(`actualizado_en = CURRENT_TIMESTAMP`);
    valores.push(id);

    const query = `
      UPDATE colaboradores 
      SET ${campos.join(', ')}
      WHERE id = $${contador}
      RETURNING 
        id,
        nombre_completo,
        correo,
        TO_CHAR(fecha_ingreso, 'YYYY-MM-DD') as fecha_ingreso,
        onboarding_bienvenida,
        onboarding_tecnico,
        TO_CHAR(fecha_onboarding_tecnico, 'YYYY-MM-DD') as fecha_onboarding_tecnico,
        notas,
        creado_en,
        actualizado_en
    `;

    const resultado = await pool.query(query, valores);
    return resultado.rows[0];
  }

  static async eliminar(id) {
    const query = `DELETE FROM colaboradores WHERE id = $1 RETURNING *`;
    const resultado = await pool.query(query, [id]);
    return resultado.rows[0];
  }

  static async completarOnboardingBienvenida(id) {
    const query = `
      UPDATE colaboradores 
      SET onboarding_bienvenida = true, actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const resultado = await pool.query(query, [id]);
    return resultado.rows[0];
  }

  static async completarOnboardingTecnico(id, fecha = null) {
    const fechaCompletado = fecha || new Date().toISOString().split('T')[0];
    const query = `
      UPDATE colaboradores 
      SET onboarding_tecnico = true, 
          fecha_onboarding_tecnico = $2,
          actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const resultado = await pool.query(query, [id, fechaCompletado]);
    return resultado.rows[0];
  }
  static async marcarIncompletoOnboardingBienvenida(id) {
  const query = `
    UPDATE colaboradores 
    SET onboarding_bienvenida = false, actualizado_en = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  const resultado = await pool.query(query, [id]);
  return resultado.rows[0];
}

static async marcarIncompletoOnboardingTecnico(id) {
  const query = `
    UPDATE colaboradores 
    SET onboarding_tecnico = false, 
        fecha_onboarding_tecnico = NULL,
        actualizado_en = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  const resultado = await pool.query(query, [id]);
  return resultado.rows[0];
}

  static async filtrarPorEstado(filtros) {
    let query = `
      SELECT 
        id,
        nombre_completo,
        correo,
        TO_CHAR(fecha_ingreso, 'YYYY-MM-DD') as fecha_ingreso,
        onboarding_bienvenida,
        onboarding_tecnico,
        TO_CHAR(fecha_onboarding_tecnico, 'YYYY-MM-DD') as fecha_onboarding_tecnico,
        notas,
        creado_en,
        actualizado_en
      FROM colaboradores 
      WHERE 1=1
    `;
    const valores = [];
    let contador = 1;

    if (filtros.onboarding_bienvenida !== undefined) {
      query += ` AND onboarding_bienvenida = $${contador}`;
      valores.push(filtros.onboarding_bienvenida);
      contador++;
    }

    if (filtros.onboarding_tecnico !== undefined) {
      query += ` AND onboarding_tecnico = $${contador}`;
      valores.push(filtros.onboarding_tecnico);
      contador++;
    }

    query += ` ORDER BY fecha_ingreso DESC`;

    const resultado = await pool.query(query, valores);
    return resultado.rows;
  }
}

module.exports = Colaborador;