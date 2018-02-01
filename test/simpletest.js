import latestTime from './helpers/latestTime'
import increaseTime, { increaseTimeTo, duration } from './helpers/increaseTime'

var Configuration = artifacts.require("./Configuration.sol");
var SingleHouse = artifacts.require("./SingleHouse.sol");
var SinglePV = artifacts.require("./SinglePV.sol");
var SingleBattery = artifacts.require("./SingleBattery.sol");
var SingleWaterTank = artifacts.require("./SingleWaterTank.sol");
var SingleHeatPump = artifacts.require("./SingleHeatPump.sol");
var Grid = artifacts.require("./Grid.sol");

var contracts = {
  "house": artifacts.require("./SingleHouse.sol"),
  "pv": artifacts.require("./SinglePV.sol"),
  "battery": artifacts.require("./SingleBattery.sol"),
  "grid": artifacts.require("./Grid.sol"),
  "watertank": artifacts.require("./SingleWaterTank.sol"),
  "heatpump": artifacts.require("./SingleHeatPump.sol")
};

var category_nums = {
  "house": 0,
  "pv": 1,
  "battery": 2,
  "grid": 5,
  "watertank": 4,
  "heatpump": 3
};

var actionInputs = {
  "setConsumption" : "consumption",
  "setConsumptionH" : "consumptionH",
  "setProduction" : "production",
  "setPrice" : "price",
  // "setVolume" : "volume"
};

var configuration = null;

var simpleinputs = require("./simpleinput");
var config = simpleinputs.config;
var actions = simpleinputs.actions;
var inputs = simpleinputs.inputs;
var checkStatusActions = simpleinputs.checkStatusActions;


contract('simpletest', function(accounts) {

  var i = 0;
  for (var device_type in config) {
    for (var device_id in config[device_type]) {
      (function (element) {
        element.device_name = device_type + element.id;
        element.device_type = device_type;
        element.address = accounts[i];
        console.log("Device name: " + element.device_name +", account No. :" + i);
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

    }).then(function (result) {

      console.log("All participants registered");
      console.log("Starting to get contract addresses...");

      return getAllContractAddresses(config);

    }).then(function (result) {

      console.log("Got all contract addresses!");
      console.log("Starting to instatiate contracts...");

      for (device_type in config) {
        for (device_id in config[device_type]) {

          (function (element) {
            // console.log("--> instatiating now...");
            // console.log(element.device_type, " at address",element.contract_address);
            if (element.device_type == "house" || element.device_type == "pv" || element.device_type == "grid" || element.device_type == "heatpump") {
              element.contract = contracts[element.device_type].at(element.contract_address);
            } else if (element.device_type == "battery" || element.device_type == "watertank") {
              element.contract = contracts[element.device_type].at(element.contract_address);
              // here we set the initial volume of batterys and watertanks
              element.contract.setVolume(element.volume, {from: config.admin[0].address}); //{from: element.address}
            } 
          })(config[device_type][device_id]);
        }
      }

      
      return configuration.getGridAdr.call()

    }).then(function (result) {
      console.log("Contracts instantiated!");
      console.log("Contract Creator = ", result);

      console.log("Linking devices:");

      return linkDevices(config);
    }).then(function (result) {
      
      console.log("Linking of devices done.");
      console.log("Here we are starting the 1st round...");
      
      return checkStep.call();
    }).then(function (result) {
      var currentStep = result.toNumber();
      console.log("We are at step: ", currentStep + " / 1");
      
      return step(0,currentStep);
    }).then(function (result) {
      console.log("Step 1 done.");

    }).then(function (result) {
      return getGasConsump();
      
    }).then(function (result) {

      return checkAllDeviceStatus();

    }).then(function (result) {
      console.log("checking stauts done.");

      jumpTime(20);
    }).then(function (result) {
      return getNow();
    }).then(function (result) {
      console.log("Current timestamp is: ", result.toNumber());
      return checkStep.call();
    }).then(function (result) {
      var currentStep = result.toNumber();
      console.log("We are at step: ", currentStep + " / 2");
      return step(0,currentStep);
    }).then(function (result) {
      console.log("Step 2 done.");

    }).then(function (result) {
      return getGasConsump();
      
    }).then(function (result) {

      jumpTime(16);
    }).then(function (result) {
      return getNow();
    }).then(function (result) {
      console.log("Current timestamp is: ", result.toNumber());
      return checkStep.call();
    }).then(function (result) {
      var currentStep = result.toNumber();
      console.log("We are at step: ", currentStep + " / 3");
      return step(0,currentStep);
    }).then(function (result) {
      console.log("Step 3 done.");

      jumpTime(16);
    }).then(function (result) {
      return getNow();
    }).then(function (result) {
      console.log("Current timestamp is: ", result.toNumber());
      return checkStep.call();
    }).then(function (result) {
      var currentStep = result.toNumber();
      console.log("We are at step: ", currentStep + " / 4");
      return step(0,currentStep);
    }).then(function (result) {
      console.log("Step 4 done.");

      jumpTime(16);
    }).then(function (result) {
      return getNow();
    }).then(function (result) {
      console.log("Current timestamp is: ", result.toNumber());
      return checkStep.call();
    }).then(function (result) {
      var currentStep = result.toNumber();
      console.log("We are at step: ", currentStep + " / 5");
      return step(0,currentStep);
    }).then(function (result) {
      console.log("Step 5 done.");

      return checkAllDeviceStatus();

    }).then(function (result) {
      console.log("checking stauts done.");
      console.log("We should start the 2nd round...");

      jumpTime(16);
    }).then(function (result) {
      return getNow();
    }).then(function (result) {
      console.log("Current timestamp is: ", result.toNumber());
      return checkStep.call();
    }).then(function (result) {
      var currentStep = result.toNumber();
      console.log("We are at step: ", currentStep + " / 1");
      return step(1,currentStep);
    }).then(function (result) {
      console.log("Step 1 done.");

    });
  });
});

