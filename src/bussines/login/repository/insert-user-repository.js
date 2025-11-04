const { User } = require('../../../models');
const bcrypt = require('bcryptjs');

const insertItemsUser = async (model) => {
  const newEmployee = await User.create({
    name: model.name,
    password: bcrypt.hashSync(model.password, 10),
    role: model.role,
    email: model.email,
    createdAt: model.createdAt || new Date()
  });
  return newEmployee;
};

module.exports = {
  insertItemsUser
};
