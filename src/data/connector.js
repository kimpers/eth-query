const knex = require('knex');
const knexfile = require('../../knexfile');

const { NODE_ENV } = process.env;

module.exports = knex(knexfile[NODE_ENV || 'development']);
