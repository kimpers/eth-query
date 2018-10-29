const axios = require('axios');

const ETHERSCAN_API_URL = 'http://api.etherscan.io/api';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const getEtherscanData = (module, action, address) =>
  axios.get(ETHERSCAN_API_URL, {
    params: {
      module,
      action,
      address,
      apiKey: ETHERSCAN_API_KEY
    }
  });

module.exports = {
  getEtherscanData
};
