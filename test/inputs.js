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
