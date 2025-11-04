const { Request } = require('../../../models');

function generateRandomCode(length = 4) {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}

const insertItemsRequest = async (model) => {
  const newEmployee = await Request.create({
    code: generateRandomCode(),
    descriptions: model.descriptions,
    resumen: model.resumen,
    idEmployee: model.idEmployee,
  });
  return newEmployee;
};

module.exports = {
  insertItemsRequest
};
