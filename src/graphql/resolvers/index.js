const axios = require('axios');
const ETHERSCAN_API_URL = 'http://api.etherscan.io/api';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const TYPE_NORMAL_TX = 'NormalTransaction';
const TYPE_INTERNAL_TX = 'InternalTransaction';
const TYPE_TOKEN_TX = 'TokenTransaction';

const getTransaction = async (address, txType) => {
  const { data } = await axios.get(ETHERSCAN_API_URL, {
    params: {
      module: 'account',
      action: txType,
      address,
      apiKey: ETHERSCAN_API_KEY
    }
  });

  // Nothing found return empty array;
  if (data.status === '0') {
    return [];
  }

  return data.result;
};

const transactions = async (_, { address }) => Promise.all([
  getTransaction(address, 'txlist'),
  getTransaction(address, 'txlistinternal'),
  getTransaction(address, 'tokentx')
]).then(([ normalTx, internalTx, tokenTx ]) => [...normalTx, ...internalTx, ...tokenTx]);

const resolvers = {
  Transaction: {
    __resolveType (tx) {
      // Figure out if tx is Normal, Internal or Token type
      if (tx.type) {
        return TYPE_INTERNAL_TX;
      } else if (tx.tokenName) {
        return TYPE_TOKEN_TX;
      }

      return TYPE_NORMAL_TX;
    }
  },
  Query: {
    transactions
  }
};

module.exports = resolvers;
