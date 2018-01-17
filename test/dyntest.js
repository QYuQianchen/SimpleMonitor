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

var configuration = null;
var settings = require("./settings");

var config = settings.config;
var actions = settings.actions;

var inputs = require("./inputs").inputs;

console.log(actions);

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

var input_at_moment = [
  {
    "device_type": "house",
    "device_id": 0,
    "element": config.house[0],
    "action": "setconsumption",
    "value": 3
  },
  {
    "device_type": "house",
    "device_id": 1,
    "element": config.house[1],
    "action": "setconsumption",
    "value": 3
  },
  {
    "device_type": "house",
    "device_id": 2,
    "element": config.house[2],
    "action": "setconsumption",
    "value": 8
  },
  {
    "device_type": "pv",
    "device_id": 0,
    "element": config.pv[0],
    "action": "setproduction",
    "value": 5
  },
  {
    "device_type": "pv",
    "device_id": 1,
    "element": config.pv[1],
    "action": "setproduction",
    "value": 10
  },
  {
    "device_type": "pv",
    "device_id": 2,
    "element": config.pv[2],
    "action": "setproduction",
    "value": 10
  },
  {
    "device_type": "battery",
    "device_id": 0,
    "element": config.battery[0],
    "action": "setvolume",
    "value": 5
  },
  {
    "device_type": "battery",
    "device_id": 0,
    "element": config.battery[0],
    "action": "setconsumption",
    "value": 3
  },
  {
    "device_type": "pv",
    "device_id": 0,
    "element": config.pv[0],
    "action": "setprice",
    "value": 20
  },
  {
    "device_type": "pv",
    "device_id": 1,
    "element": config.pv[1],
    "action": "setprice",
    "value": 15
  },
  {
    "device_type": "pv",
    "device_id": 2,
    "element": config.pv[2],
    "action": "setprice",
    "value": 30
  },
  {
    "device_type": "battery",
    "device_id": 0,
    "element": config.battery[0],
    "action": "setprice",
    "value": [20, 3]
  },
  {
    "device_type": "grid",
    "device_id": 0,
    "element": config.grid[0],
    "action": "setprice",
    "value": [10, 1]
  }
];

var action_at_moment_1 = [
  {
    "device_type": "house",
    "device_id": 2,
    "action": "askandsortprice",
    "timelapse": 1      //15
  },
  {
    "device_type": "house",
    "device_id": 0,
    "action": "askandsortprice",
    "timelapse": 1
  },
  {
    "device_type": "house",
    "device_id": 1,
    "action": "askandsortprice",
    "timelapse": 2
  },
  {
    "device_type": "battery",
    "device_id": 0,
    "action": "askandsortprice",
    "timelapse": 3
  }
];

var action_at_moment_2 = [
  {
    "device_type": "pv",
    "device_id": 1,
    "action": "askandsortrank",
    "timelapse": 1      //15
  },
  {
    "device_type": "pv",
    "device_id": 0,
    "action": "askandsortrank",
    "timelapse": 1
  },
  {
    "device_type": "pv",
    "device_id": 2,
    "action": "askandsortrank",
    "timelapse": 2
  },
  {
    "device_type": "battery",
    "device_id": 0,
    "action": "askandsortrank",
    "timelapse": 3
  }
];


var sellEnergyOrder = [
  {
    "device_type": "pv",
    "device_id": 1,
    "action": "sellenergy",
    "timelapse": 1      //15
  },
  {
    "device_type": "pv",
    "device_id": 0,
    "action": "sellenergy",
    "timelapse": 1
  },
  {
    "device_type": "battery",
    "device_id": 0,
    "action": "sellenergy",
    "timelapse": 3
  },
  {
    "device_type": "pv",
    "device_id": 2,
    "action": "sellenergy",
    "timelapse": 2
  }
];

var sellExcessOrder = [
  {
    "device_type": "pv",
    "device_id": 2,
    "action": "sellexcessenergy",
    "timelapse": 1      //15
  }
];

