// Etherscan seems to communicate lack of value with an empty string
const isDefined = value => typeof value !== 'undefined' && value.length > 0;

// Parse value  if it exists otherwise return undefined to avoid setting key on object
const maybeStr = value => isDefined(value) ? value : undefined;

const parseTxData = tx => ({
  txType: maybeStr(tx.txType),
  blockNumber: maybeStr(tx.blockNumber),
  timeStamp: maybeStr(tx.timeStamp),
  hash: maybeStr(tx.hash),
  nonce: maybeStr(tx.nonce),
  blockHash: maybeStr(tx.blockHash),
  transactionIndex: maybeStr(tx.transactionIndex),
  from: maybeStr(tx.from),
  to: maybeStr(tx.to),
  value: maybeStr(tx.value),
  gas: maybeStr(tx.gas),
  gasPrice: maybeStr(tx.gasPrice),
  isError: maybeStr(tx.isError),
  txReceiptStatus: maybeStr(tx.txreceipt_status), // Assumption: snake case is mistake that snuck into prod
  input: maybeStr(tx.input),
  contractAddress: maybeStr(tx.contractAddress),
  cumulativeGasUsed: maybeStr(tx.cumulativeGasUsed),
  gasUsed: maybeStr(tx.gasUsed),
  confirmations: maybeStr(tx.confirmations),
  type: maybeStr(tx.type),
  traceId: maybeStr(tx.traceId),
  errCode: maybeStr(tx.errCode),
  tokenName: maybeStr(tx.tokenName),
  tokenSymbol: maybeStr(tx.tokenSymbol),
  tokenDecimal: maybeStr(tx.tokenDecimal)
});

module.exports = {
  parseTxData
};
