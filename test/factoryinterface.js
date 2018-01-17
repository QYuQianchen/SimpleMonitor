var SingleHouseFactory = artifacts.require("SingleHouseFactory");
var Configuration = artifacts.require("Configuration");
var SingleHouse = artifacts.require("SingleHouse");

var config = {
  'admin': [
    {
      'accountAddress': 0
    }
  ],

  'house': [
    {
      'accountAddress': 0
    },
    {
      'accountAddress': 0
    }
  ]
}
var configuration = undefined;

contract('Configuration', function(accounts) {

  config.admin[0].accountAddress = accounts[0];
  config.house[0].accountAddress = accounts[1];
  config.house[1].accountAddress = accounts[2];

  Configuration.deployed().then(function(instance) {
    configuration = instance;

    return configuration.addGrid(config.house[0].accountAddress);
  }).then(function(result) {

    console.log("TxHash: ");
    console.log(result)

    return configuration.getGridAdr.call();
  }).then(function(result) {
    console.log("Grid Address: " + result);

    return configuration.addDevice(0, config.house[1].accountAddress, 0, true, {from: config.admin[0].accountAddress, gas: 2000000});
  }).then(function(result) {

    console.log("TxHash: ");
    console.log(result)

    return configuration.getContractAddress.call(config.house[1].accountAddress);
  }).then(function(result) {
    console.log("House Address: " + result);

    return configuration.getCAddress.call(config.house[1].accountAddress);
  }).then(function(result) {
    console.log("House Address (from function): " + result);

    configuration.playwithGeneralDevice_setAdr(config.house[1].accountAddress);
  // }).then(function(result) {
  //   console.log("Set up Global Timer?");
  //   console.log(result);

    return configuration.playwithGeneralDevice_getAdr.call(config.house[1].accountAddress);
  }).then(function(result) {
    console.log("Global Timer address (function):");
    console.log(result);

    return configuration.getTimer.call();
  }).then(function(result) {
    console.log("Global Timer address (parameter):" + result);

    console.log("\n-----\ndone…\n-----\n");

  });

});
