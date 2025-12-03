const jwt = require('jsonwebtoken');
require('dotenv').config();

const generarToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
};

const verificarToken = (token) => {
  try {
    const secret = process.env.JWT_SECRET;
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generarToken,
  verificarToken
};