function register(element) {
  console.log("Registering " + element.device_type + " " + element.id);
  console.log("adding device type " + element.device_type + " --> " + category_nums[element.device_type]);

  if (element.device_type == "grid") {
    var addPromise = configuration.addGrid(element.address, { from: config.admin[0].address, gas: 2000000 });
  } else if (element.device_type == "battery") {
    var addPromise = configuration.addDevice(category_nums[element.device_type], element.address, element.capacity, true, { from: config.admin[0].address, gas: 2000000 });
  } else if (element.device_type == "heatpump") {
    var addPromise = configuration.addDevice(category_nums[element.device_type], element.address, element.watertype, true, { from: config.admin[0].address, gas: 2000000 });
  } else if (element.device_type == "watertank") {
    var addPromise = configuration.addDevice(category_nums[element.device_type], element.address, element.capacity, element.watertype, { from: config.admin[0].address, gas: 2000000 });
  } else {
    var addPromise = configuration.addDevice(category_nums[element.device_type], element.address, 0, true, { from: config.admin[0].address, gas: 2000000 });
  }

  return addPromise;
}

function registerAll(_config) {
  var registerPromises = [];
  for (var device_type in _config) {
    for (var device_id in _config[device_type]) {
      (function (element) {
        if (element.device_type == "house" || element.device_type == "pv" || element.device_type == "grid" || element.device_type == "battery" || element.device_type == "heatpump" || element.device_type == "watertank") {
          registerPromises.push(register(element));
        }
      })(_config[device_type][device_id]);
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
        if (element.device_type == "house" || element.device_type == "pv" || element.device_type == "grid" || element.device_type == "battery" || element.device_type == "heatpump" || element.device_type == "watertank") {
            getContractAddressPromises.push(getContractAddress(element).then(function (result) {
            element.contract_address = result;
            console.log(element.device_name, result);
          }));
        }

      })(_config[device_type][device_id]);
    }
  }

  return Promise.all(getContractAddressPromises)
}

