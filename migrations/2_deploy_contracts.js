var SortLib = artifacts.require("./SortLib.sol");
var SortRLib = artifacts.require("./SortRLib.sol");
var AdrLib = artifacts.require("./AdrLib.sol");
var TransacLib = artifacts.require("./TransactLib.sol");
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
  deployer.link(SortRLib,[SinglePV,Configuration]);

  deployer.deploy(SortLib);
  deployer.link(SortLib,[SingleHouse,Configuration]);

  deployer.deploy(AdrLib);
  deployer.link(AdrLib,[SingleHouse,SinglePV,SingleBattery,Configuration]);

  deployer.deploy(TransacLib);
  deployer.link(TransacLib,[SingleHouse,SinglePV,SingleBattery,Configuration]);

  deployer.deploy(SinglePV);
  deployer.deploy(SingleHouse);
  deployer.deploy(SingleBattery);
  deployer.deploy(Grid);
  //deployer.deploy(HouseLib);
  //deployer.link(SortLib,MatchableHouse);
  //deployer.link(HouseLib, MatchableHouse);
  //deployer.deploy(MatchableHouse);
  //deployer.link(SortLib,Configuration);
  deployer.deploy(Configuration,3,3,1);
  //deployer.deploy(ElecTransac);
};
