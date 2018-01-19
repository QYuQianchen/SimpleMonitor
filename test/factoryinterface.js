var SingleHouseFactory = artifacts.require("SingleHouseFactory");
var Configuration = artifacts.require("Configuration");
var SingleHouse = artifacts.require("SingleHouse");

var config = {
  'admin': [
    {
      'accountAddress': 0
    }
  ],

  'grid': [
    {
      'accountAddress': 0
    }
  ],

  'house': [
    {
      'accountAddress': 0
    }
  ]
}
var configuration = undefined;

contract('Configuration', function(accounts) {

  config.admin[0].accountAddress = accounts[0];
  config.grid[0].accountAddress = accounts[1];
  config.house[0].accountAddress = accounts[2];

  Configuration.deployed().then(function(instance) {
    configuration = instance;

    return configuration.addGrid(config.grid[0].accountAddress);
  }).then(function(result) {

    console.log("TxHash: ");
    console.log(result)

    return configuration.getGridAdr.call();
  }).then(function(result) {
    console.log("Grid Address: " + result);

    return configuration.addDevice(0, config.house[0].accountAddress, 0, true, {from: config.admin[0].accountAddress, gas: 2000000});
  }).then(function(result) {

    console.log("TxHash: ");
    console.log(result)

    return configuration.getContractAddress.call(config.house[0].accountAddress);
  }).then(function(result) {
    console.log("House Contract Address: " + result);
    config.house[0].contractAddress = result;
    config.house[0].contract = SingleHouse.at(result);

    return config.house[0].contract.getTimerAddress.call();
  }).then(function(result) {
    console.log("Timer Address (from SingleHouse contract): " + result);

    return configuration.getTimer.call();
  }).then(function(result) {
    console.log("Global Timer address (from Configuration contract):" + result);


    return config.house[0].contract.getGridAdr.call();
  }).then(function(result) {
    console.log("Grid Address (from SingleHouse contract): " + result);

    return configuration.getGridAdr.call();
  }).then(function(result) {
    console.log("Grid Address (from Configuration contract): " + result);


    console.log("\n-----\ndone…\n-----\n");

  });

});
