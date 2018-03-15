import latestTime from './helpers/latestTime'
import increaseTime, { increaseTimeTo, duration } from './helpers/increaseTime'


var fs = require('fs');
const readFile = require('util').promisify(fs.readFile);
var record = require("./data/output/record_struc.json");
var recordPath = "./test/data/output/record_struc.json";
var gasRecordPath = "./test/data/input/gas_struc.json";
var priceRecordPath = "./test/data/input/price_struc.json";

var database_4 = null;
var database_5 = null;
var database_gas = null;
var database_price = null;

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

var totalStages = 6; // There are 5 stages in Step 4

var configuration = null;

var simpleinputs = require("./simpleinput_sce2");
var config = simpleinputs.config;
var actions = simpleinputs.actions;
var inputs = simpleinputs.inputs;
var checkStatusActions = simpleinputs.checkStatusActions;
var category_nums = simpleinputs.category_nums;
var actionInputs = simpleinputs.actionInputs;


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


  it("Should do all prep work",  function () {
 
    // this.timeout(9999999);
    
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
      //return printDevice(config);
    }).then(function (result) {
      console.log("Here we are starting the 1st round.. ."); 
      return OpenJson();
    }).then(function (result) {
      console.log(database_price);
      return getGasConsump();

    //   // try with function
    // }).then(function (result) {
    //   return allRounds(1,30);      // here indicates the total rounds ... should be 96
    // }).then(function (result) {
    //   return allRounds(31,60);      // here indicates the total rounds ... should be 96
    // }).then(function (result) {
    //   return allRounds(61,96);      // here indicates the total rounds ... should be 96
    // }).then(function (result) {
    //   console.log("Finished");
      // done();
    });
  });

  for(let i = 0; i < 2; i++) {   // i should be 0 - 96
    it('round ' + i  + ' should be executed ',  async function() {
      return await oneRound(i);
    });
  }
}); 


//// ---------------------
////  Here are functions
//// ---------------------

function register(element) {
  console.log("Registering " + element.device_type + " " + element.id);
  console.log("adding device type " + element.device_type + " --> " + category_nums[element.device_type]);

  if (element.device_type == "grid") {
    var addPromise = configuration.addGrid(element.address, { from: config.admin[0].address, gas: 2000000 });
  } else if (element.device_type == "battery") {
    var addPromise = configuration.addDevice(category_nums[element.device_type], element.address, element.capacity, true, { from: config.admin[0].address, gas: 2000000 });
  } else if (element.device_type == "heatpump") {
    var addPromise = configuration.addDevice(category_nums[element.device_type], element.address, element.price, element.watertype, { from: config.admin[0].address, gas: 2000000 });
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

async function step(period, currentStep) {
  var stepPromises = [];

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
              // console.log("Executing " + _action + "(" + _input + ") <-- " + _element.device_name);
              stepPromises.push(execute(_element, _action, _input).then(function (result) {
                // console.log(_element.device_name + " doing " + _action + " is done");
              }));
            })(element, action, input);
          }
        }
      } else {
        // console.log("Nothing to do at this step <-- " + device_type);
      }
    }
  } else if (currentStep == 4) {
    // when selling, there is competition. Order of execution matters.
    // Therefore, we need to introduce the 
    for (var device_type in actions) {
      if (device_type == "watertank") { 
        for (var device_id in config[device_type]) {
          var element = config[device_type][device_id];
          var action = "sellEnergy";
          (function(_element, _action) {
            // console.log("Executing " + _action + " <-- " + _element.device_name);
            stepPromises.push(_element.contract[_action]({ from: _element.address, gas: 6700000}).then(function (result) {
              // console.log(_element.device_name + " has passed through <--" + _action);
            }));
          })(element, action);
        }
      } else if (device_type == "pv") { // actions[device_type][currentStep] == ["sellEnergy"] // start executing among "pv" and "battery"
        for (let i = 0; i < totalStages; i++) {
          await startCordination(i);
        }
        // // console.log(">>> start cordination - phase 0");
        // await startCordination(0);
        // // console.log(">>> start cordination - phase 1");
        // await startCordination(1);
        // // console.log(">>> start cordination - phase 2");
        // await startCordination(2);
      } else {
        // console.log("Nothing to do at this step <-- " + device_type);
      }
    }
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
              // console.log("Executing " + _action + " <-- " + _element.device_name);
              stepPromises.push(_element.contract[_action]({ from: _element.address, gas: 6700000}).then(function (result) {
                // console.log(_element.device_name + " has passed through <--" + _action);
              }));
            })(element, action);
          }
        }
      } else {
        // console.log("Nothing to do at this step <-- " + device_type);
      }
    }
  }

  return Promise.all(stepPromises)
}

async function cordinateSellEnergy(i,element) {
  console.log(" -- just to log i: " + i + ", " + element.counter);
  return element.contract["verifySellEnergy"](i, element.counter, { from: element.address, gas: 6700000}).then(function(result) {
    console.log("cordinate sellEnergy of " + i + " - " + element.device_name);
    return element.contract["getNewCounter"].call({ from: element.address});
  }).then(function(result) {
    element.counter = result.toNumber();
    // console.log(element.counter);
  });
}

