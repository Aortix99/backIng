const { Request } = require('../../../models');

const getItems = async (pagination = {}) => {
  const { page = 1, limit = 10 } = pagination;
  const offset = (page - 1) * limit;

  const { count, rows } = await Request.findAndCountAll({
    limit,
    offset,
    order: [['id', 'DESC']],
  });

  const totalPages = Math.ceil(count / limit);

  return {
    totalItems: count,
    totalPages,
    currentPage: page,
    data: rows
  };
};

module.exports = {
  getItems
};
