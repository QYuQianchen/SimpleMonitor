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

var config = {
  "admin": [
    {
      "id": 0,
      "address": 0,
      "contract_address": 0,
      "type": "admin"
    }
  ],

  "grid": [
    {
      "id": 0,
      "address": 0,
      "picture": "images/grid.png",
      "contract_address": 0,
      "type": "grid"
    }
  ],
  "house": [
    {
      "id": 0,
      "picture": "images/house.png",
      "address": 0,
      "contract_address": 0,
      "type": "house"
    },
    {
      "id": 1,
      "picture": "images/house.png",
      "address": 0,
      "contract_address": 0,
      "type": "house"
    },
    {
      "id": 2,
      "picture": "images/house.png",
      "address": 0,
      "contract_address": 0,
      "type": "house"
    }
  ],
  "pv": [
    {
      "id": 0,
      "picture": "images/pv.png",
      "address": 0,
      "contract_address": 0,
      "type": "pv"
    },
    {
      "id": 1,
      "picture": "images/pv.png",
      "address": 0,
      "contract_address": 0,
      "type": "pv"
    },
    {
      "id": 2,
      "picture": "images/pv.png",
      "address": 0,
      "contract_address": 0,
      "type": "pv"
    }
  ],
  "battery": [
    {
      "id": 0,
      "picture": "images/battery.png",
      "address": 0,
      "contract_address": 0,
      "type": "battery",
      "capacity": 20
    }
  ]
};

var category_nums = {
  "house": 0,
  "pv": 1,
  "battery": 2,
  "grid": 3
};

