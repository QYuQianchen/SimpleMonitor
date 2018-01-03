exports.step0 = function (callback) {

  return Configuration.deployed().then(function (instance) {
    configuration = instance;
    console.log("Starting to register devices...");

    return registerAll(config);

  }).then(function (result) {

    console.log("All participants registered");
    console.log("Starting to get contract addresses...");

    return getAllContractAddresses(config);

  }).then(function (result) {

    console.log("Got all contract addresses!");
    console.log("Starting to instatiate contracts...");

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

    console.log("Contracts instantiated!");
    console.log("Contract Creator = ", result);
    console.log("Linking devices:");

    return linkDevices(config);

  }).then(function () {
    console.log("Linking of devices done.");
    if (callback != undefined) callback();
  });
}
