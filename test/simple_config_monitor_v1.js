var SimpleConfigMonitorV1 = artifacts.require("./SimpleConfigMonitorV1.sol");

contract('SimpleConfigMonitorV1', function(accounts) {
  var address_PV0 = accounts[0];
  var address_PV1 = accounts[1];
  var address_H0= accounts[2];
  var address_H1= accounts[3];
  var address_H2= accounts[4];
  var address_B0= accounts[5];
  

  it("should assert true", function() {
    var simple_config_monitor_v1;
    return SimpleConfigMonitorV1.deployed().then(function(instance){
      simple_config_monitor_v1 = instance;
      
      // Initialize the system configuration
      simple_config_monitor_v1.systemConfiguration.call(address_PV0,address_PV1,address_H0,address_H1,address_H2,address_B0);
     
      // Get the current production from PV
      return simple_config_monitor_v1.getCurrentStatus.call(0,0);
    }).then(function(result){
      console.log("PV0 is generating (kW)",result.toNumber());
      assert.equal(result.valueOf(),5, "PV0 production Not equal to 5");
      return simple_config_monitor_v1.getAddress.call(0,0);
    }).then(function(result){
      console.log("what is the account for PV0",result);
      console.log(address_PV0);
      return simple_config_monitor_v1.checkInMapping.call(address_PV0);
    }).then(function(result){
      console.log("checkInMapping result",result.toNumber());
      simple_config_monitor_v1.sendElec(address_PV0,address_H0,3);
      return simple_config_monitor_v1.getCurrentStatus.call(0,0);
    }).then(function(result){
      console.log("PV0 to PV1 sending electricity: 3 kW, now PV0 has (kw)",result.toNumber());
      //assert.equal(result.valueOf(),2, "PV0 currently has Not equal to 2");
    });
  });
});