function takeAction(element) {
  var addTakeActionPromise;
  var takeActionPromise = [];
  var config_element = config[element.device_type][element.device_id];

  if (element.action == "askandsortprice") {
    if (element.device_type == "house" || element.device_type == "battery") {
      // addTakeActionPromise = config[element.device_type][element.device_id].contract.askForPrice({from: config[element.device_type][element.device_id].address});
      //
      // takeActionPromise.push(addTakeActionPromise.then(function(result){
      //   addTakeActionPromise = config[element.device_type][element.device_id].contract.sortPrice({from: config[element.device_type][element.device_id].address});
      //   takeActionPromise.push(addTakeActionPromise);
      // }));

      takeActionPromise.push(config_element.contract.askForPrice({from: config_element.address, gas: 2000000}).then(function(result) {
        config_element.contract.sortPrice({from: config_element.address, gas: 2000000})
      }));

    }
  } else if (element.action == "askandsortrank") {
    if (element.device_type == "pv" || element.device_type == "battery") {
      // addTakeActionPromise = config[element.device_type][element.device_id].contract.askForRank({from: config[element.device_type][element.device_id].address, gas: 2000000});
      // takeActionPromise.push(addTakeActionPromise.then(function(result){
      //   addTakeActionPromise = config[element.device_type][element.device_id].contract.sortRank({from: config[element.device_type][element.device_id].address, gas: 2000000});
      //   takeActionPromise.push(addTakeActionPromise);
      // }));

      takeActionPromise.push(config_element.contract.askForRank({from: config_element.address, gas: 2000000}).then(function(result) {
        config_element.contract.sortRank({from: config_element.address, gas: 2000000})
      }));
    }
  } else if (element.action == "sellenergy") {
    if (element.device_type == "pv" || element.device_type == "battery") {
      addTakeActionPromise = config[element.device_type][element.device_id].contract.sellEnergy({from: config[element.device_type][element.device_id].address, gas: 2000000});
      takeActionPromise.push(addTakeActionPromise);
    }
  } else if (element.action == "sellexcessenergy") {
    if (element.device_type == "pv") {
      addTakeActionPromise = config[element.device_type][element.device_id].contract.sellExcess({from: config[element.device_type][element.device_id].address, gas: 2000000});
      takeActionPromise.push(addTakeActionPromise);
    }
  }
  return takeActionPromise;
  //return Promise.all(takeActionPromise)
}

