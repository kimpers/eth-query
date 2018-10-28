const { gql } = require('apollo-server-express');

const typeDefs = gql`
  union Transaction = NormalTransaction | InternalTransaction | TokenTransaction

  type NormalTransaction {
    blockNumber: String
    timeStamp: String
    hash: String
    nonce: String
    blockHash: String
    transactionIndex: String
    from: String
    to: String
    value: String
    gas: String
    gasPrice: String
    isError: String
    txreceipt_status: String
    input: String
    contractAddress: String
    cumulativeGasUsed: String
    gasUsed: String
    confirmations: String
  }

  type InternalTransaction {
      blockNumber: String
      timeStamp: String
      hash: String
      from: String
      to: String
      value: String
      contractAddress: String
      input: String
      type: String
      gas: String
      gasUsed: String
      traceId: String
      isError: String
      errCode: String
  }

  type TokenTransaction {
    blockNumber: String
    timeStamp: String
    hash: String
    nonce: String
    blockHash: String
    from: String
    contractAddress: String
    to: String
    value: String
    tokenName: String
    tokenSymbol: String
    tokenDecimal: String
    transactionIndex: String
    gas: String
    gasPrice: String
    gasUsed: String
    cumulativeGasUsed: String
    input: String
    confirmations: String
  }

  type Query {
    transactions(address: String!): [Transaction!]
  }
`;

module.exports = typeDefs;