var input_at_moment = [
  {
    "device_type": "house",
    "device_id": 0,
    "action": "setconsumption",
    "value": 3
  },
  {
    "device_type": "house",
    "device_id": 1,
    "action": "setconsumption",
    "value": 3
  },
  {
    "device_type": "house",
    "device_id": 2,
    "action": "setconsumption",
    "value": 8
  },
  {
    "device_type": "pv",
    "device_id": 0,
    "action": "setproduction",
    "value": 5
  },
  {
    "device_type": "pv",
    "device_id": 1,
    "action": "setproduction",
    "value": 10
  },
  {
    "device_type": "pv",
    "device_id": 2,
    "action": "setproduction",
    "value": 10
  },
  {
    "device_type": "battery",
    "device_id": 0,
    "action": "setvolume",
    "value": 5
  },
  {
    "device_type": "battery",
    "device_id": 0,
    "action": "setconsumption",
    "value": 3
  },
  {
    "device_type": "pv",
    "device_id": 0,
    "action": "setprice",
    "value": 20
  },
  {
    "device_type": "pv",
    "device_id": 1,
    "action": "setprice",
    "value": 15
  },
  {
    "device_type": "pv",
    "device_id": 2,
    "action": "setprice",
    "value": 30
  },
  {
    "device_type": "battery",
    "device_id": 0,
    "action": "setprice",
    "value": [20, 3]
  },
  {
    "device_type": "grid",
    "device_id": 0,
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


var sellEnerygOrder = [
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

function takeAction(element) {
  var addTakeActionPromise;
  var takeActionPromise = [];
  if (element.action == "askandsortprice") {
    if (element.device_type == "house" || element.device_type == "battery") {
      addTakeActionPromise = config[element.device_type][element.device_id].contract.askForPrice({from: config[element.device_type][element.device_id].address});
      takeActionPromise.push(addTakeActionPromise.then(function(result){
        addTakeActionPromise = config[element.device_type][element.device_id].contract.sortPrice({from: config[element.device_type][element.device_id].address});
        takeActionPromise.push(addTakeActionPromise);
      }));
      
    }
  } else if (element.action == "askandsortrank") {
    if (element.device_type == "pv" || element.device_type == "battery") {
      addTakeActionPromise = config[element.device_type][element.device_id].contract.askForRank({from: config[element.device_type][element.device_id].address});
      takeActionPromise.push(addTakeActionPromise.then(function(result){
        addTakeActionPromise = config[element.device_type][element.device_id].contract.sortRank({from: config[element.device_type][element.device_id].address});
        takeActionPromise.push(addTakeActionPromise);
      })); 
    }
  } else if (element.action == "sellenergy") {
    if (element.device_type == "pv" || element.device_type == "battery") {
      addTakeActionPromise = config[element.device_type][element.device_id].contract.sellEnergy({from: config[element.device_type][element.device_id].address});
      takeActionPromise.push(addTakeActionPromise);
    }
  }
  return takeActionPromise;
}

function setValue(element) {
  if (element.action == "setconsumption") {
    var addSetValuePromise = config[element.device_type][element.device_id].contract.setConsumption(element.value, { from: config[element.device_type][element.device_id].address });
  } else if (element.action == "setproduction") {
    var addSetValuePromise = config[element.device_type][element.device_id].contract.setProduction(element.value, { from: config[element.device_type][element.device_id].address });
  } else if (element.action == "setvolume") {
    var addSetValuePromise = config[element.device_type][element.device_id].contract.setVolume(element.value, { from: config[element.device_type][element.device_id].address });
  } else if (element.action == "setprice") {
    if (element.device_type == "battery" || element.device_type == "grid") {
      var addSetValuePromise = config[element.device_type][element.device_id].contract.setPrice(element.value[0], element.value[1], { from: config[element.device_type][element.device_id].address });
    } else {
      var addSetValuePromise = config[element.device_type][element.device_id].contract.setPrice(element.value, { from: config[element.device_type][element.device_id].address });
    }
  }

  return addSetValuePromise;
}

function getValue(element) {
  // return singleHouse0.getConsumption.call();
  //return config.house[0].contract.getConsumption.call();
  if (element.type == "house" || element.type == "battery") {
    return element.contract.getConsumption.call();
  } else if (element.type == "pv") {
    return element.contract.getProduction.call();
  }
}

function getPrice(element) {
  // return singleHouse0.getConsumption.call();
  //return config.house[0].contract.getConsumption.call();
  if (element.type == "grid" || element.type == "pv") {
    return element.contract.getPrice.call();
  } else if (element.type == "battery") {
    return element.contract.getSalePrice.call();
  }
}

function checkStep() {
  // we use house0 (could be any element in theory) to check the time step of the system....
  return config.house[0].contract.getTimerStatus.call({from: config.house[0].address});
}

function getNow() {
  return config.house[0].contract.getNow.call({from: config.house[0].address});
}

function jumpTime(a) {
  return increaseTimeTo(latestTime() + duration.seconds(a));
}


function register(element) {
  console.log("Registering " + element.type + " " + element.id);

  console.log("adding device type " + element.type + " --> " + category_nums[element.type]);

  if (element.type == "grid") {
    var addPromise = configuration.addGrid(element.address, { from: config.admin[0].address, gas: 2000000 });
  } else if (element.type != "battery") {
    var addPromise = configuration.addDevice(category_nums[element.type], element.address, 0, true, { from: config.admin[0].address, gas: 2000000 });
  } else {
    var addPromise = configuration.addDevice(category_nums[element.type], element.address, element.capacity, true, { from: config.admin[0].address, gas: 2000000 });
  }

  return addPromise;
}

function getContractAddress(element) {
  if (element.device_type == "grid") {
    return configuration.getGridAdr.call();
  } else {
    return configuration.getContractAddress.call(element.address);
  }
}

contract('Configuration', function (accounts) {

  var i = 0;
  for (var device_type in config) {
    for (var device_id in config[device_type]) {
      (function (element) {
        element.device_name = device_type + element.id;
        element.device_type = device_type;
        element.address = accounts[i];
        console.log(element.device_name);
        i++;
      })(config[device_type][device_id]);
    }
  }

  var virtualTime;


  it("I. Create 3 SingleHouse contracts and link to 3 SinglePVs", function () {

    return Configuration.deployed().then(function (instance) {
      configuration = instance;

      var registerPromises = [];

      for (device_type in config) {
        for (device_id in config[device_type]) {

          (function (element) {
            if (element.device_type == "house" || element.device_type == "pv" || element.device_type == "grid" || element.device_type == "battery") {
              registerPromises.push(register(element));
            }

          })(config[device_type][device_id]);
        }
      }

      return Promise.all(registerPromises)
    }).then(function (result) {

      console.log("All participants registered");
      var getContractAddressPromises = [];

      for (device_type in config) {
        for (device_id in config[device_type]) {

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
    }).then(function (result) {

      console.log("Got all contract addresses!");
      console.log(config);

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

      console.log("Contracts initiated!");
      console.log("Contract Creator=", result);
      console.log("Linking devices:");

      var linkDevicesPromises = [];

      for (var house_id in config.house) {
        for (var pv_id in config.pv) {
          console.log("Linking house[" + house_id + "] with pv[" + pv_id + "]");
          linkDevicesPromises.push(configuration.linkDevices(config.house[house_id].address, config.pv[pv_id].address, { from: config.admin[0].address, gas: 2000000 }));
        }
      }
      return Promise.all(linkDevicesPromises);

    }).then(function () {
      console.log("Linking of devices done.");
    })
  });

  it("II. Set Production and price", function () {

    return checkStep().then(function (result) {
      console.log("We are at step: ", result.toNumber());
      var setValuePromises = [];

      for (var actionNo in input_at_moment) {
        (function (element) {
          setValuePromises.push(setValue(element));
        })(input_at_moment[actionNo]);
      }
      return Promise.all(setValuePromises)
    }).then(function (result) {
      console.log("Set all consumptions/productions/prices. \n === Here are the status of each device: ===");

      var getValuePromises = [];

      for (device_type in config) {
        for (device_id in config[device_type]) {
          (function (element) {
            if (element.type == "pv") {
              getValuePromises.push(getValue(element).then(function (result) {
                console.log("The consumption of", element.device_name, "is ", result[0].toNumber());
                return getPrice(element);
              }).then(function (result) {
                console.log("The price of", element.device_name, "is ", result[0].toNumber());
              }));
            } else if (element.type == "house") {
              getValuePromises.push(getValue(element).then(function (result) {
                console.log("The production of", element.device_name, "is ", result[0].toNumber());
              }));
            } else if (element.type == "battery") {
              getValuePromises.push(getValue(element).then(function (result) {
                console.log("The production of", element.device_name, "is ", result.toNumber());
                return getPrice(element);
              }).then(function (result) {
                console.log("The selling price of", element.device_name, "is ", result[0].toNumber());
              }));
            } else if (element.type == "grid") {
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
    return jumpTime(15).then(function (result) {
      console.log("Here time is been increased (1)");
    /*  return getNow();
    }).then(function (result) {
   // return getNow().then(function (result) {
      console.log("Now is", result.toNumber());*/
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
    return jumpTime(15).then(function (result) {
      console.log("Here time is been increased (2)");
    /*  return getNow();
    }).then(function (result) {
      console.log("Now is", result.toNumber());*/
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
    return jumpTime(15).then(function (result) {
      console.log("Here time is been increased (3)");
      /*return getNow();
    }).then(function (result) {
      console.log("Now is", result.toNumber());*/
//      return checkStep();
    }).then(function (result) {
//      console.log("We are at step ", result.toNumber());
      var sellEnergyPromises = [];

      for (var actionNo in sellEnerygOrder) {
        (function (element) {   // async... not able to jumpTime in a loop...
          //await jumpTime(element.timelapse);
          //takeActionPromises2.push(jumpTime(element.timelapse));//);
          sellEnergyPromises.push(takeAction(element));
        })(sellEnerygOrder[actionNo]);
      }
      return Promise.all(sellEnergyPromises);
    }).then(function (result) {
      console.log("energy sold out \n === Here are the status of each device: ===");

      var getValuePromises = [];

      for (device_type in config) {
        for (device_id in config[device_type]) {
          (function (element) {
            if (element.type == "pv") {
              getValuePromises.push(getValue(element).then(function (result) {
                console.log("The consumption of", element.device_name, "is ", result[0].toNumber());
                return getPrice(element);
              }).then(function (result) {
                console.log("The price of", element.device_name, "is ", result[0].toNumber());
              }));
            } else if (element.type == "house") {
              getValuePromises.push(getValue(element).then(function (result) {
                console.log("The production of", element.device_name, "is ", result[0].toNumber());
              }));
            } else if (element.type == "battery") {
              getValuePromises.push(getValue(element).then(function (result) {
                console.log("The production of", element.device_name, "is ", result.toNumber());
                return getPrice(element);
              }).then(function (result) {
                console.log("The selling price of", element.device_name, "is ", result[0].toNumber());
              }));
            } else if (element.type == "grid") {
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


  // not yet finished!!
/*
  it("III. Price communication House<->PV (4. PV sell excess energy to battery; House buy energy from battery)", async function () {
    // PV2 still has excess energy
    let prod = await singlePV2.getProduction.call();
    console.log("PV2 still has", prod[0].toNumber(), prod[1].toNumber());
    let nowTime = await singleHouse2.getNow.call();
    console.log("Now is", nowTime.toNumber());
    await increaseTimeTo(latestTime() + duration.seconds(300));
    nowTime = await singleHouse2.getNow.call();
    console.log("After time increase, now is", nowTime.toNumber());
    let statTime = await singleHouse0.getTime.call();
    console.log("The status of the global timer is ", statTime.toNumber());
    await singlePV2.sellExcess();
    prod = await singlePV2.getProduction.call();
    console.log("PV2 still has", prod[0].toNumber(), prod[1].toNumber());
  });
*/

});
