var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer) {
  //deployer.deploy(Migrations, {gas: 90000000000});
  deployer.deploy(Migrations);
};
