exports.up = function (knex, Promise) {
  return knex.schema.createTable('transactions', table => {
    table.increments();
    table.string('hash').unique();
    table.string('txType');
    table.string('blockNumber');
    table.string('timeStamp');
    table.string('nonce');
    table.string('blockHash');
    table.string('transactionIndex');
    table.string('from');
    table.string('to');
    table.string('value');
    table.string('gas');
    table.string('gasPrice');
    table.string('isError');
    table.string('txReceiptStatus');
    table.text('input');
    table.string('contractAddress');
    table.string('cumulativeGasUsed');
    table.string('gasUsed');
    table.string('confirmations');
    table.string('type');
    table.string('traceId');
    table.string('errCode');
    table.string('tokenName');
    table.string('tokenSymbol');
    table.string('tokenDecimal');
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('transactions');
};
