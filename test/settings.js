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
    }
  ],
  "battery": [
    {
      "id": 0,
      "address": 0,
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
