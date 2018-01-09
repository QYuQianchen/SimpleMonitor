var SortPLib = artifacts.require("./SortPLib.sol");
var SortRLib = artifacts.require("./SortRLib.sol");
var AdrLib = artifacts.require("./AdrLib.sol");
var TransacLib = artifacts.require("./TransactLib.sol");
var PriceLib = artifacts.require("./PriceLib.sol");
var ConvertLib = artifacts.require("./ConvertLib.sol");
var GeneralDevice = artifacts.require("./GeneralDevice.sol");
//var IPV = artifacts.require("./IPV.sol");
//var IHouseE = artifacts.require("./IHouseE.sol");
//var IHouseH = artifacts.require("./IHouseH.sol");
var IBattery = artifacts.require("./IBattery.sol");
var SinglePV = artifacts.require("./SinglePV.sol");
var SingleHouse = artifacts.require("./SingleHouse.sol");
var SingleBattery = artifacts.require("./SingleBattery.sol");
var SingleHeatPump = artifacts.require("./SingleHeatPump.sol");
var SingleWaterTank = artifacts.require("./SingleWaterTank.sol");
var Grid = artifacts.require("./Grid.sol");
//var ITimer = artifacts.require("./ITimer.sol");
var GlobalTimer = artifacts.require("./GlobalTimer.sol");
var Configuration = artifacts.require("./Configuration.sol");



module.exports = function(deployer) {

  deployer.deploy(SortRLib);
  deployer.link(SortRLib,[SinglePV,SingleBattery,Configuration]);

  deployer.deploy(SortPLib);
  deployer.link(SortPLib,[SingleHouse,SingleBattery,Configuration]);

  deployer.deploy(AdrLib);
  deployer.link(AdrLib,[SingleHouse,SinglePV,SingleBattery,Configuration]);

  deployer.deploy(TransacLib);
  deployer.link(TransacLib,[SingleHouse,SinglePV,SingleBattery,Grid,Configuration]);

  deployer.deploy(PriceLib);
  deployer.link(PriceLib, [SingleWaterTank, Configuration]);

  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, [SingleHeatPump, Configuration]);

  deployer.deploy(SinglePV);
  deployer.deploy(SingleHouse);
  deployer.deploy(SingleBattery);
  deployer.deploy(Grid);

  deployer.deploy(GlobalTimer);
  deployer.deploy(Configuration, {gas: 6000000});

};
