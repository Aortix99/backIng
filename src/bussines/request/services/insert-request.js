const { insertItemsRequest } = require("../repository/insert-request-repository");
const Joi = require('joi');

const requestSchema = Joi.object({
  descriptions: Joi.string()
    .max(50)
    .required()
    .messages({
      'string.base': 'La descripción debe ser una cadena de texto',
      'string.max': 'La descripción no debe exceder los 50 caracteres',
      'any.required': 'La descripción es obligatoria'
    }),

  resumen: Joi.string()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.base': 'El resumen debe ser una cadena de texto',
      'string.max': 'El resumen no debe exceder los 50 caracteres'
    }),

  idEmployee: Joi.number()
    .required()
    .messages({
      'number.base': 'El ID del empleado debe ser un número',
      'number.positive': 'El ID del empleado debe ser mayor que 0',
      'any.required': 'El ID del empleado es obligatorio'
    })
});

const insertRequest = async (req, res) => {
  const { model } = req.body;
  console.log('model=>', model);
const { error } = requestSchema.validate(model);
  console.log('quien es erro', error);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }; 
  try {
    const employee = await insertItemsRequest(model);
    res.status(201).json(employee);
  } catch (error) {
    console.error('❌ Error al crear la solicitud:', error);
    res.status(500).json({ message: 'No se pudo crear la solicitud' });
  }
};
module.exports = { insertRequest };