function linkDevices(_config) {
  var linkDevicesPromises = [];

  // linking house0 with pv0
  var house_id = 0;
  var pv_id = 0;
  console.log("Linking house[" + house_id + "] with pv[" + pv_id + "]");
  linkDevicesPromises.push(configuration.linkDevices(_config.house[house_id].address, _config.pv[pv_id].address, { from: _config.admin[0].address, gas: 2000000 }));
  
  // linking house1,2 with pv1,2
  var house_list = [1,2];
  var pv_list = [1,2];
  for (house_id in house_list) {
    for (pv_id in pv_list) {
        console.log("Linking house[" + house_list[house_id] + "] with pv[" + pv_list[pv_id] + "]");
        linkDevicesPromises.push(configuration.linkDevices(_config.house[house_list[house_id]].address, _config.pv[pv_list[pv_id]].address, { from: _config.admin[0].address, gas: 2000000 }));
      }
    }

  // linking battery0 with house0,2
  console.log("Linking battery[0] with house[0]");
  linkDevicesPromises.push(configuration.linkDevices(_config.house[0].address, _config.battery[0].address, { from: _config.admin[0].address, gas: 2000000 }));
  console.log("Linking battery[0] with house[2]");
  linkDevicesPromises.push(configuration.linkDevices(_config.house[2].address, _config.battery[0].address, { from: _config.admin[0].address, gas: 2000000 }));
  // linking battery0 with pv0
  console.log("Linking battery[0] with pv[0]");
  linkDevicesPromises.push(configuration.linkDevices(_config.pv[0].address, _config.battery[0].address, { from: _config.admin[0].address, gas: 2000000 }));

  // linking the heating network
    // let's try a simple one first
      for (let i = 0; i < 3; i++) {
        console.log("Linking house[" + i + "] with watertank[" + i + "]");
        linkDevicesPromises.push(configuration.linkDevices(_config.house[i].address, _config.watertank[i].address, { from: _config.admin[0].address, gas: 2000000 }));
        console.log("Linking watertank[" + i + "] with heatpump[" + i + "]");
        linkDevicesPromises.push(configuration.linkDevices(_config.heatpump[i].address, _config.watertank[i].address, { from: _config.admin[0].address, gas: 2000000 }));
        console.log("Linking pv[" + i + "] with heatpump[" + i + "]");
        linkDevicesPromises.push(configuration.linkDevices(_config.heatpump[i].address, _config.pv[i].address, { from: _config.admin[0].address, gas: 2000000 }));

      }
    // link one battery with hp
    console.log("Linking battery[0] with heatpump[0]");
    linkDevicesPromises.push(configuration.linkDevices(_config.battery[0].address, _config.heatpump[0].address, { from: _config.admin[0].address, gas: 2000000 }));
  

  // console.log("Linking watertank[0] with house[0]");
  // linkDevicesPromises.push(configuration.linkDevices(_config.house[0].address, _config.watertank[0].address, { from: _config.admin[0].address, gas: 2000000 }));
  // console.log("Linking watertank[1] with house[0]");
  // linkDevicesPromises.push(configuration.linkDevices(_config.house[0].address, _config.watertank[1].address, { from: _config.admin[0].address, gas: 2000000 }));
  // console.log("Linking watertank[2] with house[1]");
  // linkDevicesPromises.push(configuration.linkDevices(_config.house[1].address, _config.watertank[2].address, { from: _config.admin[0].address, gas: 2000000 }));
  // console.log("Linking watertank[3] with house[2]");
  // linkDevicesPromises.push(configuration.linkDevices(_config.house[2].address, _config.watertank[3].address, { from: _config.admin[0].address, gas: 2000000 }));

  return Promise.all(linkDevicesPromises);
}

function checkStep() {
  // we use house0 (could be any element in theory) to check the time step of the system....
  return configuration.getTime.call({from: config.admin[0].address, gas: 2000000});
}

