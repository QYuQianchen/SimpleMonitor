
var config = {
  "admin" : [
    {
			"id": 0,
			"address": 0,
			"contract_address": 0,
      "type" : "admin"
		}
  ],

  "grid" : [
    {
			"id": 0,
			"address": 0,
      "picture": "images/grid.png",
			"contract_address": 0,
      "type" : "grid"
		}
  ],
	"house": [
    {
			"id": 0,
      "picture": "images/house.png",
			"address": 0,
			"contract_address": 0,
      "type" : "house"
		},
    {
			"id": 1,
      "picture": "images/house.png",
			"address": 0,
			"contract_address": 0,
      "type" : "house"
		}
	],
	"pv": [
    {
			"id": 0,
      "picture": "images/pv.png",
			"address": 0,
			"contract_address": 0,
      "type" : "pv"
		},
    {
			"id": 1,
      "picture": "images/pv.png",
			"address": 0,
			"contract_address": 0,
      "type" : "pv"
		}
	],
	"battery": [
  ]
};

var configuration = null;

contract('factoryinterface', function(accounts) {

  var i = 0;
  for (var device_type in config) {
    for (var device_id in config[device_type]) {
      (function (element) {
        element.device_name = device_type + element.id;
        element.device_type = device_type;
        element.address = accounts[i];
        console.log("Device name: " + element.device_name);
        i++;
      })(config[device_type][device_id]);
    }
  }

  it("is creating grid contract", function() {

    return Configuration.deployed().then(function(instance){
      configuration = instance;

  
    }).then(function(result){
    })
  });

  it("is adding houses in the layout", function() {
    var registerPromises = [];

      for (device_type in config) {
        for (device_id in config[device_type]) {
          (function(element) {
            if (element.device_type == "house"|| element.device_type == "pv" || element.device_type == "grid") {
              registerPromises.push(register(element));
            }
          })(config[device_type][device_id]);
        }
      }

      return Promise.all(registerPromises)

  });

  it("is adding pvs in the layout", function() {

  });
});