function setValue(element) {
  if (element.action == "setconsumption") {
    var addSetValuePromise = config[element.device_type][element.device_id].contract.setConsumption(element.value, { from: config[element.device_type][element.device_id].address, gas: 2000000});
  } else if (element.action == "setproduction") {
    var addSetValuePromise = config[element.device_type][element.device_id].contract.setProduction(element.value, { from: config[element.device_type][element.device_id].address, gas: 2000000});
  } else if (element.action == "setvolume") {
    var addSetValuePromise = config[element.device_type][element.device_id].contract.setVolume(element.value, { from: config[element.device_type][element.device_id].address, gas: 2000000});
  } else if (element.action == "setprice") {
    if (element.device_type == "battery" || element.device_type == "grid") {
      var addSetValuePromise = config[element.device_type][element.device_id].contract.setPrice(element.value[0], element.value[1], { from: config[element.device_type][element.device_id].address, gas: 2000000});
    } else {
      var addSetValuePromise = config[element.device_type][element.device_id].contract.setPrice(element.value, { from: config[element.device_type][element.device_id].address, gas: 2000000});
    }
  }

  return addSetValuePromise;
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

function getValue(element) {
  // return singleHouse0.getConsumption.call();
  //return config.house[0].contract.getConsumption.call();
  if (element.device_type == "house" || element.device_type == "battery") {
    return element.contract.getConsumption.call();
  } else if (element.device_type == "pv") {
    return element.contract.getProduction.call();
  }
}

function getPrice(element) {
  // return singleHouse0.getConsumption.call();
  //return config.house[0].contract.getConsumption.call();
  if (element.device_type == "grid" || element.device_type == "pv") {
    return element.contract.getPrice.call();
  } else if (element.device_type == "battery") {
    return element.contract.getSalePrice.call();
  }
}

function checkStep() {
  // we use house0 (could be any element in theory) to check the time step of the system....
  return config.house[0].contract.getTimerStatus.call({from: config.house[0].address, gas: 2000000});
}

function getNow() {
  return config.house[0].contract.getNow.call({from: config.house[0].address, gas: 2000000});
}

function jumpTime(a) {
  return increaseTimeTo(latestTime() + duration.seconds(a));
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
    })
  });


  it("II. Set Production and price", function () {

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


      // for (var actionNo in input_at_moment) {
      //   (function (input) {
      //     console.log("Setting values and prices for " + input.element.device_name);
      //     setValuePromises.push(setValue(input));
      //   })(input_at_moment[actionNo]);
      // }

      return Promise.all(setValuePromises)

    }).then(function (result) {
      console.log("Setting values done...");
      console.log("Set all consumptions/productions/prices. \n === Here are the status of each device: ===");

      var getValuePromises = [];

      for (device_type in config) {
        for (device_id in config[device_type]) {
          (function (element) {
            if (element.device_type == "pv") {
              getValuePromises.push(getValue(element).then(function (result) {
                console.log("The consumption of", element.device_name, "is ", result[0].toNumber());
                return getPrice(element);
              }).then(function (result) {
                console.log("The price of", element.device_name, "is ", result[0].toNumber());
              }));
            } else if (element.device_type == "house") {
              getValuePromises.push(getValue(element).then(function (result) {
                console.log("The production of", element.device_name, "is ", result[0].toNumber());
              }));
            } else if (element.device_type == "battery") {
              getValuePromises.push(getValue(element).then(function (result) {
                console.log("The production of", element.device_name, "is ", result.toNumber());
                return getPrice(element);
              }).then(function (result) {
                console.log("The selling price of", element.device_name, "is ", result[0].toNumber());
              }));
            } else if (element.device_type == "grid") {
              getValuePromises.push(getPrice(element).then(function (result) {
                console.log("The price of", element.device_name, "is ", result[0].toNumber());
              }));
            }
          })(config[device_type][device_id]);
        }
      }
      return Promise.all(getValuePromises)

    }).then(function (result) {
      console.log("=== end of status ===");
    /*  return getNow();
    }).then(function (result) {
      console.log("Now is", result.toNumber());*/
    });
  });

  it("III. Price communication House<->PV (1. House ask for price info and sort)", function () {

    //var increaseTimePromise = increaseTimeTo(latestTime() + duration.seconds(15));
    //return increaseTimePromise.then(function (result) {
    jumpTime(16).then(function (result) {
      console.log("Here time is been increased (1)");
      return checkStep();
    }).then(function (result) {
      console.log("We are at step ", result.toNumber());

      var takeActionPromises1 = [];

      for (var actionNo in action_at_moment_1) {
        (function (element) {
  //        takeActionPromises1.push(jumpTime(element.timelapse));//);
          takeActionPromises1.push(takeAction(element));
        })(action_at_moment_1[actionNo]);
      }
      return Promise.all(takeActionPromises1);
    }).then(function (result) {
      console.log("All price sorted");
    });
  });

  it("III. Price communication House<->PV (2. PV collect Info)", function () {

    //var increaseTimePromise = increaseTimeTo(latestTime() + duration.seconds(20));
    jumpTime(16).then(function() {
      console.log("Here time is been increased (2)");
      return checkStep();
    }).then(function (result) {
      console.log("We are at step: ", result.toNumber());

      var takeActionPromises2 = [];

      for (var actionNo in action_at_moment_2) {
        (function (element) {   // async... not able to jumpTime in a loop...
          //await jumpTime(element.timelapse);
          //takeActionPromises2.push(jumpTime(element.timelapse));//);
          takeActionPromises2.push(takeAction(element));
        })(action_at_moment_2[actionNo]);
      }
      return Promise.all(takeActionPromises2);
    }).then(function (result) {
      console.log("All rank sorted");
    });
  });

  it("III. Price communication House<->PV (3. PV and Battery intiate Transaction)", function () {
    jumpTime(16).then(function() {
      console.log("Here time is been increased (3)");
      return checkStep();
    }).then(function (result) {
      console.log("We are at step ", result.toNumber());
      var sellEnergyPromises = [];

      for (var actionNo in sellEnergyOrder) {
        (function (element) {   // async... not able to jumpTime in a loop...
          //await jumpTime(element.timelapse);
          //takeActionPromises2.push(jumpTime(element.timelapse));//);
          sellEnergyPromises.push(takeAction(element));
        })(sellEnergyOrder[actionNo]);
      }
      return Promise.all(sellEnergyPromises);
    }).then(function (result) {
      console.log("energy sold out \n === Here are the status of each device: ===");

      var getValuePromises = [];

      for (device_type in config) {
        for (device_id in config[device_type]) {
          (function (element) {
            if (element.device_type == "pv") {
              getValuePromises.push(getValue(element).then(function (result) {
                console.log("The consumption of", element.device_name, "is ", result[0].toNumber());
                return getPrice(element);
              }).then(function (result) {
                console.log("The price of", element.device_name, "is ", result[0].toNumber());
              }));
            } else if (element.device_type == "house") {
              getValuePromises.push(getValue(element).then(function (result) {
                console.log("The production of", element.device_name, "is ", result[0].toNumber());
              }));
            } else if (element.device_type == "battery") {
              getValuePromises.push(getValue(element).then(function (result) {
                console.log("The production of", element.device_name, "is ", result.toNumber());
                return getPrice(element);
              }).then(function (result) {
                console.log("The selling price of", element.device_name, "is ", result[0].toNumber());
              }));
            } else if (element.device_type == "grid") {
              getValuePromises.push(getPrice(element).then(function (result) {
                console.log("The price of", element.device_name, "is ", result[0].toNumber());
              }));
            }
          })(config[device_type][device_id]);
        }
      }
      return Promise.all(getValuePromises)

    }).then(function (result) {
      console.log("=== end of status ===");
    });
  });

  it("III. Price communication House<->PV (4. PV sell excess energy to battery; House buy energy from battery)", async function () {
    jumpTime(16).then(function (result) {
      console.log("Here time is been increased (4)");
      return checkStep();
    }).then(function (result) {
      console.log("We are at step ", result.toNumber());

      var takeActionPromises3 = [];

      for (var actionNo in sellExcessOrder) {
        (function (element) {
  //        takeActionPromises1.push(jumpTime(element.timelapse));//);
          takeActionPromises3.push(takeAction(element));
        })(sellExcessOrder[actionNo]);
      }
      return Promise.all(takeActionPromises3);
    }).then(function (result) {
      console.log("Excess energy sold");
    });
  });

});
