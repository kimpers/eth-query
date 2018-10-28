exports.up = function (knex, Promise) {
  return knex.schema.createTable('balances', table => {
    table.string('address').notNullable();
    table.string('token_name').notNullable();
    table.string('balance').notNullable();

    table.unique(['address', 'token_name']);
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('balances');
};
