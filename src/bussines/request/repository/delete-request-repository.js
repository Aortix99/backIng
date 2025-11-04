const { Request } = require('../../../models');

const deleteRequestById = async (model) => {
  const deletedCount = await Request.destroy({
    where: { id: model.id }
  });

  return deletedCount > 0;
};

module.exports = {
  deleteRequestById
};
