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
var checkStatusActions = simpleinputs.checkStatusActions;

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
            // console.log("--> instatiating now...");
            // console.log(element.device_type, " at address",element.contract_address);
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
      console.log("Linking devices:");

      return linkDevices(config);

    }).then(function (result) {
      console.log("Linking of devices done.");
      console.log("1. Time to set production and price");

      return checkStep.call();
    }).then(function (result) {
      var currentStep = result.toNumber();
      console.log("We are at step: ", currentStep);
      
      return step(1);
    }).then(function (result) {
      console.log("Step 1 done.");
      return checkAllDeviceStatus();

    }).then(function (result) {
      console.log("checking stauts done.");

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

  return Promise.all(getContractAddressPromises)
}

function linkDevices(_config) {
  var linkDevicesPromises = [];

  // for (var house_id in _config.house) {
  //   for (var pv_id in _config.pv) {
  //     console.log("Linking house[" + house_id + "] with pv[" + pv_id + "]");
  //     linkDevicesPromises.push(configuration.linkDevices(_config.house[house_id].address, _config.pv[pv_id].address, { from: _config.admin[0].address, gas: 2000000 }));
  //   }
  // }

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
  return Promise.all(linkDevicesPromises);
}

function checkStep() {
  // we use house0 (could be any element in theory) to check the time step of the system....
  return configuration.getTime.call({from: config.admin[0].address, gas: 2000000});
}

function step(currentStep) {
  var stepPromises = [];

  // for (var device_type in _inputs) {
  //   for (var device_id in _inputs[device_type]) {
  //     for (var action_type in _inputs[device_type][device_id]) {
  //       console.log("Setting" + device_type + "[" + device_id + "]: set " + action_type + ", with value of " + _inputs[device_type][device_id][action_type][0]);
  //       step1Promises.push();
  //     }
  //   }
  // }

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
            stepPromises.push(execute(_element, _action, _input));
          })(element, action, input);
        }
      }
    } else {
      console.log("Nothing to do at this step <-- " + device_type);
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
        var executePromise = element.contract[action](input[0], input[1], { from: element.address });
      } else {
        var executePromise = element.contract[action](input, { from: element.address });
      }
    }
  }
  return executePromise;
}  

function checkDeviceStatus(element) {
  for (var action in checkStatusActions[element.device_type]) {
    (function(_element, _action) {
      console.log("Doing " + _action + " of " + _element.device_name);
      return element.contract[action]({from: element.address })
    })(element, action);
  }
}

function checkAllDeviceStatus() {
  var allDeviceStatusPromises = [];

  for (var device_type in config) {
    for (var device_id in config[device_type]) {
      (function (element) {
        allDeviceStatusPromises.push(checkDeviceStatus(element).then(function (result) {
          console.log("   , the value is: " + result[0].toNumber());
        }));
      })(_config[device_type][device_id]);

      // for (var action in checkStatusActions[device_type]) {
      //   (function(_element, _action) {
      //     console.log(_action + " of " + _element.device_name);
      //     var statusPromise = element.contract[action]({from: element.address })
      //     allDeviceStatusPromises.push(statusPromise);
      //     stepPromises.push(execute(_element, _action, _input));
      //   })(element, action);
        
      // }

      // (function (element) {
      //   if (element.device_type == "pv") {
      //     getValuePromises.push(getValue(element).then(function (result) {
      //       console.log("The production of", element.device_name, "is ", result[0].toNumber());
      //       return getPrice(element);
      //     }).then(function (result) {
      //       console.log("The price of", element.device_name, "is ", result[0].toNumber());
      //     }));
      //   } else if (element.device_type == "house") {
      //     getValuePromises.push(getValue(element).then(function (result) {
      //       console.log("The consumption of", element.device_name, "is ", result[0].toNumber());
      //     }));
      //   } else if (element.device_type == "battery") {
      //     getValuePromises.push(getValue(element).then(function (result) {
      //       console.log("The consumption of", element.device_name, "is ", result.toNumber());
      //       return getPrice(element);
      //     }).then(function (result) {
      //       console.log("The selling price of", element.device_name, "is ", result[0].toNumber());
      //     }));
      //   } else if (element.device_type == "grid") {
      //     getValuePromises.push(getPrice(element).then(function (result) {
      //       console.log("The price of", element.device_name, "is ", result[0].toNumber());
      //     }));
      //   }
      // })(config[device_type][device_id]);
    }
  }
  return Promise.all(deviceStatusPromises)

}


// function takeAction(element) {
//   var addTakeActionPromise;
//   var takeActionPromise = [];
//   var config_element = config[element.device_type][element.device_id];

//   if (element.action == "askandsortprice") {
//     if (element.device_type == "house" || element.device_type == "battery") {
//       // addTakeActionPromise = config[element.device_type][element.device_id].contract.askForPrice({from: config[element.device_type][element.device_id].address});
//       //
//       // takeActionPromise.push(addTakeActionPromise.then(function(result){
//       //   addTakeActionPromise = config[element.device_type][element.device_id].contract.sortPrice({from: config[element.device_type][element.device_id].address});
//       //   takeActionPromise.push(addTakeActionPromise);
//       // }));

//       takeActionPromise.push(config_element.contract.askForPrice({from: config_element.address, gas: 2000000}).then(function(result) {
//         config_element.contract.sortPrice({from: config_element.address, gas: 2000000})
//       }));

//     }
//   } else if (element.action == "askandsortrank") {
//     if (element.device_type == "pv" || element.device_type == "battery") {
//       // addTakeActionPromise = config[element.device_type][element.device_id].contract.askForRank({from: config[element.device_type][element.device_id].address, gas: 2000000});
//       // takeActionPromise.push(addTakeActionPromise.then(function(result){
//       //   addTakeActionPromise = config[element.device_type][element.device_id].contract.sortRank({from: config[element.device_type][element.device_id].address, gas: 2000000});
//       //   takeActionPromise.push(addTakeActionPromise);
//       // }));

//       takeActionPromise.push(config_element.contract.askForRank({from: config_element.address, gas: 2000000}).then(function(result) {
//         config_element.contract.sortRank({from: config_element.address, gas: 2000000})
//       }));
//     }
//   } else if (element.action == "sellenergy") {
//     if (element.device_type == "pv" || element.device_type == "battery") {
//       addTakeActionPromise = config[element.device_type][element.device_id].contract.sellEnergy({from: config[element.device_type][element.device_id].address, gas: 2000000});
//       takeActionPromise.push(addTakeActionPromise);
//     }
//   } else if (element.action == "sellexcessenergy") {
//     if (element.device_type == "pv") {
//       addTakeActionPromise = config[element.device_type][element.device_id].contract.sellExcess({from: config[element.device_type][element.device_id].address, gas: 2000000});
//       takeActionPromise.push(addTakeActionPromise);
//     }
//   }
//   return takeActionPromise;
//   //return Promise.all(takeActionPromise)
// }