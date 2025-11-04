const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../../../models');
const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/).required().messages({
    'string.email': 'El correo debe tener un formato válido',
    'string.pattern.base': 'El correo debe ser una dirección @gmail.com',
    'string.empty': 'El correo es obligatorio',
    'any.required': 'El correo es obligatorio'
  }),
  password: Joi.string().min(6).required()
});

const loginUser = async (req, res) => {
  const { error } = loginSchema.validate(req.body.model);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { email, password } = req.body.model;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const passwordMatch = bcrypt.compareSync(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

module.exports = { loginUser };
