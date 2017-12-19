exports.inputs = {
  "house" : [
    {
      "consumption" : [
        3
      ]
    },
    {
      "consumption" : [
        3
      ]
    },
    {
      "consumption" : [
        8
      ]
    }
  ],

  "pv" : [
    {
      "production" : [
        5
      ],
      "price" : [
        20
      ]
    },
    
    {
      "production" : [
        10
      ],
      "price" : [
        15
      ]
    },

    {
      "production" : [
        10
      ],
      "price" : [
        30
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
        [20, 3]
      ]
    }
  ],
}
