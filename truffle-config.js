require('babel-register');
require('babel-polyfill');

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 9000000000000000,
      gasPrice: 1
    }
  },

  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};
