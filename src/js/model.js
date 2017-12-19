Model = {
  config: {},
  contracts: {},
  instances: {},
  web3Provider: null,
  accounts: [],

  contract_names: {
    'house' : 'SingleHouse',
    'pv' : 'SinglePV',
    'battery' : 'SingleBattery',
    'grid' : 'Grid'
  },

  category_nums: {
    "house" : 0,
    "pv" : 1,
    "battery" : 2,
    "grid" : 3
  },

  init: function(callback) {
    // Load configuration JSON to load elements into table view.
    $.getJSON('../config.json', function(config) {
      for (var device_type in config) {
          for (var device_id in config[device_type]) {
            (function(element) {
              element.device_name = device_type + config[device_type][device_id].id;
              element.type = device_type;
            })(config[device_type][device_id]);
          }
      }
      Model.config = config;
      if (callback != undefined) callback();
    });
  },
}
