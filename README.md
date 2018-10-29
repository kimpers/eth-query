# Etherscan Query GraphQL
Quick proof of concept project for querying Etherscan using GraphQL queries and storing information in a DB. Get an account's transactions and balances.

## Getting started
A docker-compose file has been setup for the project. To get started:
 
1. Obtain an Etherscan API key at https://etherscan.io/apis
2. Copy .env.sample to .env and insert Etherscan key
3. Simply type `docker-compose up` in project root folder

GraphiQL interface: [http://localhost:3000/graphql](http://localhost:3000/graphql)

Example query
```graphql
query {
  account(address: "0x0") {
    balances {
      tokenName
      balance
    }
    transactions {
      blockNumber
      timeStamp
      hash
      nonce
      blockHash
      transactionIndex
      from
      to
      value
      gas
      gasPrice
      contractAddress
      cumulativeGasUsed
      gasUsed
      confirmations
      tokenName
      tokenSymbol
      tokenDecimal
    }
  }
}
```
