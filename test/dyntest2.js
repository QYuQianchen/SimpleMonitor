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

function takeAction(element) {
  var addTakeActionPromise;
  var takeActionPromise = [];
  if (element.action == "askandsortprice") {
    if (element.device_type == "house" || element.device_type == "battery") {
      addTakeActionPromise = config[element.device_type][element.device_id].contract.askForPrice();
      takeActionPromise.push(addTakeActionPromise);
      addTakeActionPromise = config[element.device_type][element.device_id].contract.sortPrice();
      takeActionPromise.push(addTakeActionPromise);
    }
  } else if (element.action == "askandsortrank") {
    if (element.device_type == "pv" || element.device_type == "battery") {
      addTakeActionPromise = config[element.device_type][element.device_id].contract.askForRank();
      takeActionPromise.push(addTakeActionPromise);
      addTakeActionPromise = config[element.device_type][element.device_id].contract.sortRank();
      takeActionPromise.push(addTakeActionPromise);
    }
  }
  return takeActionPromise;
}

function setValue(input) {
  if (input.action == "setconsumption") {
    var addSetValuePromise = input.element.contract.setConsumption(input.value, { from: input.element.address });
  } else if (input.action == "setproduction") {
    var addSetValuePromise = input.element.contract.setProduction(input.value, { from: input.element.address });
  } else if (input.action == "setvolume") {
    var addSetValuePromise = input.element.contract.setVolume(input.value, { from: input.element.address });
  } else if (input.action == "setprice") {
    if (input.element.device_type == "battery" || input.element.device_type == "grid") {
      var addSetValuePromise = input.element.contract.setPrice(input.value[0], input.value[1], { from: input.element.address });
    } else {
      var addSetValuePromise = input.element.contract.setPrice(input.value, { from: input.element.address });
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

      console.log("\n\nsetValuePromises\n\n");
      console.log(setValuePromises);

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

    }).then(function(result) {
      console.log("getvalues done...");
    });
  });

  it("III. Price communication House<->PV (1. House ask for price info and sort)", function () {

     //var increaseTimePromise = increaseTimeTo(latestTime() + duration.seconds(15));
     //return increaseTimePromise.then(function (result) {
     return jumpTime(15).then(function (result) {
       console.log("Here time is been increased (1)");
     /*  return getNow();
     }).then(function (result) {
    // return getNow().then(function (result) {
       console.log("Now is", result.toNumber());*/
       return checkStep();
     }).then(function (result) {
       console.log("We are at step ", result.toNumber());

      var currentStep = result.toNumber();

       var step2Promises = [];

       for (var device_type in actions) {
         if (actions[device_type][currentStep] != undefined) {

           for (var currentAction in actions[device_type][currentStep]) {
             for (var device_id in config[device_type]) {
               var element = config[device_type][device_id];
               var action = actions[device_type][currentStep][currentAction];

               (function(_element, _action) {
                 console.log("Executing " + _action + "() <-- " + _element.device_name);

                 if (_element.contract[_action] != undefined) {
                   step2Promises.push(_element.contract[_action]({ from: _element.address }));
                 }
                 // setValuePromises.push(execute(_element, _action, _input));
               })(element, action);
             }
           }
         } else {
           console.log("Nothing to do at this step <-- " + device_type);
         }
       }



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

  /*it("III. Price communication House <-> PV (2. PV collect info - Try another time delay)", async function () {

    //await jumpTime(15);
    await increaseTimeTo(latestTime() + duration.seconds(12));
    return config.house[1].contract.getNow.call().then(function (result) {
      console.log("Now is", result.toNumber());
      return checkStep();
    }).then(function (result) {
      console.log("The status of the global timer is ", result.toNumber());

      var takeActionPromises2 = [];

      for (var actionNo in action_at_moment_2) {
        (function (element) {   // async... not able to jumpTime in a loop...
          //await jumpTime(element.timelapse);
          takeActionPromises2.push(takeAction(element));
        })(action_at_moment_2[actionNo]);
      }
      return Promise.all(takeActionPromises2);
    }).then(function (result) {
      console.log("All rank sorted");
    });*/

    /*let nowTime = await singleHouse2.getNow.call();
    console.log("Now is", nowTime.toNumber());
    await increaseTimeTo(latestTime() + duration.seconds(150));
    nowTime = await singleHouse2.getNow.call();
    console.log("Now is", nowTime.toNumber());
    let statTime = await singleHouse0.getTime.call();
    console.log("The status of the global timer is ", statTime.toNumber());

    let result1 = await singleHouse1.getSortedPrice.call({ from: singlePV1_adr });
    console.log("returned sorted information from sH1 is", result1[0].toNumber(), result1[1].toNumber(), result1[2].toNumber(), result1[3]);
    let currentPV = singlePV1;
    await currentPV.askForRank();
    await currentPV.sortRank();
    let result2 = await currentPV.getSortedRank.call(0);
    console.log("The sorted result at 0 is", result2[0], result2[1].toNumber(), result2[2].toNumber(), result2[3].toNumber());
    let result3 = await currentPV.getSortedRank.call(1);
    console.log("The sorted result at 1 is", result3[0], result3[1].toNumber(), result3[2].toNumber(), result3[3].toNumber());
    let result4 = await currentPV.getSortedRank.call(2);
    console.log("The sorted result at 2 is", result4[0], result4[1].toNumber(), result4[2].toNumber(), result4[3].toNumber());
    await singlePV0.askForRank();
    await singlePV0.sortRank();
    await singlePV2.askForRank();
    await singlePV2.sortRank();
    await singleBattery0.askForRank();
    await singleBattery0.sortRank();
    console.log("Other devices sorted");*/
  //});

  // it("III. Price communication House<->PV (2. PV collect Info)", function () {
  //
  //   return config.house[1].contract.getNow.call().then(function (result) {
  //     console.log("Now is", result.toNumber());
  //     return checkStep();
  //   }).then(function (result) {
  //     console.log("The status of the global timer is ", result.toNumber());
  //
  //     var takeActionPromises2 = [];
  //
  //     for (var actionNo in action_at_moment_2) {
  //       (function (element) {   // async... not able to jumpTime in a loop...
  //         //await jumpTime(element.timelapse);
  //         takeActionPromises2.push(takeAction(element));
  //       })(action_at_moment_2[actionNo]);
  //     }
  //     return Promise.all(takeActionPromises2);
  //   }).then(function (result) {
  //     console.log("All rank sorted");
  //   });
  //
  //   /*// Let the rest of the houses calculate their preference list (given the price of PV/Battery/Grid)
  //   var currentPV;
  //   currentPV = singlePV1;
  //   return singleHouse1.getSortedPrice.call({ from: singlePV1_adr }).then(function (result) {
  //     //console.log("The query is from singlePV1_adr", singlePV1_adr);
  //     console.log("returned sorted information from sH1 is", result[0].toNumber(), result[1].toNumber(), result[2].toNumber(), result[3]);
  //     currentPV.askForRank();
  //     currentPV.sortRank();
  //   }).then(function (result) {
  //     console.log("PV sorted the information");
  //     return currentPV.getSortedRank.call(0);
  //   }).then(function (result) {
  //     console.log("The sorted result at 0 is", result[0], result[1].toNumber(), result[2].toNumber(), result[3].toNumber());
  //     return currentPV.getSortedRank.call(1);
  //   }).then(function (result) {
  //     console.log("The sorted result at 1 is", result[0], result[1].toNumber(), result[2].toNumber(), result[3].toNumber());
  //     return currentPV.getSortedRank.call(2);
  //   }).then(function (result) {
  //     console.log("The sorted result at 2 is", result[0], result[1].toNumber(), result[2].toNumber(), result[3].toNumber());
  //     singlePV0.askForRank();
  //     singlePV0.sortRank();
  //     //singlePV1.askForRank();
  //     //singlePV1.sortRank();
  //     singlePV2.askForRank();
  //     singlePV2.sortRank();
  //     singleBattery0.askForRank();
  //     singleBattery0.sortRank();
  //   }).then(function (result) {
  //     console.log("Other devices sorted");
  //   });*/
  // });

  // it("III. Price communication House<->PV (3. PV and Battery intiate Transaction)", async function () {
  //   // Jumping into status 4. Ready for transaction
  //   let nowTime = await singleHouse2.getNow.call();
  //   console.log("Now is", nowTime.toNumber());
  //   await increaseTimeTo(latestTime() + duration.seconds(77));
  //   nowTime = await singleHouse2.getNow.call();
  //   console.log("After time increase, now is", nowTime.toNumber());
  //   let statTime = await singleHouse0.getTime.call();
  //   console.log("The status of the global timer is ", statTime.toNumber());
  //   // Time for index 1 transaction? Check the current index and status of houses...
  //   let i1 = await singlePV1.getTimerIndex.call();
  //   console.log("Before energy transaction:");
  //   console.log("0. Now index is", i1.toNumber());
  //   let result1 = await singleHouse0.getConsumption.call();
  //   console.log("Now SH0 consumes", result1[0].toNumber(), result1[1].toNumber());
  //   let result2 = await singleHouse1.getConsumption.call();
  //   console.log("Now SH1 consumes", result2[0].toNumber(), result2[1].toNumber());
  //   let result3 = await singleHouse2.getConsumption.call();
  //   console.log("Now SH2 consumes", result3[0].toNumber(), result3[1].toNumber());
  //   let result4 = await singleBattery0.getVolumeCapacity.call();
  //   console.log("Now B0 consumes", result4[0].toNumber(), result4[1].toNumber(), result4[2].toNumber());
  //   // PV1 wants to sell its energy.
  //   let currentPV = singlePV1;
  //   await currentPV.sellEnergy();
  //   i1 = await currentPV.getTimerIndex.call();
  //   console.log("PV1 reacts");
  //   console.log("1. Now index is", i1.toNumber());
  //   result1 = await singleHouse0.getConsumption.call();
  //   console.log("Now SH0 consumes", result1[0].toNumber(), result1[1].toNumber());
  //   result2 = await singleHouse1.getConsumption.call();
  //   console.log("Now SH1 consumes", result2[0].toNumber(), result2[1].toNumber());
  //   result3 = await singleHouse2.getConsumption.call();
  //   console.log("Now SH2 consumes", result3[0].toNumber(), result3[1].toNumber());
  //   result4 = await singleBattery0.getVolumeCapacity.call();
  //   console.log("Now B0 consumes", result4[0].toNumber(), result4[1].toNumber(), result4[2].toNumber());
  //   // PV0 wants to sell its energy.
  //   currentPV = singlePV0;
  //   await currentPV.sellEnergy();
  //   console.log("P0 reacts");
  //   i1 = await currentPV.getTimerIndex.call();
  //   console.log("2. Now index is", i1.toNumber());
  //   result1 = await singleHouse0.getConsumption.call();
  //   console.log("Now SH0 consumes", result1[0].toNumber(), result1[1].toNumber());
  //   result2 = await singleHouse1.getConsumption.call();
  //   console.log("Now SH1 consumes", result2[0].toNumber(), result2[1].toNumber());
  //   result3 = await singleHouse2.getConsumption.call();
  //   console.log("Now SH2 consumes", result3[0].toNumber(), result3[1].toNumber());
  //   result4 = await singleBattery0.getVolumeCapacity.call();
  //   console.log("Now B0 consumes", result4[0].toNumber(), result4[1].toNumber(), result4[2].toNumber());
    // PV2 also wants to sell its energy test whether now PV2 can do energy transaction... but failed (with r)
    /*    currentPV = singlePV2;
        currentPV.sellEnergy();
        i1 = await currentPV.getTimerIndex.call();
        console.log("Now index is",i1.toNumber());
        nowTime = await singleHouse2.getNow.call();
        console.log("Now is", nowTime.toNumber(), latestTime());
        result1 = await singleHouse0.getConsumption.call();
        console.log("Now SH0 consumes",result1[0].toNumber(),result1[1].toNumber());
        result2 = await singleHouse1.getConsumption.call();
        console.log("Now SH1 consumes",result2[0].toNumber(),result2[1].toNumber());
        result3 = await singleHouse2.getConsumption.call();
        console.log("Now SH2 consumes",result3[0].toNumber(),result3[1].toNumber());
        result4 = await singleBattery0.getVolumeCapacity.call();
        console.log("Now SH2 consumes",result4[0].toNumber(),result4[1].toNumber(),result4[2].toNumber());*/
    // what about increasing time to 4 seconds later?
    // B0 starts
    //
    //
  //   await increaseTimeTo(latestTime() + duration.seconds(1));
  //   nowTime = await singleHouse2.getNow.call();
  //   console.log("B0 reacts");
  //   console.log("Now is", nowTime.toNumber(), latestTime());
  //   singleBattery0.sellEnergy();
  //   i1 = await currentPV.getTimerIndex.call();
  //   console.log("3. Now index is", i1.toNumber());
  //   result1 = await singleHouse0.getConsumption.call();
  //   console.log("Now SH0 consumes", result1[0].toNumber(), result1[1].toNumber());
  //   result2 = await singleHouse1.getConsumption.call();
  //   console.log("Now SH1 consumes", result2[0].toNumber(), result2[1].toNumber());
  //   result3 = await singleHouse2.getConsumption.call();
  //   console.log("Now SH2 consumes", result3[0].toNumber(), result3[1].toNumber());
  //   result4 = await singleBattery0.getVolumeCapacity.call();
  //   console.log("Now B0 consumes", result4[0].toNumber(), result4[1].toNumber(), result4[2].toNumber());
  //   // PV2 starts
  //   await increaseTimeTo(latestTime() + duration.seconds(1));
  //   nowTime = await singleHouse2.getNow.call();
  //   console.log("PV2 reacts");
  //   console.log("Now is", nowTime.toNumber(), latestTime());
  //   currentPV = singlePV2;
  //   currentPV.sellEnergy();
  //   i1 = await currentPV.getTimerIndex.call();
  //   console.log("4. Now index is", i1.toNumber());
  //   result1 = await singleHouse0.getConsumption.call();
  //   console.log("Now SH0 consumes", result1[0].toNumber(), result1[1].toNumber());
  //   result2 = await singleHouse1.getConsumption.call();
  //   console.log("Now SH1 consumes", result2[0].toNumber(), result2[1].toNumber());
  //   result3 = await singleHouse2.getConsumption.call();
  //   console.log("Now SH2 consumes", result3[0].toNumber(), result3[1].toNumber());
  //   result4 = await singleBattery0.getVolumeCapacity.call();
  //   console.log("Now B0 consumes", result4[0].toNumber(), result4[1].toNumber(), result4[2].toNumber());
  // });

  // it("III. Price communication House<->PV (4. PV sell excess energy to battery; House buy energy from battery)", async function () {
  //   // PV2 still has excess energy
  //   let prod = await singlePV2.getProduction.call();
  //   console.log("PV2 still has", prod[0].toNumber(), prod[1].toNumber());
  //   let nowTime = await singleHouse2.getNow.call();
  //   console.log("Now is", nowTime.toNumber());
  //   await increaseTimeTo(latestTime() + duration.seconds(300));
  //   nowTime = await singleHouse2.getNow.call();
  //   console.log("After time increase, now is", nowTime.toNumber());
  //   let statTime = await singleHouse0.getTime.call();
  //   console.log("The status of the global timer is ", statTime.toNumber());
  //   await singlePV2.sellExcess();
  //   prod = await singlePV2.getProduction.call();
  //   console.log("PV2 still has", prod[0].toNumber(), prod[1].toNumber());
  // });


});
