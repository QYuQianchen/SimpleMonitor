exports.inputs = {
  "house" : [
    {
      "consumption" : [
        3, 4, 5
      ]
    },

    {
      "consumption" : [
        3, 4, 5
      ]
    },

    {
      "consumption" : [
        8, 9, 10
      ]
    }
  ],

  "pv" : [
    {
      "production" : [
        5, 6, 7
      ],
      "price" : [
        20, 20, 20
      ]
    },

    {
      "production" : [
        10, 11, 12
      ],
      "price" : [
        15, 15, 15
      ]
    },

    {
      "production" : [
        10, 11, 12
      ],
      "price" : [
        30, 30, 30
      ]
    }
  ],

  "battery" : [
    {
      // setVolume can only be used once in the beginning...
      // "volume" : [
      //   5
      // ],
      "consumption" : [
        3, 2, 1
      ],
      "price" : [
        [20, 3],[20, 3],[20, 3]
      ]
    }
  ],
  "grid" : [
    {
      "price" : [
        [20, 3], [20, 3], [20, 3]
      ]
    }
  ],
}

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
      "capacity": 20,
      "contract_address": 0
    }
  ],
};


exports.actions = {
  "grid" : {
    1 : ["setPrice"]
  },
  "house" : {
    1 : ["setConsumption"],
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
  }
};

exports.checkStatusActions = {
  "grid" : {
    1: "getPrice",
    2: "getWallet"
  },

  "house" : {
    1: "getConsumptionE",
    2: "getWallet"
    // 2: ["getConsumptionH"]
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
  }
};