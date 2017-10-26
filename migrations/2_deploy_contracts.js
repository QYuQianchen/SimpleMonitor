var Configuration = artifacts.require("./Configuration.sol");
var ElecTransac = artifacts.require("./ElecTransac.sol");
var Grid = artifacts.require("./Grid.sol");
var HouseLib = artifacts.require("./HouseLib.sol");
var SortLib = artifacts.require("./SortLib.sol");
var MatchableHouse = artifacts.require("./MatchableHouse.sol");
var SingleBattery = artifacts.require("./SingleBattery.sol");
var SingleHouse = artifacts.require("./SingleHouse.sol");
var SinglePV = artifacts.require("./SinglePV.sol");



module.exports = function(deployer) {
  deployer.deploy(SortLib);
  deployer.deploy(SinglePV);
  deployer.link(SortLib,SingleHouse);
  deployer.deploy(SingleHouse);
  deployer.deploy(SingleBattery);
  deployer.deploy(HouseLib);
  deployer.link(SortLib,MatchableHouse);
  deployer.link(HouseLib, MatchableHouse);
  deployer.deploy(MatchableHouse);
  deployer.link(SortLib,Configuration);
  deployer.deploy(Configuration,3,3,1);
  deployer.deploy(ElecTransac);
};
