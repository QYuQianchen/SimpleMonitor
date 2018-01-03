import latestTime from './helpers/latestTime'
import { increaseTimeTo, duration } from './helpers/increaseTime'
var fs = require('fs');

var Configuration = artifacts.require("./Configuration.sol");
var SingleHouse = artifacts.require("./SingleHouse.sol");
var SinglePV = artifacts.require("./SinglePV.sol");
var SingleBattery = artifacts.require("./SingleBattery.sol");
var Grid = artifacts.require("./Grid.sol");

var configuration = null;

var settings = require("./settings");
var config = settings.config;
var actions = settings.actions;

var inputs = require("./inputs").inputs;

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

function setup(callback) {
  return Configuration.deployed().then(function (instance) {
    configuration = instance;
    console.log("Starting to register devices...");
    return registerAll(config);
  }).then(function (result) {
    console.log("All participants registered");
    console.log("Starting to get contract addresses...");
    return getAllContractAddresses(config);
  }).then(function (result) {
    console.log("Got all contract addresses!");
    console.log("Starting to instatiate contracts...");
    for (var device_type in config) {
      for (var device_id in config[device_type]) {
        (function (element) {
          if (element.device_type == "house" || element.device_type == "pv" || element.device_type == "grid" || element.device_type == "battery") {
            element.contract = contracts[element.device_type].at(element.contract_address);
          }
        })(config[device_type][device_id]);
      }
    }
    return configuration.getAdmin.call()
  }).then(function (result) {
    console.log("Contracts instantiated!");
    console.log("Contract Creator = ", result);
    console.log("Linking devices:");
    return linkDevices(config);
  }).then(function () {
    console.log("Linking of devices done.");
    if (callback != undefined) callback();
  });
}

function step(_jumpTime, period, callback) {
  var currentStep = 0;
  jumpTime(_jumpTime).then(function(result) {
    console.log("Increasing blocktime by " + _jumpTime + " seconds...");
    return checkStep();
  }).then(function (result) {
    currentStep = result.toNumber();
    console.log("\n===================\nSystem is at step " + currentStep + "\n===================");

    var stepPromises = [];

    for (var deviceType in actions) {
      if (actions[deviceType][currentStep] != undefined) {

        for (var deviceId in config[deviceType]) {

          var deviceActionPromises = [];

          for (var currentAction in actions[deviceType][currentStep]) {

            var element = config[deviceType][deviceId];
            var action = actions[deviceType][currentStep][currentAction];

            // Check whether input is available for the current action
            var input = undefined;
            if (inputs[deviceType] != undefined) {
              if (inputs[deviceType][deviceId] != undefined) {
                if (inputs[deviceType][deviceId][actionInputs[action]] != undefined) {
                  if (inputs[deviceType][deviceId][actionInputs[action]][period] != undefined) {
                    input = inputs[deviceType][deviceId][actionInputs[action]][period];
                  }
                }
              }
            }

            console.log(element.device_name + " executing " + action + "()");
            if (input != undefined) {
              deviceActionPromises.push(execute(element, action, input));
            } else {
              if (element.contract[action] != undefined) {
                if (deviceActionPromises.length == 0) {
                  deviceActionPromises.push(element.contract[action]({ from: element.address, gas: 210000000 }));
                } else {
                  deviceActionPromises.push(deviceActionPromises[currentAction-1].then(element.contract[action]({ from: element.address, gas: 210000000 })));
                }
              }
            }

          }

          // console.log("\n\n" + deviceType + deviceId);
          for (var i in deviceActionPromises) {
            // console.log(deviceActionPromises[i]);
            stepPromises.push(deviceActionPromises[i]);
          }

        }
      } else {
        console.log(deviceType + " --> nothing to do at this step");
      }
    }
    return Promise.all(stepPromises);
  }).then(function(result) {
    console.log("All actions for step " + currentStep + " done...");
    if (callback != undefined) callback();
  });
}


function execute(element, action, input) {
  if (element.contract[action] != undefined) {
    if (action == "setConsumption" || action == "setProduction" || action == "setVolume") {
      var executePromise = element.contract[action](input, { from: element.address });
    } else if (action == "setPrice") {
      if (element.device_type == "battery" || element.device_type == "grid") {
        var executePromise = element.contract[action](input[0], input[1], { from: element.address });
      } else {
        var executePromise = element.contract[action](input, { from: element.address });
      }
    }
  }
  return executePromise;
}

function checkStep() {
  // we use house0 (could be any element in theory) to check the time step of the system....
  return config.house[0].contract.getTimerStatus.call();
}

function getNow() {
  // we use house0 (could be any element in theory) to check the time of the system....
  return config.house[0].contract.getNow.call();
}

