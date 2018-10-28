const axios = require('axios');
const bigInt = require('big-integer');
const { isNil } = require('lodash');

const { parseTxData } = require('../../data/util/parseData');
const upsert = require('../../data/util/upsert');
const { snakeCaseObj } = require('../../data/util/case');

const ETHERSCAN_API_URL = 'http://api.etherscan.io/api';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const getData = (module, action, address) =>
  axios.get(ETHERSCAN_API_URL, {
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
const getTransactions = async address =>
  Promise.all([
    getTransaction(address, 'txlist'),
    getTransaction(address, 'txlistinternal'),
    getTransaction(address, 'tokentx')
  ]).then(async ([normalTx, internalTx, tokenTx]) => {
    const transactions = [...normalTx, ...internalTx, ...tokenTx];

    // Note: For production this needs to be handled more efficiently
    for (const transaction of transactions) {
      await upsert('transactions', snakeCaseObj(transaction), ['hash']);
    }

    return {
      normalTx,
      internalTx,
      tokenTx
    };
  });

const filterValidTokens = t =>
  !isNil(t.tokenDecimal) &&
  t.tokenDecimal !== '0' &&
  !isNil(t.tokenSymbol) &&
  !isNil(t.contractAddress) &&
  !isNil(t.value);

const getReadableBalance = (balance, tokenDecimal) => {
  if (!bigInt.isInstance(balance)) {
    balance = bigInt(balance);
  }

  const divider = Number(`1e${tokenDecimal}`);
  const { quotient, remainder } = balance.divmod(divider);

  const decimals = remainder / divider;

  return quotient + decimals;
};
const getBalances = async (address, tokenTx = []) => {
  // Get ether balance from API to avoid having to calculate gas usage and internal tx
  const { data } = await getData('account', 'balance', address);

  // Found no balance for account;
  if (data.status !== '1') {
    return null;
  }

  const balanceEth = {
    address,
    tokenName: 'ETH',
    balance: getReadableBalance(data.result, 18)
  };

  const tokenBalancesObj = tokenTx
    .filter(filterValidTokens)
    .reduce((memo, tx) => {
      const { contractAddress } = tx;
      // Start with 0 tokens
      if (!memo[contractAddress]) {
        memo[contractAddress] = {
          balance: bigInt(0),
          tokenSymbol: tx.tokenSymbol,
          tokenDecimal: tx.tokenDecimal
        };
      }

      if (tx.to === address) {
        memo[contractAddress].balance = memo[contractAddress].balance.add(
          bigInt(tx.value)
        );
      }

      if (tx.from === address) {
        memo[contractAddress].balance = memo[contractAddress].balance.subtract(
          bigInt(tx.value)
        );
      }

      return memo;
    }, {});

  const balances = [
    balanceEth,
    ...Object.values(tokenBalancesObj).map(
      ({ balance, tokenSymbol, tokenDecimal }) => ({
        address,
        tokenName: tokenSymbol,
        balance: getReadableBalance(balance, tokenDecimal)
      })
    )
  ].filter(b => b.balance > 0);

  for (const balance of balances) {
    await upsert('balances', snakeCaseObj(balance), ['address', 'token_name']);
  }

  return balances;
};

const resolvers = {
  Query: {
    account: async (_, { address }) => {
      const { normalTx, internalTx, tokenTx } = await getTransactions(address);

      const balances = await getBalances(address, tokenTx);

      return {
        balances,
        transactions: normalTx.concat(internalTx, tokenTx)
      };
    }
  }
};

module.exports = resolvers;
