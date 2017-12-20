import latestTime from './helpers/latestTime'
import { increaseTimeTo, duration } from './helpers/increaseTime'

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

var configuration = null;
var settings = require("./settings");

var config = settings.config;
var actions = settings.actions;

var inputs = require("./inputs").inputs;

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

function step0(callback) {
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


function step1(callback) {
  return checkStep().then(function (result) {
    var currentStep = result.toNumber();
    console.log("We are at step: ", result.toNumber());

    var setValuePromises = [];

    for (var device_type in actions) {

      if (actions[device_type][currentStep] != undefined) {
        for (var currentAction in actions[device_type][currentStep]) {
          for (var device_id in config[device_type]) {
            var period = 0;
            var element = config[device_type][device_id];
            var action = actions[device_type][currentStep][currentAction];
            var input = inputs[device_type][device_id][actionInputs[actions[device_type][currentStep][currentAction]]][period];

            (function(_element, _action, _input) {
              console.log("Executing " + _action + "(" + _input + ") <-- " + _element.device_name);
              setValuePromises.push(execute(_element, _action, _input));
            })(element, action, input);
          }
        }
      } else {
        console.log("Nothing to do at this step <-- " + device_type);
      }
    }

    return Promise.all(setValuePromises)

  }).then(function (result) {
    console.log("Setting values done...");
    console.log("Set all consumptions/productions/prices. \n === Here are the status of each device: ===");

    return getAllValues(config);

  }).then(function(result) {
    console.log("getvalues done...");
    if (callback != undefined) callback();
  });
}

function step2(callback) {
  jumpTime(16).then(function (result) {
    console.log("Here time is been increased (1)");
    return checkStep();
  }).then(function (result) {
    console.log("We are at step ", result.toNumber());

   var currentStep = result.toNumber();

    var step2Promises = [];

    for (var device_type in actions) {
      if (actions[device_type][currentStep] != undefined) {

        for (var device_id in config[device_type]) {
          var device_promises = [];

          for (var currentAction in actions[device_type][currentStep]) {

            var element = config[device_type][device_id];
            var action = actions[device_type][currentStep][currentAction];

            console.log("Executing " + action + "() <-- " + element.device_name);
            if (element.contract[action] != undefined) {
              if (device_promises.length == 0) {
                device_promises.push(element.contract[action]({ from: element.address }));
              } else {
                device_promises.push(device_promises[currentAction-1].then(element.contract[action]({ from: element.address })));
              }
            }
          }

          console.log("\n\n" + device_type + device_id);
          for (var i in device_promises) {
            console.log(device_promises[i]);
            step2Promises.push(device_promises[i]);
          }

        }


      } else {
        console.log("Nothing to do at this step <-- " + device_type);
      }
    }

    return Promise.all(step2Promises);
  }).then(function (result) {
    console.log("All price sorted");
    if (callback != undefined) callback();
  });
}


function step3(callback) {
  jumpTime(16).then(function (result) {
    console.log("Here time is been increased (2)");
    return checkStep();
  }).then(function (result) {
    console.log("We are at step ", result.toNumber());

    var currentStep = result.toNumber();
    var step3Promises = [];
    for (var device_type in actions) {
      if (actions[device_type][currentStep] != undefined) {
        for (var device_id in config[device_type]) {

          var device_promises = [];

          for (var currentAction in actions[device_type][currentStep]) {

            var element = config[device_type][device_id];
            var action = actions[device_type][currentStep][currentAction];

            console.log("Executing " + action + "() <-- " + element.device_name);
            if (element.contract[action] != undefined) {
              if (device_promises.length == 0) {
                device_promises.push(element.contract[action]({ from: element.address }));
              } else {
                device_promises.push(device_promises[currentAction-1].then(element.contract[action]({ from: element.address })));
              }
            }
          }

          console.log("\n\n" + device_type + device_id);
          for (var i in device_promises) {
            console.log(device_promises[i]);
            step3Promises.push(device_promises[i]);
          }
        }
      } else {
        console.log("Nothing to do at this step <-- " + device_type);
      }
    }

    return Promise.all(step3Promises);
  }).then(function (result) {
    console.log("All ranks sorted");
    if (callback != undefined) callback();
  });
}

function step4(callback) {
  jumpTime(16).then(function() {
    console.log("Here time is been increased (3)");
    return checkStep();
  }).then(function (result) {
    console.log("We are at step ", result.toNumber());
    var currentStep = result.toNumber();

    var step4Promises = [];
    for (var device_type in actions) {
      if (actions[device_type][currentStep] != undefined) {
        for (var device_id in config[device_type]) {

          var device_promises = [];

          for (var currentAction in actions[device_type][currentStep]) {

            var element = config[device_type][device_id];
            var action = actions[device_type][currentStep][currentAction];

            console.log("Executing " + action + "() <-- " + element.device_name);
            if (element.contract[action] != undefined) {
              if (device_promises.length == 0) {
                device_promises.push(element.contract[action]({ from: element.address }));
              } else {
                device_promises.push(device_promises[currentAction-1].then(element.contract[action]({ from: element.address })));
              }
            }
          }

          console.log("\n\n" + device_type + device_id);
          for (var i in device_promises) {
            console.log(device_promises[i]);
            step4Promises.push(device_promises[i]);
          }
        }
      } else {
        console.log("Nothing to do at this step <-- " + device_type);
      }
    }

    return Promise.all(step4Promises);
  }).then(function (result) {
    console.log("energy sold out");
    console.log("=== Here are the status of each device: ===");

    return getAllValues(config);
  }).then(function(result) {
    console.log("getvalues done...");
    if (callback != undefined) callback();
  });
}

function step5(callback) {
  jumpTime(16).then(function (result) {
    console.log("Here time is been increased (4)");
    return checkStep();
  }).then(function (result) {
    console.log("We are at step ", result.toNumber());
    var currentStep = result.toNumber();
    var step5Promises = [];

    for (var device_type in actions) {
      if (actions[device_type][currentStep] != undefined) {
        for (var device_id in config[device_type]) {

          var device_promises = [];

          for (var currentAction in actions[device_type][currentStep]) {

            var element = config[device_type][device_id];
            var action = actions[device_type][currentStep][currentAction];

            console.log("Executing " + action + "() <-- " + element.device_name);
            if (element.contract[action] != undefined) {
              if (device_promises.length == 0) {
                device_promises.push(element.contract[action]({ from: element.address }));
              } else {
                device_promises.push(device_promises[currentAction-1].then(element.contract[action]({ from: element.address })));
              }
            }
          }

          console.log("\n\n" + device_type + device_id);
          for (var i in device_promises) {
            console.log(device_promises[i]);
            step5Promises.push(device_promises[i]);
          }
        }
      } else {
        console.log("Nothing to do at this step <-- " + device_type);
      }
    }

    return Promise.all(step5Promises);
  }).then(function (result) {
    console.log("Excess energy sold");

    console.log("=== Here are the status of each device: ===");
    return getAllValues(config);
  }).then(function(result) {
    console.log("getvalues done...");
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
            console.log("getConsumption() --> " + element.device_name + " --> " + result);
          }));
        }

        if (element.contract != undefined && element.contract.getProduction != undefined) {
          getValuePromises.push(element.contract.getProduction.call().then(function(result) {
            console.log("getProduction() --> " + element.device_name + " --> " + result);
          }));
        }

        if (element.contract != undefined && element.contract.getPrice != undefined) {
          getValuePromises.push(element.contract.getPrice.call().then(function(result) {
            console.log("getPrice() --> " + element.device_name + " --> " + result);
          }));
        }

      })(_config[device_type][device_id]);
    }
  }
  return Promise.all(getValuePromises)
}

contract('Configuration', function (accounts) {

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


  it("I. Create 3 SingleHouse contracts and link to 3 SinglePVs", function() {

    console.log("\n\nStarting step 0...");
    step0(function() {
      console.log("\n===========\nSTEP0 DONE!\n===========\n");

      console.log("\n\nStarting step 1...");
      step1(function() {
        console.log("\n===========\nSTEP1 DONE!\n===========\n");


        console.log("\n\nStarting step 2...");
        step2(function() {
          console.log("\n===========\nSTEP2 DONE!\n===========\n");


          console.log("\nStarting step 3...");
          step3(function() {
            console.log("\n===========\nSTEP3 DONE!\n===========\n");


            console.log("\nStarting step 4...");
            step4(function() {
              console.log("\n===========\nSTEP4 DONE!\n===========\n");


              console.log("\nStarting step 5...");
              step5(function() {
                console.log("\n===========\nSTEP5 DONE!\n===========\n");


              });
            });
          });
        });
      });
    });
  });

});
