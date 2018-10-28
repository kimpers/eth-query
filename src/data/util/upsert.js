const knex = require('../connector');

// Assumption: We dont want duplicates of same TX in db
// but we want to keep it updated with newest information
// for production use there might be a performance concern
// with this approach
const upsert = (tableName, data, constraintColumn) => {
  const knexTable = knex(tableName);

  const insert = knexTable.insert(data);

  const update = knex.queryBuilder().update(data);
  return knex.raw(`? ON CONFLICT (${constraintColumn}) DO ?`, [insert, update]);
};

module.exports = upsert;
