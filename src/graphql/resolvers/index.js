const axios = require('axios');
const ETHERSCAN_API_URL = 'http://api.etherscan.io/api';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const TX_TYPE_MAPPING = {
  normal: 'txlist',
  internal: 'internal',
  token: 'tokentx'
};

const transactions = async (_, { address, txType }) => {
  const { data } = await axios.get(ETHERSCAN_API_URL, {
    params: {
      module: 'account',
      action: TX_TYPE_MAPPING[txType],
      address
    }
  });

  if (data.message !== 'OK') {
    console.log(data);
    throw new Error(`Non OK response from etherscan API`);
  }

  return data.result;
};

const resolvers = {
  Query: {
    transactions
  }
};

module.exports = resolvers;
