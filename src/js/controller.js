Controller = {
  debug: true,

  log: function(line) {
    if (Controller.debug) {
      console.log(line);
    }
  },

  init: function() {
    Controller.log("Initializing:");
    Controller.log("Model...");
    Model.init(function() {
      console.log("Model.init() done.");
      Controller.initWeb3();
    });
  },

  initWeb3: function() {
    // Check whether an injected web3 provider is present (i.e. MetaMask)
    if (typeof web3 !== 'undefined') {
      // Model.web3Provider = web3.currentProvider;
      Model.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    } else {
      // If no injected web3 instance is detected, fallback to the TestRPC
      Model.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }

    web3 = new Web3(Model.web3Provider);

    web3.eth.getAccounts(function(error, accounts) {
      Controller.log("Fetching web3 accounts")
      if (error) {
        console.log(error);
      }
      Model.accounts = accounts;

      var i = 0;
      for (var device_type in Model.config) {
        for (var device_id in Model.config[device_type]) {
          if (Model.config[device_type][device_id].address == 0) {
            Model.config[device_type][device_id].address = accounts[i];
          }
          // for (_acc in Model.accounts) $('#select_address_' + Model.config[device_type][device_id].device_name).append('<option value="' + accounts[_acc] + '">' + accounts[_acc] + '</option>');
          // $('#select_address_' + Model.config[device_type][device_id].device_name).val(accounts[i]);
          i++;
        }
      }
      Controller.initContracts();
    });
  },

  initContracts: function() {

    Controller.initContract("Configuration", function() {
      Model.contracts.Configuration.deployed().then(function(_configurationInstance) {
        configurationInstance = _configurationInstance;
        Model.instances.Configuration = _configurationInstance;

        var promises = [];
        for (device_type in Model.config) {
          for (device_id in Model.config[device_type]) {
            (function(_type, _id) {
              promises.push(Model.instances.Configuration.getContractAddress.call(Model.config[_type][_id].address, {from : Model.config.admin[0].address}).then(function(result) {
                // console.log(Model.config[_type][_id].address);
                console.log("contract address of " + _type + _id + ": " + result);
                Model.config[_type][_id].contract_address = result;
                if (Model.contract_names[_type] != undefined ) {
                  // Controller.log(Model.contract_names[_type]);
                  Controller.initContract(Model.contract_names[_type], function() {
                    Model.config[_type][_id].contract = Model.contracts[Model.contract_names[_type]].at(Model.config[_type][_id].contract_address);

                    if (Model.config[_type][_id].contract_address != 0) {
                      // $("#btn_register_" + App.config[_type][_id].device_name).attr("disabled", "disabled");
                    }

                    Controller.log("Contract for " + Model.config[_type][_id].device_name + " initialized.");
                  });
                }
              }));
            })(device_type, device_id);
          }
        }

        Promise.all(promises).then(function() {
          Controller.log("Initialization of participant contracts done.");
          Controller.update_entries();
          View.init();
        });

      });
    });
    return View.bindEvents();
  },

  initContract: function(contract_name, callback) {
    // Fetch contract artefact and initialize contract using truffle-contract
    Controller.log("Getting " + contract_name + ".json");
    if (Model.contracts[contract_name] == undefined) {
      $.getJSON(contract_name + '.json', function(data) {
        var contract_artifact = data;
        Model.contracts[contract_name] = TruffleContract(contract_artifact);
        Model.contracts[contract_name].setProvider(Model.web3Provider);
        callback();
      });
    } else {
      callback();
    }
  },

  // Loop over all items in config json and update their entries
  update_entries: function() {
    for (device_type in Model.config) {
      for (device_id in Model.config[device_type]) {
        (function(element) {
          Controller.update_model(element, View.update_view);
        })(Model.config[device_type][device_id]);
      }
    }
  },

  update_model: function(element, callback) {
    var promises = [];
    element.balance = web3.eth.getBalance(element.address);

    if (element.contract != undefined) {

      if (element.contract.getValue != undefined) {
        promises.push(element.contract.getValue.call().then(function(result) {
          // Controller.log(element.device_name + " value: " + result[0].toNumber() + " at " + result[1].toNumber());
          element.value = {'value': result[0].toNumber(), 'timestamp': result[1].toNumber()};
        }).catch(function() {
          Controller.log("Error in getValue() <-", element.device_name);
        }));
      }

      if (element.contract.getConsumption != undefined) {
        promises.push(element.contract.getConsumption.call().then(function(result) {
          // Controller.log(element.device_name + " value: " + result[0].toNumber() + " at " + result[1].toNumber());
          element.value = {'value': result[0].toNumber(), 'timestamp': result[1].toNumber()};
        }).catch(function() {
          Controller.log("Error in getConsumption() <-", element.device_name);
        }));
      }

      if (element.contract.getProduction != undefined) {
        promises.push(element.contract.getProduction.call().then(function(result) {
          // Controller.log(element.device_name + " value: " + result[0].toNumber() + " at " + result[1].toNumber());
          element.value = {'value': result[0].toNumber(), 'timestamp': result[1].toNumber()};
        }).catch(function() {
          Controller.log("Error in getProduction() <-", element.device_name);
        }));
      }

      if (element.contract.getWallet != undefined) {
        promises.push(element.contract.getWallet.call().then(function(result) {
          // Controller.log(element.device_name + " wallet: " + result.toNumber());
          element.wallet = result.toNumber();
        }).catch(function() {
          Controller.log("Error in getWallet() <-", element.device_name);
        }));
      }

      if (element.contract.getPrice != undefined && element.type != 'grid') {
        promises.push(element.contract.getPrice.call().then(function(result) {
          // Controller.log(element.device_name + " price: " + result[0]);
          element.price = result[0].toNumber();
        }).catch(function() {
          Controller.log("Error in getPrice() <-", element.device_name);
        }));
      }
    }

    Promise.all(promises).then(function() {
      if (callback != undefined) callback(element);
    });
  },

  // Query and return current blocktimestamp
  blocktime: function(callback) {
    web3.eth.getBlockNumber(function(error, blockNumber) {
      Controller.log("Blockumber: " + blockNumber);
      web3.eth.getBlock(blockNumber, function(error, block) {
        Controller.log("Current timestamp: " + block.timestamp);
        callback(block.timestamp);
      });
    });

  },

  set_value: function(element, value, callback) {
    Controller.log("Setting value for " + element.type + " " + element.id);
    Controller.log("Value: " + value);

    if (element.contract.setValue != undefined) {
      element.contract.setValue(value, {from: element.address, gas: 210000}).then(function(result) {
        element.contract.getValue.call().then(function(result) {
          if (callback != undefined) callback((result[0] = value));
          Controller.log("Value of " + element.device_name + " is: " + result[0] + " at " + result[1]);
          Controller.update_model(element, View.update_view);
        });
      }).catch(function() {
        Controller.log("Error in setValue() <- " + element.device_name);
      });
    } else if (element.contract.setProduction != undefined) {
      element.contract.setProduction(value, {from: element.address, gas: 210000}).then(function(result) {
        element.contract.getProduction.call().then(function(result) {
          if (callback != undefined) callback((result[0] == value));
          Controller.log("Production of " + element.device_name + " is: " + result[0] + " at " + result[1]);
          Controller.update_model(element, View.update_view);
        });
      }).catch(function() {
        Controller.log("Error in setProduction() <- " + element.device_name);
      });
    } else if (element.contract.setConsumption != undefined) {
      element.contract.setConsumption(value, {from: element.address, gas: 210000}).then(function(result) {
        element.contract.getConsumption.call().then(function(result) {
          if (callback != undefined) callback((result[0] == value));
          Controller.log("Consumption of " + element.device_name + " is: " + result[0] + " at " + result[1]);
          Controller.update_model(element, View.update_view);
        });
      }).catch(function() {
        Controller.log("Error in setConsumption() <- " + element.device_name);
      });
    } else {
      Controller.log("setValue() not implemented!");
    }

  },

  set_price: function(element, price) {
    Controller.log("Setting price for " + element.type + " " + element.id);
    Controller.log("Price: " + price);

    if (element.contract.setPrice != undefined) {
      if (element.type == "pv"){
        var setPricePromise = element.contract.setPrice(price, {from: element.address, gas: 210000});
      }
      else if (element.type == "grid") {
        var setPricePromise = element.contract.setPrice(price, price, {from: element.address, gas: 210000});
      }

      setPricePromise.then(function(result) {
        element.contract.getPrice.call().then(function(result) {
          Controller.log("Price of " + element.device_name + " is: " + result[0]);
          Controller.update_model(element, View.update_view);
        });
      });
    } else {
      Controller.log("setPrice() not implemented!");
    }
  },

  /*
  This function handles the registering of the according object
  */
  register: function(element) {
    Controller.log("Registering " + element.type + " " + element.id);

    Model.contracts.Configuration.deployed().then(function(instance) {
      configurationInstance = instance;
      Controller.log("adding device type " + element.type + " --> " + Model.category_nums[element.type] );
      Controller.log(configurationInstance);

      if (element.type == "grid") {
        return configurationInstance.addGrid(element.address, {from: Model.config.admin[0].address, gas: 2000000});
      } else {
        return configurationInstance.addDevice(Model.category_nums[element.type], element.address, 0, true, {from: Model.config.admin[0].address, gas: 2000000});
      }
    }).then(function(result) {
      Controller.log(result);
      return configurationInstance.getContractAddress.call(element.address, {from: Model.config.admin[0].address});

    }).then(function(result) {
      Controller.log("Contract address:", result);
      element.contract_address = result;

      Controller.initContract(Model.contract_names[element.type], function() {
        element.contract = Model.contracts[Model.contract_names[element.type]].at(element.contract_address);
      });

      Controller.update_model(element, View.update_view);
    });
  },

  execute: function(element, fname, callback) {
    if (element.contract[fname] != undefined) {
      View.log(element, fname+"()");
      // Controller.log(element.device_name + " " + fname + "()");
      element.contract[fname]({from: element.address, gas: 210000000}).then((result)=>{
        View.log(element, "Got " + fname + "() receipt.");
        // Controller.log(element.device_name + "<-- " + fname + "() receipt:");
        // Controller.log(result);
        if (callback != undefined) callback(result);
      }).catch(function(error) {
        View.log(element, fname + "() error");
        View.log(element, error);
        // Controller.log("Error in " + fname + "() <- " + element.device_name);
      });
    }
  },

  get_energy: function(timestamp, duration, req_type, callback) {
    var host = "localhost:8080";
    var query_string = "/?stop=" + timestamp + "&duration=" + duration + "&type=" + req_type;
    $.get("http://" + host + query_string, function(data) {
      if (callback != undefined) callback(JSON.parse(data));
    });
  },

  link_participants: function(callback) {
    Model.contracts.Configuration.deployed().then(function(instance) {
      configurationInstance = instance;
      var link_promises = [];
      // console.log(Model.config.house);
      // console.log(Model.config.pv);

      for (house_id in Model.config.house) {
        for (pv_id in Model.config.pv) {
          Controller.log("Linking house[" + house_id + "] with pv[" + pv_id + "]");
          link_promises.push(configurationInstance.linkDevices(Model.config.house[house_id].address, Model.config.pv[pv_id].address, {from: Model.config.admin[0].address, gas: 2000000}));
        }
      }
      Promise.all(link_promises).then(function() {
        Controller.log("Linking done.");
        if (callback != undefined) callback();
        // var check_promises = [];
        // for (pv_id in Model.config.pv) {
        //   (function(_pv_id) {
        //     check_promises.push(configurationInstance.getPVConnection.call(Model.config.pv[pv_id].address).then(function(result) {
        //       Controller.log("pv[" + _pv_id + "] connected to " + result[0] + " houses and " + result[1] + " batteries");
        //     }));
        //   })(pv_id);
        // }
        //
        // Promise.all(check_promises).then(function() {
        //   Controller.log("Checking done. Launching callback.");
        //   if (callback != undefined) callback();
        // });
      });
    });
  },

  settle_auto: function() {
    askForPrice_promises = [];

    Controller.log("Houses ask for prices.");
    for (house_id in Model.config.house) {
      askForPrice_promises.push(Model.config.house[house_id].contract.askForPrice({from: Model.config.house[house_id].address, gas: 2000000}));
    }

    Promise.all(askForPrice_promises).then(function() {
      Controller.log("Houses done. Houses sort prices.");
      sortPrice_promises = [];
      for (house_id in Model.config.house) {
        sortPrice_promises.push(Model.config.house[house_id].contract.sortPriceList({from: Model.config.house[house_id].address, gas: 2000000}));
      }

      Promise.all(sortPrice_promises).then(function() {
        Controller.log("Houses done. PVs ask for ranks.");
        askForRank_promises = [];
        for (pv_id in Model.config.pv) {
          askForRank_promises.push(Model.config.pv[pv_id].contract.askForRank({from: Model.config.pv[pv_id].address, gas: 2000000}));
        }

        Promise.all(askForRank_promises).then(function() {
          Controller.log("PVs done. Initiate transactions.");
          Controller.initiate_transactions();
        });

      });
    });
  },

  initiate_transactions: function() {
    var promises = [];

    for (pv_id in Model.config.pv) {
      Controller.log("pv[" + pv_id + "] initiating transactions");

      (function(_pv_id, _house_id) {
        Model.config.pv[_pv_id].contract.getSortedInfo.call(0).then(function(result) {
          Controller.log("pv[" + _pv_id + "].total = " + result[3]);

          for (var rank=0; rank<result[3]; rank++) {
            (function(__pv_id, _rank) {
              Controller.log("pv[" + pv_id + "] initiating transaction with rank " + _rank);
              promises.push(Model.config.pv[__pv_id].contract.initiateTransaction(_rank, {from: Model.config.pv[0].address, gas: 2000000}).catch(function() {
                Controller.log("Error initiating transaction <-" + Model.config.pv[__pv_id]);
              }));
            })(_pv_id, rank);
          }

          Promise.all(promises).then(function() {
            Controller.log("DONE.");
            Controller.update_entries();

          });

        });
      })(pv_id, house_id);
    }

  }
};



$(function() {
  $(window).load(function() {
    Controller.init();
  });
});
