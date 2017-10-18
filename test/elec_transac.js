var Configuration = artifacts.require("./Configuration.sol");
var ElecTransac = artifacts.require("./ElecTransac.sol");

contract('Configuration and ElecTransac', function(accounts) {
  var address_admin = accounts [0];
  var address_PV0 = accounts[1];
  var address_PV1 = accounts[2];
  var address_H0= accounts[3];
  var address_H1= accounts[4];
  var address_H2= accounts[5];
  var address_B0= accounts[6];


  it("should assert true", function() {
    var configuration;
    var elecTransac;
    return Configuration.deployed().then(function(instance){
      configuration = instance;
      return ElecTransac.deployed();
    }).then(function(instance){
      elecTransac = instance; 
      configuration.addHouse(address_H0,3);
      configuration.addHouse(address_H1,3);
      configuration.addHouse(address_H2,8)
      configuration.addPV(address_PV0,5);
      configuration.addPV(address_PV1,10);
      configuration.addBattery(address_B0,20,5);
      //return configuration.checkHousePVConnection.call(address_H0,address_PV0);
      return configuration.getAdmin.call();
    }).then(function(result){
      //console.log("checkHousePVConnection",result);
      console.log("Contract Creator=", result);
      configuration.linkHousePV(address_H0,address_PV0);
      configuration.linkHousePV(address_H1,address_PV1);
      configuration.linkHousePV(address_H2,address_PV1);
      configuration.linkPVBattery(address_PV0,address_B0);
      configuration.linkHouseBattery(address_H2,address_B0);
      //return configuration.getPVConnection.call(address_PV0);
    }).then(function(result){
      //console.log("PV0's connection (should be 1,1)",result[0].toNumber(),result[1].toNumber());
      //return elecTransac.checkAvailability.call(address_PV1, address_H2,7,configuration.address);
      //return elecTransac.checkAvailability.call(address_PV1,address_H2,7,configuration.address);
      
      elecTransac.elecTransaction(address_PV1, address_H2,7,configuration.address, {from:address_PV1});
      //elecTransac.elecTransaction(address_PV1, address_H2,7,configuration.address);
      
      //return elecTransac.changeStatus.call(address_PV1, address_H2,7,configuration.address);
      //elecTransac.elecTransaction(address_PV1, address_H2,7,configuration.address);
      return configuration.checkPVPro.call(address_PV1);
    }).then(function(result){
      console.log("checkModification(true?)",result.valueOf());
      console.log("check PV productin (shoule be 10 - 7 = 3)", result.toNumber());
      //console.log("HouseCon is (shoule be  8)", result[0],result[1].toNumber(),result[2].toNumber());
    });     
  });

});