var Configuration = artifacts.require("./Configuration.sol");

contract('Configuration', function(accounts) {
  var address_PV0 = accounts[0];
  var address_PV1 = accounts[1];
  var address_H0= accounts[2];
  var address_H1= accounts[3];
  var address_H2= accounts[4];
  var address_B0= accounts[5];

  it("should assert true", function() {
    var configuration;
    return Configuration.deployed().then(function(instance){
      configuration = instance;
      configuration.addHouse(address_H0,3);
      configuration.addHouse(address_H1,3);
      configuration.addHouse(address_H2,8)
      configuration.addPV(address_PV0,-5);
      configuration.addPV(address_PV1,-10);
      configuration.addBattery(address_B0,20,5);
      //return configuration.checkHousePVConnection.call(address_H0,address_PV0);
    }).then(function(result){
      //console.log("checkHousePVConnection",result);
      configuration.linkHousePV(address_H0,address_PV0);
      configuration.linkHousePV(address_H1,address_PV1);
      configuration.linkHousePV(address_H2,address_PV1);
      configuration.linkPVBattery(address_PV0,address_B0);
      configuration.linkHouseBattery(address_H2,address_B0);
      return configuration.getPVConnection.call(address_PV0);
    }).then(function(result){
      console.log("PV0's connection (should be 1,1)",result[0].toNumber(),result[1].toNumber());
    });    
  });
});
