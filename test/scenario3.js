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

var simpleinputs = require("./simpleinput_sce3");
var config = simpleinputs.config;
var actions = simpleinputs.actions;
// var inputs = simpleinputs.inputs;
var inputs = {"house":[
  {"consumption":[3,1,5,1,3,1,3,3,2,3,1,3,3,3,1,3,2,1,5,2,2,1,2,4,3,2,1,3,4,2,1,2,3,2,21,20,21,19,22,20,22,21,21,22,20,22,20,23,20,22,21,21,22,20,22,21,19,23,20,22,20,21,20,22,21,17,2,1,3,1,3,3,2,3,1,3,4,2,1,3,1,5,2,1,3,1,3,3,3,2,2,2,4,2,2,2],"consumptionH":[[3,0],[3,0],[3,0],[3,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[2,0],[2,0],[2,0],[2,0],[3,0],[3,0],[3,0],[3,0],[7,0],[7,0],[7,0],[7,0],[7,0],[7,0],[7,0],[7,0],[2,0],[2,0],[2,0],[2,0],[2,0],[2,0],[2,0],[2,0],[3,0],[3,0],[3,0],[3,0],[7,0],[7,0],[7,0],[7,0],[6,0],[6,0],[6,0],[6,0],[3,0],[3,0],[3,0],[3,0],[2,0],[2,0],[2,0],[2,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[2,0],[2,0],[2,0],[2,0],[3,0],[3,0],[3,0],[3,0],[8,0],[8,0],[8,0],[8,0],[8,0],[8,0],[8,0],[8,0],[7,0],[7,0],[7,0],[7,0],[5,0],[5,0],[5,0],[5,0]]},
  {"consumption":[2,1,1,1,1,1,1,1,1,1,1,2,2,1,1,1,1,1,1,1,2,1,1,1,2,1,3,4,3,11,11,12,11,29,31,27,25,25,25,24,25,25,25,25,27,26,26,26,25,26,26,26,26,26,25,25,26,25,29,29,29,29,29,30,28,29,28,25,19,9,7,7,6,5,2,1,1,1,3,2,1,1,2,2,1,1,1,1,1,1,1,1,1,1,1,1],"consumptionH":[[0,6],[0,6],[0,6],[0,6],[0,2],[0,2],[0,2],[0,2],[0,1],[0,1],[0,1],[0,1],[0,1],[0,1],[0,1],[0,1],[0,1],[0,1],[0,1],[0,1],[0,3],[0,3],[0,3],[0,3],[0,6],[0,6],[0,6],[0,6],[0,12],[0,12],[0,12],[0,12],[0,13],[0,13],[0,13],[0,13],[0,4],[0,4],[0,4],[0,4],[0,4],[0,4],[0,4],[0,4],[0,6],[0,6],[0,6],[0,6],[0,13],[0,13],[0,13],[0,13],[0,11],[0,11],[0,11],[0,11],[0,6],[0,6],[0,6],[0,6],[0,4],[0,4],[0,4],[0,4],[0,3],[0,3],[0,3],[0,3],[0,2],[0,2],[0,2],[0,2],[0,3],[0,3],[0,3],[0,3],[0,6],[0,6],[0,6],[0,6],[0,14],[0,14],[0,14],[0,14],[0,15],[0,15],[0,15],[0,15],[0,13],[0,13],[0,13],[0,13],[0,8],[0,8],[0,8],[0,8]]},
  {"consumption":[2,1,2,12,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,5,7,4,5,10,12,10,9,5,7,10,10,10,11,12,29,26,35,31,23,25,15,13,12,12,12,13,13,11,15,15,13,12,11,11,11,23,10,6,11,9,3,2,2,3,2,3,3,2,3,2,2,2,3,4,2,2,2,2,2,2,2,2,2,2,2,2],"consumptionH":[[0,5],[0,5],[0,5],[0,5],[0,2],[0,2],[0,2],[0,2],[0,1],[0,1],[0,1],[0,1],[0,1],[0,1],[0,1],[0,1],[0,1],[0,1],[0,1],[0,1],[0,2],[0,2],[0,2],[0,2],[0,5],[0,5],[0,5],[0,5],[0,10],[0,10],[0,10],[0,10],[0,11],[0,11],[0,11],[0,11],[0,4],[0,4],[0,4],[0,4],[0,3],[0,3],[0,3],[0,3],[0,5],[0,5],[0,5],[0,5],[0,11],[0,11],[0,11],[0,11],[0,9],[0,9],[0,9],[0,9],[0,5],[0,5],[0,5],[0,5],[0,3],[0,3],[0,3],[0,3],[0,2],[0,2],[0,2],[0,2],[0,2],[0,2],[0,2],[0,2],[0,3],[0,3],[0,3],[0,3],[0,5],[0,5],[0,5],[0,5],[0,12],[0,12],[0,12],[0,12],[0,13],[0,13],[0,13],[0,13],[0,10],[0,10],[0,10],[0,10],[0,7],[0,7],[0,7],[0,7]]}
],

"pv":[
  {"production":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,0,0,4,11,15,8,16,18,19,19,19,21,22,21,23,23,23,23,23,23,22,23,22,21,22,18,19,19,17,14,13,14,12,6,12,0,9,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"price":[10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,15,10,10,28,16,15,19,14,14,14,14,14,13,13,13,13,13,13,13,13,13,13,13,13,13,13,14,14,14,14,15,15,15,16,22,16,10,18,22,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10]},
  {"production":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,8,0,3,12,2,13,12,11,11,13,13,15,14,15,14,15,14,15,15,15,14,14,13,13,13,11,15,9,6,15,1,14,0,8,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"price":[11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,20,19,11,27,18,31,17,18,18,18,17,17,16,17,16,17,16,17,16,16,16,17,17,17,17,17,18,16,18,21,16,38,17,11,19,20,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11]},
  {"production":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,6,10,4,9,11,11,13,12,11,9,14,11,12,9,14,10,8,12,10,7,13,8,11,10,11,13,10,9,5,8,2,4,6,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"price":[6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,20,24,19,26,20,17,17,15,16,17,20,14,17,16,20,14,19,21,16,19,22,15,21,17,19,17,15,19,20,25,21,29,26,24,20,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6]}
],

"battery":[
  {"consumption":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"price":[[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3]]}
],

"grid":[
  {"price":[[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3],[20,3]]}
],

"watertank":[
  {"consumption":[10,0,0,0,0,0,0,0,1,15,7,1,1,1,1,1,1,1,1,1,1,2,2,2,2,3,3,3,3,7,7,7,7,7,7,7,7,2,2,2,2,2,2,2,2,3,3,3,3,7,7,7,7,6,6,6,6,3,3,3,3,2,2,2,2,1,1,1,1,1,1,1,1,2,2,2,2,3,3,3,3,8,8,8,8,8,8,8,8,7,7,7,7,5,5,5]},
  {"consumption":[0,0,0,14,12,0,0,0,16,0,0,0,4,0,0,0,0,0,0,0,0,0,17,0,0,0,0,9,10,0,0,35,15,0,0,23,27,0,0,0,0,1,25,0,0,0,0,36,0,0,0,9,12,9,4,0,44,27,0,0,0,0,30,0,0,0,0,11,0,0,0,5,0,0,0,0,0,16,8,0,0,39,0,0,13,30,17,0,0,24,43,0,0,22,22,0]},
  {"consumption":[11,0,0,0,0,0,0,0,0,0,0,6,11,10,0,0,0,0,0,0,0,0,0,5,10,0,0,0,0,0,0,7,23,25,22,14,7,2,0,0,0,0,0,0,0,11,17,13,12,12,11,10,6,4,5,10,1,12,6,4,4,0,0,10,3,2,0,4,7,6,3,3,2,0,0,0,0,0,0,0,13,18,21,18,0,0,0,0,5,0,10,32,24,17,17,18]}
]};
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
      return getGasConsump();

    //   // try with function
    // }).then(function (result) {
    //   return allRounds(1,30);      // here indicates the total rounds ... should be 96
    // }).then(function (result) {
    //   return allRounds(31,60);      // here indicates the total rounds ... should be 96
    // }).then(function (result) {
    //   return allRounds(61,96);      // here indicates the total rounds ... should be 96
    }).then(function (result) {
      console.log("Let's start running tests...");
      // done();
    });
  });

  // it('rounds should be executed ',  function() {
  //   return oneRound(40).then(function(result){
  //     return oneRound(41);
  //   }).then(function(result) {
  //     return oneRound(42);
  //   }).then(function(result) {
  //     return oneRound(43);
  //   }).then(function(result) {
  //     return oneRound(44);
  //   });
  // });

  for(let i = 0; i < 96; i++) {   // i should be 0 - 96
    it('round ' + i  + ' should be executed ',  async function() {
      return await oneRound(i);
    });
  }

  it('write to file', async function() {
    await WriteJson("record_step_4", database_4);
    await WriteJson("record_step_5", database_5);
    await WriteJson("record_gas", database_gas);
    await WriteJson("record_price", database_price);
  })

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
  // console.log(" -- just to log i: " + i + ", " + element.counter);
  return element.contract["verifySellEnergy"](i, element.counter, { from: element.address, gas: 6700000}).then(function(result) {
    // console.log("cordinate sellEnergy of " + i + " - " + element.device_name);
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
        // console.log("start coordination " + _element.device_name + " <-- " + _element.counter);
        cordinationPromisese.push(cordinateSellEnergy(i,_element).then(function (result) {
          // console.log(_element.device_name + " finished coordination" + " <--" + i + " <-- " + _element.counter);
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
  var getGasArray = [0, 1, 2, 5, 8, 9, 12]; //2, 5, 8, 9, 12 // 0,1
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
    
    if (currentStep == 4) {
      await checkAllDeviceStatus(database_4);
    } else if (currentStep == 5) {
      await checkAllDeviceStatus(database_5);
    }
    await getGasConsump();
    // await jumpTime(12);
  }
    // do the calculation and write to this json
    await getPVPrice(currentRound);

    // change the value of inputs
    await calculatePVPrice(currentRound);

  // await WriteJson("record_step_4", database_4);
  // await WriteJson("record_step_5", database_5);
  // await WriteJson("record_gas", database_gas);
  // await WriteJson("record_price", database_price);
  return;
}

function getPVPrice(currentRound) {
  var getPromises = [];
  for (let i = 0; i < 3; i++) {   // looping from PV0 to PV3
    // write get price and production of 3 PVs of current round into json file
    var tempStep1 = inputs.pv[i].production[currentRound];
    var tempLastPrice = inputs.pv[i].price[currentRound];
   
    // if(database_4.pv[i].Production.length >= currentRound) {
      var tempStep4 = database_4.pv[i].Production[database_4.pv[i].Production.length-1];
    // } else {
    //   var tempStep4 = tempStep1;
    // }
    // if(database_5.pv[i].Production.length >= currentRound) {
      var tempStep5 = database_5.pv[i].Production[database_4.pv[i].Production.length-1];
    // } else {
    //   var tempStep5 = tempStep1;
    // }

    if (tempStep1 == tempStep5) {
      var factor = 0;
    } else {
      var factor = (tempStep1-tempStep4)/(tempStep1-tempStep5)*10;
    }

    getPromises.push(database_price.pvPrice[i].step1.push(tempStep1));
    getPromises.push(database_price.pvPrice[i].step4.push(tempStep4));
    getPromises.push(database_price.pvPrice[i].step5.push(tempStep5));
    getPromises.push(database_price.pvPrice[i].deltaC.push(tempStep1-tempStep4));
    getPromises.push(database_price.pvPrice[i].deltaG.push(tempStep4-tempStep5));
    getPromises.push(database_price.pvPrice[i].factor.push(factor));
    getPromises.push(database_price.pvPrice[i].lastPrice.push(tempLastPrice));

  }
  return Promise.all(getPromises);
}

function calculatePVPrice(currentRound) {
  var calPromises = [];
  for (let i = 0; i < 3; i++) {   // looping from PV0 to 
    var tL = database_4.pv[i].Production.length - 1;
    // write get price and production of 3 PVs of current round into json file
    var a = (i+1) % 3;
    var b = (i+2) % 3;
    // console.log(i + ' - ' + a + ' - ' + b);
    // console.log("input value: " + inputs.pv[i].price[currentRound+1]);
    if (database_price.pvPrice[i].factor[tL] <= database_price.pvPrice[a].factor[tL] && database_price.pvPrice[i].factor[tL] <= database_price.pvPrice[b].factor[tL] && database_price.pvPrice[i].lastPrice[tL] > 10) {
      calPromises.push(database_price.pvPrice[i].newPrice.push(database_price.pvPrice[i].lastPrice[tL]-2));
      calPromises.push(inputs.pv[i].price[currentRound+1] -= 2);
      // console.log('true');
    } else {
      calPromises.push(database_price.pvPrice[i].newPrice.push(database_price.pvPrice[i].lastPrice[tL]));
      // console.log('false');
    }
    // console.log("input value: " + inputs.pv[i].price[currentRound+1]);
    return Promise.all(calPromises);

  }
}