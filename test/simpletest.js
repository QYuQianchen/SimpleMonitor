import latestTime from './helpers/latestTime'
import increaseTime, { increaseTimeTo, duration } from './helpers/increaseTime'

var Configuration = artifacts.require("./Configuration.sol");
var SingleHouse = artifacts.require("./SingleHouse.sol");
var SinglePV = artifacts.require("./SinglePV.sol");
var SingleBattery = artifacts.require("./SingleBattery.sol");
var Grid = artifacts.require("./Grid.sol");

var contracts = {
  "house": artifacts.require("./SingleHouse.sol"),
  "pv": artifacts.require("./SinglePV.sol"),
  "battery": artifacts.require("./SingleBattery.sol"),
  "grid": artifacts.require("./Grid.sol"),
};

var category_nums = {
  "house": 0,
  "pv": 1,
  "battery": 2,
  "grid": 3
};

var actionInputs = {
  "setConsumption" : "consumption",
  "setProduction" : "production",
  "setPrice" : "price",
  "setVolume" : "volume"
};

var configuration = null;

var simpleinputs = require("./simpleinput");
var config = simpleinputs.config;
var actions = simpleinputs.actions;
var inputs = simpleinputs.inputs;

var input_at_moment_0 = simpleinputs.input_at_moment;
var action_at_moment_1 = simpleinputs.action_at_moment_1;
var action_at_moment_2 = simpleinputs.action_at_moment_2;
var order_at_moment_3 = simpleinputs.sellEnergyOrder;
var order_at_moment_4 = simpleinputs.sellExcessOrder;


contract('simpletest', function(accounts) {

  var i = 0;
  for (var device_type in config) {
    for (var device_id in config[device_type]) {
      (function (element) {
        element.device_name = device_type + element.id;
        element.device_type = device_type;
        element.address = accounts[i];
        console.log("Device name: " + element.device_name);
        i++;
      })(config[device_type][device_id]);
    }
  }

  var virtualTime;

  it("I. Create 3 SingleHouse contracts and link to 3 SinglePVs", function () {
    return Configuration.deployed().then(function (instance) {
      configuration = instance;
      console.log("Starting to register devices...");

      return registerAll(config);

      console.log("All participants registered");
      console.log("Starting to get contract addresses...");

      return getAllContractAddresses(config);

    }).then(function (result) {

      console.log("Got all contract addresses!");
      console.log("Starting to instatiate contracts...");

      for (device_type in config) {
        for (device_id in config[device_type]) {

          (function (element) {
            console.log("--> instatiating now...");
            console.log(element.device_type, " at address",element.contract_address);
            if (element.device_type == "house" || element.device_type == "pv" || element.device_type == "grid" || element.device_type == "battery") {
              element.contract = contracts[element.device_type].at(element.contract_address);
            }

          })(config[device_type][device_id]);
        }
      }

      return configuration.getGridAdr.call()

    }).then(function (result) {
      console.log("Contracts instantiated!");
      console.log("Contract Creator = ", result);
      // console.log("Linking devices:");

      // return linkDevices(config);

    }).then(function () {
      // console.log("Linking of devices done.");

    });
  });
});

function register(element) {
  console.log("Registering " + element.device_type + " " + element.id);
  console.log("adding device type " + element.device_type + " --> " + category_nums[element.device_type]);

  if (element.device_type == "grid") {
    var addPromise = configuration.addGrid(element.address, { from: config.admin[0].address, gas: 2000000 });
  } else if (element.device_type != "battery") {
    var addPromise = configuration.addDevice(category_nums[element.device_type], element.address, 0, true, { from: config.admin[0].address, gas: 2000000 });
  } else {
    var addPromise = configuration.addDevice(category_nums[element.device_type], element.address, element.capacity, true, { from: config.admin[0].address, gas: 2000000 });
  }

  return addPromise;
}

function registerAll(_config) {
  var registerPromises = [];
  for (var device_type in _config) {
    for (var device_id in _config[device_type]) {
      (function (element) {
        if (element.device_type == "house" || element.device_type == "pv" || element.device_type == "grid" || element.device_type == "battery") {
          registerPromises.push(register(element));
        }
      })(config[device_type][device_id]);
    }
  }
  return Promise.all(registerPromises)
}

function getContractAddress(element) {
  if (element.device_type == "grid") {
    return configuration.getGridAdr.call();
  } else {
    return configuration.getContractAddress.call(element.address);
  }
}

function getAllContractAddresses(_config) {
  var getContractAddressPromises = [];

  for (var device_type in _config) {
    for (var device_id in _config[device_type]) {

      (function (element) {
        if (element.device_type == "house" || element.device_type == "pv" || element.device_type == "grid" || element.device_type == "battery") {
            getContractAddressPromises.push(getContractAddress(element).then(function (result) {
            element.contract_address = result;
            console.log(element.device_name, result);
          }));
        }

      })(_config[device_type][device_id]);
    }
  }
  
  // CHECK COLLECTED PROMISES
  return Promise.all(getContractAddressPromises)
}