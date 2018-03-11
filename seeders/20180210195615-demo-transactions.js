module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('transactions', [{
    transactionId: 12345,
    fromId: 1,
    toId: 2,
    amount: 300,
    reason: 'mcdonalds',
    status: 'COMPLETED',
    timeStamp: new Date(),
    category: 'food',
    type: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }, {
    transactionId: 23456,
    fromId: 3,
    toId: 2,
    amount: 200,
    reason: 'black panther tickets',
    status: 'PENDING',
    timeStamp: new Date(),
    category: 'movie',
    type: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  }, {
    transactionId: 11212,
    fromId: 3,
    toId: 1,
    amount: 100,
    reason: 'flight tickets to delhi',
    status: 'PENDING',
    timeStamp: new Date(),
    category: 'travel',
    type: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  }, {
    transactionId: 11111,
    fromId: 2,
    toId: 1,
    amount: 100,
    reason: 'flight tickets to delhi',
    status: 'PENDING',
    timeStamp: new Date(),
    category: 'travel',
    type: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  }, {
    transactionId: 17111,
    fromId: 2,
    toId: 1,
    amount: 1000,
    reason: 'borrowed money',
    status: 'PENDING',
    timeStamp: new Date(),
    category: 'travel',
    type: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  ], {}),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('transactions', null, {}),
};
