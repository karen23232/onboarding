const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class Usuario {
  static async crear(datosUsuario) {
    const {
      nombre_completo,
      correo,
      password,
      rol = 'colaborador'
    } = datosUsuario;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO usuarios 
      (nombre_completo, correo, password, rol)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nombre_completo, correo, rol, activo, creado_en
    `;

    const valores = [nombre_completo, correo, hashedPassword, rol];
    const resultado = await pool.query(query, valores);
    return resultado.rows[0];
  }

  static async obtenerPorCorreo(correo) {
    const query = `SELECT * FROM usuarios WHERE correo = $1`;
    const resultado = await pool.query(query, [correo]);
    return resultado.rows[0];
  }

  static async obtenerPorId(id) {
    const query = `
      SELECT id, nombre_completo, correo, rol, activo, ultimo_acceso, creado_en, actualizado_en
      FROM usuarios 
      WHERE id = $1
    `;
    const resultado = await pool.query(query, [id]);
    return resultado.rows[0];
  }

  static async obtenerTodos() {
    const query = `
      SELECT id, nombre_completo, correo, rol, activo, ultimo_acceso, creado_en, actualizado_en
      FROM usuarios 
      ORDER BY creado_en DESC
    `;
    const resultado = await pool.query(query);
    return resultado.rows;
  }

  static async verificarPassword(passwordPlano, passwordHash) {
    return await bcrypt.compare(passwordPlano, passwordHash);
  }

  static async actualizarUltimoAcceso(id) {
    const query = `
      UPDATE usuarios 
      SET ultimo_acceso = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, nombre_completo, correo, rol, ultimo_acceso
    `;
    const resultado = await pool.query(query, [id]);
    return resultado.rows[0];
  }

  static async actualizar(id, datosActualizados) {
    const campos = [];
    const valores = [];
    let contador = 1;

    if (datosActualizados.password) {
      const saltRounds = 10;
      datosActualizados.password = await bcrypt.hash(datosActualizados.password, saltRounds);
    }

    Object.keys(datosActualizados).forEach(key => {
      if (datosActualizados[key] !== undefined && key !== 'id' && key !== 'correo') {
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
      UPDATE usuarios 
      SET ${campos.join(', ')}
      WHERE id = $${contador}
      RETURNING id, nombre_completo, correo, rol, activo, actualizado_en
    `;

    const resultado = await pool.query(query, valores);
    return resultado.rows[0];
  }

  static async desactivar(id) {
    const query = `
      UPDATE usuarios 
      SET activo = false
      WHERE id = $1
      RETURNING id, nombre_completo, correo, activo
    `;
    const resultado = await pool.query(query, [id]);
    return resultado.rows[0];
  }

  static async activar(id) {
    const query = `
      UPDATE usuarios 
      SET activo = true
      WHERE id = $1
      RETURNING id, nombre_completo, correo, activo
    `;
    const resultado = await pool.query(query, [id]);
    return resultado.rows[0];
  }

  static async eliminar(id) {
    const query = `DELETE FROM usuarios WHERE id = $1 RETURNING id, nombre_completo, correo`;
    const resultado = await pool.query(query, [id]);
    return resultado.rows[0];
  }

  static async existeCorreo(correo) {
    const query = `SELECT EXISTS(SELECT 1 FROM usuarios WHERE correo = $1) as existe`;
    const resultado = await pool.query(query, [correo]);
    return resultado.rows[0].existe;
  }

  static async obtenerPorRol(rol) {
    const query = `
      SELECT id, nombre_completo, correo, rol, activo, ultimo_acceso, creado_en
      FROM usuarios 
      WHERE rol = $1
      ORDER BY nombre_completo ASC
    `;
    const resultado = await pool.query(query, [rol]);
    return resultado.rows;
  }
}

module.exports = Usuario;