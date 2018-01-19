var SortPLib = artifacts.require("./SortPLib.sol");
var SortRLib = artifacts.require("./SortRLib.sol");
var AdrLib = artifacts.require("./AdrLib.sol");
var TransactLib = artifacts.require("./TransactLib.sol");
var PriceLib = artifacts.require("./PriceLib.sol");
var ConvertLib = artifacts.require("./ConvertLib.sol");
var Grid = artifacts.require("./Grid.sol");
var GlobalTimer = artifacts.require("./GlobalTimer.sol");
var Configuration = artifacts.require("./Configuration.sol");

var GeneralDevice = artifacts.require("GeneralDevice.sol")

var SingleHouseFactory = artifacts.require("SingleHouseFactory");
var SinglePVFactory = artifacts.require("SinglePVFactory");
var SingleBatteryFactory = artifacts.require("SingleBatteryFactory");
var SingleHeatPumpFactory = artifacts.require("SingleHeatPumpFactory");
var SingleWaterTankFactory = artifacts.require("SingleWaterTankFactory");
// var GridFactory = artifacts.require("GridFactory");



module.exports = function(deployer) {

  console.log("migrations deploying...");

  deployer.deploy(SortRLib).then(function() {

    return deployer.link(SortRLib,[SinglePVFactory,SingleBatteryFactory,Configuration]);
  }).then(function() {
    return deployer.deploy(SortPLib);
  }).then(function() {
    return deployer.link(SortPLib,[SingleHouseFactory,SingleBatteryFactory,SingleHeatPumpFactory,Configuration]);
  }).then(function() {
    return deployer.deploy(AdrLib);
  }).then(function() {
    return deployer.link(AdrLib,[SingleHouseFactory,SinglePVFactory,SingleBatteryFactory,SingleHeatPumpFactory,SingleWaterTankFactory,Configuration]);
  }).then(function() {
    return deployer.deploy(TransactLib);
  }).then(function() {
    return deployer.link(TransactLib,[SingleHouseFactory,SinglePVFactory,SingleBatteryFactory,SingleHeatPumpFactory,Configuration]);
  }).then(function() {
    return deployer.deploy(PriceLib);
  }).then(function() {
    return deployer.link(PriceLib, [SingleWaterTankFactory, Configuration]);
  }).then(function() {
    return deployer.deploy(ConvertLib);
  }).then(function() {
    return deployer.link(ConvertLib, [SingleHeatPumpFactory, Configuration]);
  }).then(function() {


    return deployer.deploy(SingleHouseFactory);
  }).then(function() {
    console.log("SingleHouseFactory ADDRESS: " + SingleHouseFactory.address);

    return deployer.deploy(SinglePVFactory);
  }).then(function() {
    console.log("SinglePVFactory ADDRESS: " + SinglePVFactory.address);

    return deployer.deploy(SingleBatteryFactory);
  }).then(function() {
    console.log("SingleBatteryFactory ADDRESS: " + SingleBatteryFactory.address);

    return deployer.deploy(SingleHeatPumpFactory);
  }).then(function() {
    console.log("SingleHeatPumpFactory ADDRESS: " + SingleHeatPumpFactory.address);

    return deployer.deploy(SingleWaterTankFactory);
  }).then(function() {
    console.log("SingleWaterTankFactory ADDRESS: " + SingleWaterTankFactory.address);
    
  //   return deployer.deploy(GeneralDevice);
  // }).then(function() {
    
  //   console.log("General Device ADDRESS: " + GeneralDevice.address);

    // return deployer.deploy(GridFactory);
  // }).then(function() {
    // console.log("GridFactory ADDRESS: " + GridFactory.address);
    // return deployer.deploy(Configuration, SingleHouseFactory.address);
    return deployer.deploy(Configuration, SingleHouseFactory.address, SinglePVFactory.address, SingleBatteryFactory.address, SingleHeatPumpFactory.address,  SingleWaterTankFactory.address);
    // return deployer.deploy(Configuration, SingleHouseFactory.address, SinglePVFactory.address, SingleBatteryFactory.address, SingleHeatPumpFactory.address,  SingleWaterTankFactory.address, GridFactory.address);
  }).then(function() {
  }).then(function() {
    console.log("Configuration ADDRESS: " + Configuration.address);
  });
}