async function jumpTime(a) {
  await increaseTimeTo(latestTime() + duration.seconds(a));
}

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

      // CLOSURE CONTEXT
      (function (element) {
        if (element.device_type == "house" || element.device_type == "pv" || element.device_type == "grid" || element.device_type == "battery") {
          getContractAddressPromises.push(getContractAddress(element).then(function (result) {
            element.contract_address = result;
          }));
        }

      })(config[device_type][device_id]);
    }
  }

  // CHECK COLLECTED PROMISES
  return Promise.all(getContractAddressPromises)
}

function linkDevices(_config) {
  var linkDevicesPromises = [];

  for (var house_id in _config.house) {
    for (var pv_id in _config.pv) {
      console.log("Linking house[" + house_id + "] with pv[" + pv_id + "]");
      linkDevicesPromises.push(configuration.linkDevices(_config.house[house_id].address, _config.pv[pv_id].address, { from: _config.admin[0].address, gas: 2000000 }));
    }
  }
  return Promise.all(linkDevicesPromises);
}

function getAllValues(_config) {
  var getValuePromises = [];

  for (var device_type in _config) {
    for (var device_id in _config[device_type]) {
      (function (element) {

        if (element.contract != undefined && element.contract.getConsumption != undefined) {
          getValuePromises.push(element.contract.getConsumption.call().then(function(result) {
            console.log(element.device_name + " getConsumption() --> " + result);
            element.values.consumption.push(result);
          }));
        }

        if (element.contract != undefined && element.contract.getProduction != undefined) {
          getValuePromises.push(element.contract.getProduction.call().then(function(result) {
            console.log(element.device_name + " getProduction() --> " + result);
            element.values.production.push(result);
          }));
        }

        if (element.contract != undefined && element.contract.getPrice != undefined) {
          getValuePromises.push(element.contract.getPrice.call().then(function(result) {
            console.log(element.device_name + " getPrice() --> " + result);
            element.values.price.push(result);
          }));
        }

        if (element.contract != undefined && element.contract.getWallet != undefined) {
          getValuePromises.push(element.contract.getWallet.call().then(function(result) {
            console.log(element.device_name + " getWallet() --> " + result);
            element.values.wallet.push(result);
          }));
        }

      })(_config[device_type][device_id]);
    }
  }
  return Promise.all(getValuePromises)
}

function prepareConfig(_config, _accounts) {
  var i = 0;
  for (var deviceType in _config) {
    for (var deviceId in config[deviceType]) {
      (function (element) {
        element.device_name = deviceType + element.id;
        element.device_type = deviceType;
        element.address = _accounts[i];

        element.values = {};
        element.values.consumption = [];
        element.values.production = [];
        element.values.price = [];
        element.values.wallet = [];

        console.log("Prepared " + element.device_name);
        i++;
      })(config[deviceType][deviceId]);
    }
  }
}

function saveData(data) {
  var jsonData = JSON.stringify(data);
  fs.writeFile("./test.json", jsonData, function(err) {
      if(err) {
          return console.log(err);
      }
  });
}

contract('Configuration', function(accounts) {
  var virtualTime;
  prepareConfig(config, accounts);


  console.log("\n\nStarting step 0...");
  setup(function() {
    console.log("\n===========\nSTEP0 DONE!\n===========\n");

    var counter = 0;
    var steps = 5;
    var period = 0;
    var maxPeriods = 3;

    console.log("\n\nStarting step 1...");
    // step1(function() {
    step(0, 0, function() {
      console.log("\n===========\nSTEP1 DONE!\n===========\n");
      counter++;
      stepper();
      function stepper() {
        period = (counter-counter%steps)/steps;
        console.log("Now in period " + period);
        step(15.5, period, function() {
          getAllValues(config).then(function() {

            counter++;
            console.log("Stepper done. Counter:" + counter);
            if (counter < (maxPeriods * steps)) {
              stepper();
            } else {
              console.log("DONE.");
              saveData(config);
            }

          });
        })
      }


    });
  });


    // console.log("\n\nStarting step 1...");
    // // step1(function() {
    // step(0, 0, function() {
    //   console.log("\n===========\nSTEP1 DONE!\n===========\n");
    //
    //
    //   console.log("\n\nStarting step 2...");
    //   // step(16, function() {
    //   step(16, 0, function() {
    //     console.log("\n===========\nSTEP2 DONE!\n===========\n");
    //
    //
    //     console.log("\nStarting step 3...");
    //     // step(16, function() {
    //     step(15, 0, function() {
    //       console.log("\n===========\nSTEP3 DONE!\n===========\n");
    //
    //
    //       console.log("\nStarting step 4...");
    //       // step(16, function() {
    //       step(15, 0, function() {
    //         getAllValues(config);
    //         console.log("\n===========\nSTEP4 DONE!\n===========\n");
    //
    //
    //         console.log("\nStarting step 5...");
    //         step(15, 0, function() {
    //           getAllValues(config);
    //           console.log("\n===========\nSTEP5 DONE!\n===========\n");
    //
    //
    //         });
    //       });
    //     });
    //   });
    // });


});
