const { isNil, uniqWith } = require('lodash');

const knex = require('../../data/connector');
const { getEtherscanData } = require('./util.js');
const { snakeCaseObj } = require('../../util');

// Etherscan seems to communicate lack of value with an empty string
const isDefined = value => !isNil(value) && value.length > 0;

// Parse value  if it exists otherwise return undefined to avoid setting key on object
const maybeStr = value => (isDefined(value) ? value : undefined);

// Clean up empty string values in response
const parseTxData = tx =>
  Object.entries(tx).reduce((memo, [key, value]) => {
    const parsedValue = maybeStr(value);

    // Assumption: snake case is mistake that snuck into prod
    if (key === 'txreceipt_status') {
      memo['txReceiptStatus'] = parsedValue;
    } else {
      memo[key] = parsedValue;
    }

    return memo;
  }, {});

const txTypeMapping = {
  txlist: 'normal',
  txlistinternal: 'internal',
  tokentx: 'token'
};

const getTransaction = async (address, txType) => {
  const { data } = await getEtherscanData('account', txType, address);

  // Nothing found return empty array;
  if (data.status === '0') {
    return [];
  }

  return data.result.map(r => ({
    ...parseTxData(r),
    txType: txTypeMapping[txType]
  }));
};

// Note: This will miss some transactions if the account has made over 10000 transactions of any type
// but this edge case is ignored to keep scope down
const getTransactions = async address =>
  Promise.all([
    getTransaction(address, 'txlist'),
    getTransaction(address, 'txlistinternal'),
    getTransaction(address, 'tokentx')
  ]).then(async ([normalTx, internalTx, tokenTx]) => {
    const transactions = normalTx.concat(internalTx, tokenTx);

    const txHashesInDb = await knex('transactions')
      .pluck('hash')
      .then(transactions => new Set(transactions));

    // Filter out any tx already in DB too keep query effiecient
    // upserting here can get too slow from sheer amount of transactions
    const newTransactions = transactions.filter(t => !txHashesInDb.has(t.hash));

    // Filter out any duplicates tx results and turn into snake_case
    const uniqTransactionsCased = uniqWith(
      newTransactions,
      (a, b) => a.hash === b.hash
    ).map(snakeCaseObj);

    const transactionsInsertPromise = knex.batchInsert(
      'transactions',
      uniqTransactionsCased
    );

    return {
      normalTx,
      internalTx,
      tokenTx,
      transactionsInsertPromise
    };
  });

module.exports = getTransactions;
