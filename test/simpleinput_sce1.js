exports.inputs = require("./data/input/dyn_input_sce1.json");

exports.config = {
  "admin": [
    {
      "id": 0,
      "address": 0,
      "contract_address": 0
    }
  ],

  "grid": [
    {
      "id": 0,
      "address": 0,
      "picture": "images/grid.png",
      "contract_address": 0
    }
  ],


  "house": [
    {
      "id": 0,
      "picture": "images/house.png",
      "address": 0,
      "contract_address": 0
    },
    {
      "id": 1,
      "picture": "images/house.png",
      "address": 0,
      "contract_address": 0
    },
    {
      "id": 2,
      "picture": "images/house.png",
      "address": 0,
      "contract_address": 0
    }
  ],
  
  "pv": [
    {
      "id": 0,
      "picture": "images/pv.png",
      "address": 0,
      "contract_address": 0
    },
    {
      "id": 1,
      "picture": "images/pv.png",
      "address": 0,
      "contract_address": 0
    },
    {
      "id": 2,
      "picture": "images/pv.png",
      "address": 0,
      "contract_address": 0
    }
  ],
    
  "battery": [
    {
      "id": 0,
      "address": 0,
      "capacity": 200,
      "volume": 5,
      "contract_address": 0
    }
  ],

  "heatpump": [
    { 
      "id": 0, 
      "address": 0, 
      "watertype": false, 
      "contact_address": 0,
      "price": 3
    }, 
    { 
      "id": 1, 
      "address": 0, 
      "watertype": false, 
      "contact_address": 0,
      "price": 4
    }, 
    { 
      "id": 2, 
      "address": 0, 
      "watertype": true, 
      "contact_address": 0,
      "price": 5
    } 
  ],

  "watertank":[
    {
      "id": 0,
      "address": 0,
      "watertype": false, 
      "volume": 80, 
      "capacity": 100,
      "contact_address": 0
    },
    {
      "id": 1,
      "address": 0,
      "watertype": false, 
      "volume": 80, 
      "capacity": 100,
      "contact_address": 0
    },
    {
      "id": 2,
      "address": 0,
      "watertype": true, 
      "volume": 90, 
      "capacity": 120,
      "contact_address": 0
    }
  ]
};


exports.actions = {
  "grid" : {
    1 : ["setPrice"]
  },
  "house" : {
    1 : ["setConsumption", "setConsumptionH"],
    2 : ["askForPrice", "sortPrice"],
    5 : ["buyExtra"]
  },
  "pv" : {
    1 : ["setProduction", "setPrice"],
    3 : ["askForRank", "sortRank"],
    4 : ["sellEnergy"],
    5 : ["sellExcess"]
  },
  "battery" : {
    1 : ["setConsumption", "setPrice"],   // remove the "setVolume"
    2 : ["askForPrice", "sortPrice"],
    3 : ["askForRank", "sortRank"],
    4 : ["sellEnergy"]
  },
  "watertank" : {
    1 : ["setConsumption"],
    2 : ["askForPrice"],
    3 : ["askForNeed"],
    4 : ["sellEnergy"]
  },
  "heatpump" : {
    2 : ["askForConsump", "askForPrice", "sortPrice"],
    5 : ["buyExtra"]
  }
};

exports.checkStatusActions = {
  "grid" : {
    1: "getPrice",
    2: "getWallet"
  },

  "house" : {
    1: "getConsumptionE",
    2: "getConsumptionH",
    3: "getWallet"
  },

  "pv" : {
    1: "getProduction",
    2: "getPrice",
    3: "getWallet"
  },

  "battery" : {
    1: "getConsumption",
    2: "getVolumeCapacity",
    3: "getSalePrice",
    4: "getWallet"
  },

  "heatpump" : {
    1: "getConsumptionE",
    2: "getConsumptionW",
    3: "getPrice",
    4: "getWallet"
  },

  "watertank" : {
    1: "getConsumption",
    2: "getVolume",
    3: "getPrice",
    4: "getWallet"
  }
};

exports.category_nums = {
  "house": 0,
  "pv": 1,
  "battery": 2,
  "grid": 5,
  "watertank": 4,
  "heatpump": 3
};

exports.actionInputs = {
  "setConsumption" : "consumption",
  "setConsumptionH" : "consumptionH",
  "setProduction" : "production",
  "setPrice" : "price",
  // "setVolume" : "volume"
};

exports.deviceLinking = {

};