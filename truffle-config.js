module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },

    QA: {
      host: "localhost",
      port: 8545,
      network_id: "3", // Ropsten
      // Options - gas, gasPrice, from
      from:"0x9144dab0440924391afd1c02af43defc9b1bb084"
    },

    PRODUCTION: {
      host: "localhost",
      port: 8545,
      network_id: "1" // LIVE
      // Options - gas, gasPrice, from
    }
  }
};
