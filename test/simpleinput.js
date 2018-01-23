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
      "volume" : [
        5
      ],
      "consumption" : [
        3
      ],
      "price" : [
        [20, 3]
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
  ]
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
    1 : ["setVolume", "setConsumption", "setPrice"],
    2 : ["askPrice", "sortPrice"],
    3 : ["askForRank", "sortRank"],
    4 : ["sellEnergy"]
  }
};

exports.checkStatusActions = {
  "grid" : [
    "getPrice"
  ],
  "house" : [
    "getConsumptionE",
    // "getConsumptionH"
  ],
  "pv" : [
    "getProduction",
    "getPrice"
  ],
  "battery" : [
    "getConsumption",
    "getVolumeCapacity",
    "getPrice"
  ]
};


exports.input_at_moment = [
  {
    "device_type": "house",
    "device_id": 0,
    "element": exports.config.house[0],
    "action": "setconsumption",
    "value": 3
  },
  {
    "device_type": "house",
    "device_id": 1,
    "element": exports.config.house[1],
    "action": "setconsumption",
    "value": 3
  },
  {
    "device_type": "house",
    "device_id": 2,
    "element": exports.config.house[2],
    "action": "setconsumption",
    "value": 8
  },
  {
    "device_type": "pv",
    "device_id": 0,
    "element": exports.config.pv[0],
    "action": "setproduction",
    "value": 5
  },
  {
    "device_type": "pv",
    "device_id": 1,
    "element": exports.config.pv[1],
    "action": "setproduction",
    "value": 10
  },
  {
    "device_type": "pv",
    "device_id": 2,
    "element": exports.config.pv[2],
    "action": "setproduction",
    "value": 10
  },
  {
    "device_type": "battery",
    "device_id": 0,
    "element": exports.config.battery[0],
    "action": "setvolume",
    "value": 5
  },
  {
    "device_type": "battery",
    "device_id": 0,
    "element": exports.config.battery[0],
    "action": "setconsumption",
    "value": 3
  },
  {
    "device_type": "pv",
    "device_id": 0,
    "element": exports.config.pv[0],
    "action": "setprice",
    "value": 20
  },
  {
    "device_type": "pv",
    "device_id": 1,
    "element": exports.config.pv[1],
    "action": "setprice",
    "value": 15
  },
  {
    "device_type": "pv",
    "device_id": 2,
    "element": exports.config.pv[2],
    "action": "setprice",
    "value": 30
  },
  {
    "device_type": "battery",
    "device_id": 0,
    "element": exports.config.battery[0],
    "action": "setprice",
    "value": [20, 3]
  },
  {
    "device_type": "grid",
    "device_id": 0,
    "element": exports.config.grid[0],
    "action": "setprice",
    "value": [10, 1]
  }
];

exports.action_at_moment_1 = [
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

exports.action_at_moment_2 = [
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


exports.sellEnergyOrder = [
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

exports.sellExcessOrder = [
  {
    "device_type": "pv",
    "device_id": 2,
    "action": "sellexcessenergy",
    "timelapse": 1      //15
  }
];