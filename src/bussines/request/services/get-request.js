const { getItems } = require("../repository/get-Request-repository");

const getRequest = async (req, res) => {
  try {
    const response = await getItems(req.body.paginacion);
    res.status(200).json(response);

  } catch (error) {
    console.error('Error al obtener las solicitudes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { getRequest };
