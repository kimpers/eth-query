const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Transaction {
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
    txReceiptStatus: String
    input: String
    contractAddress: String
    cumulativeGasUsed: String
    gasUsed: String
    confirmations: String

    type: String
    traceId: String
    errCode: String

    tokenName: String
    tokenSymbol: String
    tokenDecimal: String
  }

  type Balance {
    tokenName: String
    balance: Float
  }

  enum TxType {
    normal
    internal
    token
  }

  type Account {
    balances(tokenName: String): [Balance!]
    transactions(txType: TxType, from: String, to: String): [Transaction!]
  }

  type Query {
    account(address: String!): Account
  }
`;

module.exports = typeDefs;
