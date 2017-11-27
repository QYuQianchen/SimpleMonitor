var SortPLib = artifacts.require("./SortPLib.sol");
var SortRLib = artifacts.require("./SortRLib.sol");
var AdrLib = artifacts.require("./AdrLib.sol");
var TransacLib = artifacts.require("./TransactLib.sol");
var GeneralDevice = artifacts.require("./GeneralDevice.sol");
var IPV = artifacts.require("./IPV.sol");
var IHouse = artifacts.require("./IHouse.sol");
var IBattery = artifacts.require("./IBattery.sol");
var SinglePV = artifacts.require("./SinglePV.sol");
var SingleHouse = artifacts.require("./SingleHouse.sol");
var SingleBattery = artifacts.require("./SingleBattery.sol");
var Grid = artifacts.require("./Grid.sol");
var Configuration = artifacts.require("./Configuration.sol");



module.exports = function(deployer) {
  //deployer.deploy(IPV);
  //deployer.deploy(IHouse);
  //deployer.link(IPV,[SinglePV,SingleHouse]);
  //deployer.link(IHouse,[SingleHouse]);
  // No need to deploy abstract contract?!?

  deployer.deploy(SortRLib);
  deployer.link(SortRLib,[SinglePV,SingleBattery,Configuration]);

  deployer.deploy(SortPLib);
  deployer.link(SortPLib,[SingleHouse,SingleBattery,Configuration]);

  deployer.deploy(AdrLib);
  deployer.link(AdrLib,[SingleHouse,SinglePV,SingleBattery,Configuration]);

  deployer.deploy(TransacLib);
  deployer.link(TransacLib,[SingleHouse,SinglePV,SingleBattery,Grid,Configuration]);

  deployer.deploy(SinglePV);
  deployer.deploy(SingleHouse);
  deployer.deploy(SingleBattery);
  deployer.deploy(Grid);
  //deployer.deploy(HouseLib);
  //deployer.link(SortLib,MatchableHouse);
  //deployer.link(HouseLib, MatchableHouse);
  //deployer.deploy(MatchableHouse);
  //deployer.link(SortLib,Configuration);
  //deployer.deploy(Configuration,3,3,1);
  deployer.deploy(Configuration);
  //deployer.deploy(ElecTransac);
};
