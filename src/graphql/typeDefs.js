const { gql } = require('apollo-server-express');

const typeDefs = gql`
  enum TxType {
   normal
   internal
   token
  }

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
    txreceipt_status: String
    input: String
    contractAddress: String
    cumulativeGasUsed: String
    gasUsed: String
    confirmations: String
  }
  type Query {
    transactions(address: String! txType: TxType): [Transaction!]
  }
`;

module.exports = typeDefs;
