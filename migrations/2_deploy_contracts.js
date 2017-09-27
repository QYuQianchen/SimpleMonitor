// var Calculator = artifacts.require("./Calculator.sol"); // Change the name
// var MultiNumberBettingV1 = artifacts.require("./MultiNumberBettingV1.sol");
// var MultiNumberBettingV2 = artifacts.require("./MultiNumberBettingV2.sol");
//var SimpleConfigMonitorV1 = artifacts.require("./SimpleConfigMonitorV1.sol");
var SimpleConfigMonitorV2 = artifacts.require("./SimpleConfigMonitorV2.sol");

module.exports = function(deployer) {
  //deployer.deploy(Calculator,10);  // Change the name to the new file
  //deployer.deploy(MultiNumberBettingV1,2,3,4);  // Change the name to the new file
  //deployer.deploy(MultiNumberBettingV2,2,3,4);  // Change the name to the new file
 // deployer.deploy(SimpleConfigMonitorV1,5,10,3,3,8,5); 
  deployer.deploy(SimpleConfigMonitorV2,5,10,3,3,8,5); 
};
