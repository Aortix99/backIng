const { insertItemsUser } = require('../repository/insert-user-repository');
const Joi = require('joi');

const insertUserSchema = Joi.object({
  name: Joi.string().min(3).required().messages({
    'string.min': 'El nombre debe tener al menos 3 caracteres'}),
  role: Joi.boolean().optional(),
  email: Joi.string().email().pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/).required().messages({
    'string.email': 'El correo debe tener un formato válido',
    'string.pattern.base': 'El correo debe ser una dirección @gmail.com',
    'string.empty': 'El correo es obligatorio',
    'any.required': 'El correo es obligatorio'
  }),
  password: Joi.string().min(6).required()
});

const insertUser = async (req, res) => {
  const { error } = insertUserSchema.validate(req.body.model);
  if(error){
    return res.status(400).json({ message: error.details[0].message });
  }
    const { model } = req.body; 
    try {
    const employee = await insertItemsUser(model);
    res.status(201).json(employee);
  } catch (error) {
    console.error('❌ Error al crear el usuario:', error);
    res.status(500).json({ message: 'No se pudo crear el usuario' });
  }
};
module.exports = { insertUser };
