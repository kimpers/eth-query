const bigInt = require('big-integer');
const { isNil } = require('lodash');

const { getEtherscanData } = require('./util');
const upsert = require('../../data/upsert');
const { snakeCaseObj } = require('../../util');

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
  const { data } = await getEtherscanData('account', 'balance', address);

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

  // No need to wait for this to finish, we can continue processing
  const balancesUpsertPromise = async () => {
    for (const balance of balances) {
      await upsert('balances', snakeCaseObj(balance), [
        'address',
        'token_name'
      ]);
    }
  };

  return {
    balances,
    balancesUpsertPromise: balancesUpsertPromise()
  };
};

module.exports = getBalances;
