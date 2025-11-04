const { deleteRequestById } = require("../repository/delete-request-repository");
const Joi = require('joi');

const deleteRequestSchema = Joi.object({
  id: Joi.number().integer().required().messages({ 'any.required': 'El Id es obligatorio' })
});
const deleteRequest = async (req, res) => {
  const { model } = req.body;
  const {error} = deleteRequestSchema.validate(model);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const deleted = await deleteRequestById(model);
    if (!deleted) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }
    res.status(200).json({ message: 'Solicitud eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar la solicitud:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  deleteRequest
};
