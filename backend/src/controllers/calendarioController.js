const CalendarioOnboarding = require('../models/CalendarioOnboarding');

class CalendarioController {
  static async crear(req, res) {
    try {
      const datosEvento = req.body;
      const nuevoEvento = await CalendarioOnboarding.crear(datosEvento);
      
      res.status(201).json({
        mensaje: 'Evento creado exitosamente',
        evento: nuevoEvento
      });
    } catch (error) {
      console.error('Error al crear evento:', error);
      res.status(500).json({ 
        error: 'Error al crear evento',
        detalle: error.message 
      });
    }
  }

  static async obtenerTodos(req, res) {
    try {
      const eventos = await CalendarioOnboarding.obtenerTodos();
      
      res.status(200).json({
        total: eventos.length,
        eventos
      });
    } catch (error) {
      console.error('Error al obtener eventos:', error);
      res.status(500).json({ 
        error: 'Error al obtener eventos',
        detalle: error.message 
      });
    }
  }

  static async obtenerActivos(req, res) {
    try {
      const eventos = await CalendarioOnboarding.obtenerActivos();
      
      res.status(200).json({
        total: eventos.length,
        eventos
      });
    } catch (error) {
      console.error('Error al obtener eventos activos:', error);
      res.status(500).json({ 
        error: 'Error al obtener eventos activos',
        detalle: error.message 
      });
    }
  }

  static async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const evento = await CalendarioOnboarding.obtenerPorId(id);
      
      if (!evento) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }
      
      res.status(200).json({ evento });
    } catch (error) {
      console.error('Error al obtener evento:', error);
      res.status(500).json({ 
        error: 'Error al obtener evento',
        detalle: error.message 
      });
    }
  }

  static async obtenerPorTipo(req, res) {
    try {
      const { tipo } = req.params;
      const eventos = await CalendarioOnboarding.obtenerPorTipo(tipo);
      
      res.status(200).json({
        total: eventos.length,
        tipo,
        eventos
      });
    } catch (error) {
      console.error('Error al obtener eventos por tipo:', error);
      res.status(500).json({ 
        error: 'Error al obtener eventos por tipo',
        detalle: error.message 
      });
    }
  }

  static async obtenerProximos(req, res) {
    try {
      const dias = parseInt(req.query.dias) || 7;
      const eventos = await CalendarioOnboarding.obtenerProximos(dias);
      
      res.status(200).json({
        total: eventos.length,
        dias,
        eventos
      });
    } catch (error) {
      console.error('Error al obtener próximos eventos:', error);
      res.status(500).json({ 
        error: 'Error al obtener próximos eventos',
        detalle: error.message 
      });
    }
  }

  static async obtenerParaAlertas(req, res) {
    try {
      const eventos = await CalendarioOnboarding.obtenerParaAlertas();
      
      res.status(200).json({
        total: eventos.length,
        eventos
      });
    } catch (error) {
      console.error('Error al obtener eventos para alertas:', error);
      res.status(500).json({ 
        error: 'Error al obtener eventos para alertas',
        detalle: error.message 
      });
    }
  }

  static async actualizar(req, res) {
    try {
      const { id } = req.params;
      const datosActualizados = req.body;
      
      const eventoActualizado = await CalendarioOnboarding.actualizar(id, datosActualizados);
      
      if (!eventoActualizado) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }
      
      res.status(200).json({
        mensaje: 'Evento actualizado exitosamente',
        evento: eventoActualizado
      });
    } catch (error) {
      console.error('Error al actualizar evento:', error);
      res.status(500).json({ 
        error: 'Error al actualizar evento',
        detalle: error.message 
      });
    }
  }

  static async eliminar(req, res) {
    try {
      const { id } = req.params;
      const eventoEliminado = await CalendarioOnboarding.eliminar(id);
      
      if (!eventoEliminado) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }
      
      res.status(200).json({
        mensaje: 'Evento eliminado exitosamente',
        evento: eventoEliminado
      });
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      res.status(500).json({ 
        error: 'Error al eliminar evento',
        detalle: error.message 
      });
    }
  }

  static async desactivar(req, res) {
    try {
      const { id } = req.params;
      const eventoDesactivado = await CalendarioOnboarding.desactivar(id);
      
      if (!eventoDesactivado) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }
      
      res.status(200).json({
        mensaje: 'Evento desactivado exitosamente',
        evento: eventoDesactivado
      });
    } catch (error) {
      console.error('Error al desactivar evento:', error);
      res.status(500).json({ 
        error: 'Error al desactivar evento',
        detalle: error.message 
      });
    }
  }

  static async activar(req, res) {
    try {
      const { id } = req.params;
      const eventoActivado = await CalendarioOnboarding.activar(id);
      
      if (!eventoActivado) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }
      
      res.status(200).json({
        mensaje: 'Evento activado exitosamente',
        evento: eventoActivado
      });
    } catch (error) {
      console.error('Error al activar evento:', error);
      res.status(500).json({ 
        error: 'Error al activar evento',
        detalle: error.message 
      });
    }
  }

  static async obtenerDelAnio(req, res) {
    try {
      const { anio } = req.params;
      const eventos = await CalendarioOnboarding.obtenerDelAnio(parseInt(anio));
      
      res.status(200).json({
        total: eventos.length,
        anio: parseInt(anio),
        eventos
      });
    } catch (error) {
      console.error('Error al obtener eventos del año:', error);
      res.status(500).json({ 
        error: 'Error al obtener eventos del año',
        detalle: error.message 
      });
    }
  }

  static async obtenerPorRango(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;
      
      if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({ 
          error: 'Se requieren fecha_inicio y fecha_fin como parámetros de consulta' 
        });
      }
      
      const eventos = await CalendarioOnboarding.obtenerPorRangoFechas(fecha_inicio, fecha_fin);
      
      res.status(200).json({
        total: eventos.length,
        fecha_inicio,
        fecha_fin,
        eventos
      });
    } catch (error) {
      console.error('Error al obtener eventos por rango:', error);
      res.status(500).json({ 
        error: 'Error al obtener eventos por rango',
        detalle: error.message 
      });
    }
  }
}

module.exports = CalendarioController;