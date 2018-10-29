const getTransactions = require('./transactions');
const getBalances = require('./balances');

const resolvers = {
  Query: {
    account: async (_, { address }) => {
      const {
        normalTx,
        internalTx,
        tokenTx,
        transactionsInsertPromise
      } = await getTransactions(address);

      const { balances, balancesUpsertPromise } = await getBalances(
        address,
        tokenTx
      );

      // Note: We don't necessarily need to wait for the db updates to finish
      // but since we don't have proper logging it's preferable to have
      // requests fail if the db operation fails
      await Promise.all([transactionsInsertPromise, balancesUpsertPromise]);

      return {
        balances,
        transactions: normalTx.concat(internalTx, tokenTx)
      };
    }
  }
};

module.exports = resolvers;
