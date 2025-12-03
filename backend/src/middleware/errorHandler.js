const rutaNoEncontrada = (req, res, next) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    ruta: req.originalUrl,
    metodo: req.method
  });
};

const manejadorErrores = (err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const mensaje = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    error: mensaje,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  rutaNoEncontrada,
  manejadorErrores
};