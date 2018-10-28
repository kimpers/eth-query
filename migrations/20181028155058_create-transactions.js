exports.up = function (knex, Promise) {
  return knex.schema.createTable('transactions', table => {
    table.increments();
    table.string('hash').unique();
    table.string('tx_type');
    table.string('block_number');
    table.string('time_stamp');
    table.string('nonce');
    table.string('block_hash');
    table.string('transaction_index');
    table.string('from');
    table.string('to');
    table.string('value');
    table.string('gas');
    table.string('gas_price');
    table.string('is_error');
    table.string('tx_receipt_status');
    table.text('input');
    table.string('contract_address');
    table.string('cumulative_gas_used');
    table.string('gas_used');
    table.string('confirmations');
    table.string('type');
    table.string('trace_id');
    table.string('err_code');
    table.string('token_name');
    table.string('token_symbol');
    table.string('token_decimal');
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('transactions');
};