function startCordination(i) {
  var d_type = ["pv", "battery"];
  var cordinationPromisese = [];
  d_type.forEach(d_type_element => {
    for (var device_id in config[d_type_element]) {
      var element = config[d_type_element][device_id];
      if (i == 0) {
        // initialization
        element.counter = 0;
      }
      (function(_element) {
        console.log("start coordination " + _element.device_name + " <-- " + _element.counter);
        cordinationPromisese.push(cordinateSellEnergy(i,_element).then(function (result) {
          console.log(_element.device_name + " finished coordination" + " <--" + i + " <-- " + _element.counter);
        }));
      })(element);
    }
  });
  return Promise.all(cordinationPromisese);
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

function checkAllDeviceStatus(_database) {
  var allDeviceStatusPromises = [];

  console.log("----------------print status-------------------");

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
                  _database[element.device_type][element.id][name].push([result[0].toNumber(), result[1].toNumber()]); //add some data
                  // console.log(" -> " + element.device_name + " -- " + name + " : ", result[0].toNumber(), result[1].toNumber());
                } else {
                  _database[element.device_type][element.id][name].push(result[0].toNumber()); //add some data
                  // console.log(" -> " + element.device_name + " -- " + name + " : ", result[0].toNumber());
                }
              } else {
                _database[element.device_type][element.id][name].push(result.toNumber()); //add some data
                // console.log(" -> " + element.device_name + " -- " + name + " : ", result.toNumber());
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
  // return configuration.getNow.call({from:config.admin[0].address});
  configuration.getNow.call().then(function(result) {
    console.log("Current timestamp is: ", result.toNumber());
  });
}

function getGasConsump() {
  var getGasArray = [2, 5, 8, 9, 12]; //2, 5, 8, 9, 12 // 0,1
  getGasArray.forEach(element => {
    var result =  web3.eth.getBalance(web3.eth.accounts[element]).toNumber();
    // console.log("account " + element + " has " + result);
    database_gas[element].push(result);
  });
}

function printDevice(_config) {
  // @param element is heatpump
  var printPromises = [];
  for (var hp_id in _config.heatpump) {
    for (let i = 0; i < 1; i++) {
      console.log("Single HeatPump[" + hp_id + "] has");
      printPromises.push(_config.heatpump[hp_id].contract.printConnectedWT(i).then(function(result){
        console.log(_config.heatpump[hp_id].device_name + "has connected WT as" + result);
      }));
    }
  }
  return Promise.all(printPromises);
}

function OpenJson() {

    var addPromise = [];
    addPromise.push(readFile(recordPath)
      .then(e => {
        database_4 = JSON.parse(e);
        database_5 = JSON.parse(e);
        // console.log(database);
      })
      .catch(e => console.log('FOOBAR ' + e)));
    addPromise.push(readFile(gasRecordPath)
      .then(e => {
        database_gas = JSON.parse(e);
        // console.log(database);
      })
      .catch(e => console.log('FOOBAR ' + e)));
    addPromise.push(readFile(priceRecordPath)
      .then(e => {
        database_price = JSON.parse(e);
        // console.log(database);
      })
      .catch(e => console.log('FOOBAR ' + e)));
    return Promise.all(addPromise);
}

function WriteJson(filename, _database) {
  var json = JSON.stringify(_database, null, 4); //convert it back to json
  return fs.writeFile('./test/data/output/' + filename + '.json', json, 'utf8', function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log("JSON saved");
    }
});
}

async function oneRound(currentRound) {

  // var asyncPromises = [];

  for (let currentStep = 1; currentStep < 6; currentStep++) {   // looping from step 1 to step 5
    console.log("We are at step: ", currentStep);
    await step(currentRound,currentStep);
    console.log("Step " + currentStep + " done.");
    await getGasConsump();
    if (currentStep == 4) {
      await checkAllDeviceStatus(database_4);
    } else if (currentStep == 5) {
      await checkAllDeviceStatus(database_5);
    }
    await jumpTime(12);
  }

  await WriteJson("record_step_4", database_4);
  await WriteJson("record_step_5", database_5);
  return await WriteJson("record_gas", database_gas);

}

// async function oneRound(currentRound) {

//     var asyncPromises = [];
  
//     for (let currentStep = 1; currentStep < 6; currentStep++) {   // looping from step 1 to step 5
//       console.log("We are at step: ", currentStep);
//       asyncPromises.push(step(currentRound,currentStep));
//       console.log("Step " + currentStep + " done.");
//       asyncPromises.push(getGasConsump());
//       if (currentStep == 4) {
//         asyncPromises.push(checkAllDeviceStatus(database_4));
//       } else if (currentStep == 5) {
//         asyncPromises.push(checkAllDeviceStatus(database_5));
//       }
//       asyncPromises.push(jumpTime(12));
//     }
  
//     asyncPromises.push(await WriteJson("record_step_4", database_4));
//     asyncPromises.push(await WriteJson("record_step_5", database_5));
//     asyncPromises.push(await WriteJson("record_gas", database_gas));
  
//     return Promise.all(asyncPromises);
// }