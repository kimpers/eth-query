const axios = require('axios');

const { parseTxData } = require('../../data/util/parseData');
const upsert = require('../../data/util/upsert');
const { snakeCaseObj } = require('../../data/util/case');

const ETHERSCAN_API_URL = 'http://api.etherscan.io/api';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const TYPE_NORMAL_TX = 'NormalTransaction';
const TYPE_INTERNAL_TX = 'InternalTransaction';
const TYPE_TOKEN_TX = 'TokenTransaction';

const getData = (module, action, address) => axios.get(ETHERSCAN_API_URL, {
  params: {
    module,
    action,
    address,
    apiKey: ETHERSCAN_API_KEY
  }
});

const getTransaction = async (address, txType) => {
  const { data } = await getData('account', txType, address);

  // Nothing found return empty array;
  if (data.status === '0') {
    return [];
  }

  return data.result.map(r => ({ ...parseTxData(r), txType }));
};

// Note: This will miss some transactions if the account has made over 10000 transactions of any type
// but this edge case is ignored to keep scope down
const getTransactions = async address => Promise.all([
  getTransaction(address, 'txlist'),
  getTransaction(address, 'txlistinternal'),
  getTransaction(address, 'tokentx')
]).then(async ([ normalTx, internalTx, tokenTx ]) => {
  const transactions = [...normalTx, ...internalTx, ...tokenTx];

  // Note: For production these should be batched
  for (const transaction of transactions) {
    await upsert('transactions', snakeCaseObj(transaction), [ 'hash' ]);
  }

  return transactions;
});

const getBalance = async address => {
  const { data } = await getData('account', 'balance', address);

  // Found no balance for account;
  if (data.status !== '1') {
    return null;
  }

  const balance = data.result;
  const balanceItem = { address, tokenName: 'ETH', balance };

  await upsert('balances', snakeCaseObj(balanceItem), [ 'address', 'token_name' ]);

  return data.result;
};

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
    account (_, { address }) {
      return Promise.all([
        getBalance(address),
        getTransactions(address)
      ]).then(([balance, transactions]) => ({
        balance,
        transactions
      }));
    }
  }
};

module.exports = resolvers;
