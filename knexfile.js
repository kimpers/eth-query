const { DATABASE_URL } = process.env;

module.exports = {
  development: {
    client: 'pg',
    connection: DATABASE_URL
  },

  production: {
    client: 'pg',
    connection: DATABASE_URL
  }
};
