const getTransactions = require('./transactions');
const getBalances = require('./balances');

const resolvers = {
  Account: {
    balances ({ balances }, { tokenName }) {
      if (tokenName) {
        return balances.filter(b => b.tokenName === tokenName);
      }

      return balances;
    },
    transactions ({ transactions }, filters) {
      const filterKeys = Object.keys(filters);
      if (filterKeys.length > 0) {
        return transactions.filter(t =>
          filterKeys.every(key => t[key] === filters[key])
        );
      }

      return transactions;
    }
  },
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
