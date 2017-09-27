var SimpleConfigMonitorV2 = artifacts.require("./SimpleConfigMonitorV2.sol");

contract('SimpleConfigMonitorV2', function(accounts) {
  var address_PV0 = accounts[0];
  var address_PV1 = accounts[1];
  var address_H0= accounts[2];
  var address_H1= accounts[3];
  var address_H2= accounts[4];
  var address_B0= accounts[5];
  

  it("should assert true", function() {
    var simple_config_monitor_v2;
    return SimpleConfigMonitorV2.deployed().then(function(instance){
      simple_config_monitor_v2 = instance;
      
      // Initialize the system configuration
      simple_config_monitor_v2.systemConfiguration(address_PV0,address_PV1,address_H0,address_H1,address_H2,address_B0);
     
      // Get the current production from PV
      return simple_config_monitor_v2.getCurrentStatus.call(0,0);
    }).then(function(result){
      console.log("PV0 is generating (kW)",result.toNumber());
      return simple_config_monitor_v2.getAddress.call(0,0);
    }).then(function(result){
      console.log("what is the account for PV0",result);
      console.log(address_PV0);
      return simple_config_monitor_v2.checkInConnection.call(address_PV1,address_H1);
    }).then(function(result){
      console.log("checkInConnection result",result);
      return simple_config_monitor_v2.canSendElec.call(address_PV0,address_H0,3);
      // return simple_config_monitor_v2.getCurrentStatus.call(0,0);
    }).then(function(result){
      console.log("canSend result",result);
      //console.log("PV0 to H0 sending electricity: 3 kW, now PV0 has (kw)",result.toNumber());
      simple_config_monitor_v2.canSendElec.call(address_PV1,address_H2,7);
      return simple_config_monitor_v2.reducedStatus.call(1,2,7);
    }).then(function(result){
      console.log("PV1 to H2 sending electricity: 7 kW, now H2 still needs (kw)",result.toNumber());
      return simple_config_monitor_v2.getCurrentStatus.call(1,2);
    }).then(function(result){
      console.log("test",result.toNumber());
    });
  });
});