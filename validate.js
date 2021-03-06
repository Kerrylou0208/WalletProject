const Model = require('./models');

const validate = (decoded, request, callback) => {
  Model.users.findAll()
    .then((account) => {
      if (account.filter(user => (user.userId === decoded.userId)).length) {
        return callback(null, true);
      }
      return callback(null, false);
    });
};

module.exports = validate;