function step(period, currentStep) {
  var stepPromises = [];

  // for (var device_type in _inputs) {
  //   for (var device_id in _inputs[device_type]) {
  //     for (var action_type in _inputs[device_type][device_id]) {
  //       console.log("Setting" + device_type + "[" + device_id + "]: set " + action_type + ", with value of " + _inputs[device_type][device_id][action_type][0]);
  //       step1Promises.push();
  //     }
  //   }
  // }
  if (currentStep == 1) {

    for (var device_type in actions) {

      if (actions[device_type][currentStep] != undefined) {
        for (var currentAction in actions[device_type][currentStep]) {
          for (var device_id in config[device_type]) {
            // var period = 0;
            var element = config[device_type][device_id];
            var action = actions[device_type][currentStep][currentAction];
            var input = inputs[device_type][device_id][actionInputs[actions[device_type][currentStep][currentAction]]][period];

            (function(_element, _action, _input) {
              console.log("Executing " + _action + "(" + _input + ") <-- " + _element.device_name);
              stepPromises.push(execute(_element, _action, _input).then(function (result) {
                console.log(_element.device_name + " doing " + _action + " is done");
              }));
            })(element, action, input);
          }
        }
      } else {
        console.log("Nothing to do at this step <-- " + device_type);
      }
    }
    console.log("That is all we need to do in step " + currentStep);
  } else {
    for (var device_type in actions) {

      if (actions[device_type][currentStep] != undefined) {
        for (var currentAction in actions[device_type][currentStep]) {
          // var stepPromises = [];
          for (var device_id in config[device_type]) {
            // var period = 0;
            var element = config[device_type][device_id];
            var action = actions[device_type][currentStep][currentAction];
            // var account = element.address;
            // var name = element.device_name;
            // var input = inputs[device_type][device_id][actionInputs[actions[device_type][currentStep][currentAction]]][period];
            (function(_element, _action) {
              console.log("Executing " + _action + " <-- " + _element.device_name);
              stepPromises.push(_element.contract[_action]({ from: _element.address, gas: 6712300}).then(function (result) {
                console.log(_element.device_name + " has passed through <--" + _action);
              }));
            })(element, action);
          }
        }
      } else {
        console.log("Nothing to do at this step <-- " + device_type);
      }
    }
  }

  return Promise.all(stepPromises)
}

function execute(element, action, input) {
  // var action = "set"+ action_type.substr(1,1).toUpperCase() + action_type.slice(1,action_type.length);
  // console.log(" -- the action that we will take is: "+ action + ".");

  if (element.contract[action] != undefined) {
    if (action == "setConsumption" || action == "setProduction" || action == "setVolume") {
      var executePromise = element.contract[action](input, { from: element.address });
    } else if (action == "setPrice") {
      if (element.device_type == "battery" || element.device_type == "grid") {
        var executePromise = element.contract[action](input[0], input[1], { from: element.address, gas: 2000000});
      } else {
        var executePromise = element.contract[action](input, { from: element.address, gas: 2000000});
      }
    } else if (action == "setConsumptionH" ) {
      var executePromise = element.contract[action](input[0], input[1], { from: element.address, gas: 2000000});
    }
  }
  return executePromise;
}  

function checkAllDeviceStatus() {
  var allDeviceStatusPromises = [];
  console.log("------------------------------------\n Current Status of All Devices\n------------------------------------");

  for (var device_type in config) {
    for (var device_id in config[device_type]) {
      for (var action_id in checkStatusActions[device_type]) {
        (function (element) {
          if (checkStatusActions[element.device_type] != undefined) {
            var action = checkStatusActions[element.device_type][action_id];
            var name = action.slice(3,action.length);
            
            allDeviceStatusPromises.push(element.contract[action].call({from:config.admin[0].address}).then(function (result) {
              
              if (result[0] != undefined) {
                if (action == "getConsumptionH") {
                  console.log(" -> the " + name + " of " + element.device_name + " is:", result[0].toNumber(), result[1].toNumber());
                } else {
                  console.log(" -> the " + name + " of " + element.device_name + " is:", result[0].toNumber());
                }
              } else {
                console.log(" -> the " + name + " of " + element.device_name + " is:", result.toNumber());
              }
            }));
          }
        })(config[device_type][device_id]);
      }
    }
  }
  return Promise.all(allDeviceStatusPromises)

}

function jumpTime(a) {
  return increaseTimeTo(latestTime() + duration.seconds(a),{from:config.admin[0].address});
}

function getNow() {
  return configuration.getNow.call({from:config.admin[0].address});
}

function getGasConsump() {
  for (let i = 5; i < 9; i++) {
    console.log("account " + i + " has " + web3.eth.getBalance(web3.eth.accounts[i]).toNumber());
  }
}