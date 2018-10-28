const { isNil } = require('lodash');

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

module.exports = {
  parseTxData
};
