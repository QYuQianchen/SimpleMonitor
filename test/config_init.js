var Configuration = artifacts.require("./Configuration.sol");
var SingleHouse = artifacts.require("./SingleHouse.sol");
var SinglePV = artifacts.require("./SinglePV.sol");
var SingleBattery = artifacts.require("./SingleBattery.sol");
var Grid = artifacts.require("./Grid.sol");

contract('Configuration', function(accounts) {
  var address_admin = accounts [0];
  var address_PV0 = accounts[1];
  var address_PV1 = accounts[2];
  var address_PV2 = accounts[3];
  var address_H0= accounts[4];
  var address_H1= accounts[5];
  var address_H2= accounts[6];
  var address_B0= accounts[7];
  var address_G = accounts[8];

  var configuration;
  var singleHouse0;
  var singleHouse1;
  var singleHouse2;
  var singlePV0;
  var singlePV1;
  var singlePV2;
  var singleBattery0;
  var grid_c;
  var singlePV0_adr;
  var singlePV1_adr;
  var singlePV2_adr;
  var singleHouse0_adr;
  var singleHouse1_adr;
  var singleBattery0_adr;
  var grid_adr;

  it("I. Create 3 SingleHouse contracts and link to 3 SinglePVs", function() {
    // Here to allocate account information + display them on the screen 
    return Configuration.deployed().then(function(instance){
      configuration = instance;
      configuration.addGrid(address_G);
    }).then(function(){
      console.log("create instance");
      configuration.addDevice(0, address_H0, 0, true);
    }).then(function(){
      console.log("add H0");
      configuration.addDevice(0, address_H1, 0, true);
    }).then(function(){
      console.log("add H1");
      configuration.addDevice(0, address_H2, 0, true);
    }).then(function(){
      console.log("add H2");
      configuration.addDevice(1, address_PV0, 0, true);
    }).then(function(){
      console.log("add PV0");
      configuration.addDevice(1, address_PV1, 0, true);
    }).then(function(){
      console.log("add PV1");
      configuration.addDevice(1, address_PV2, 0, true);
    }).then(function(){
      console.log("add PV2");
      configuration.addDevice(2, address_B0, 20, false);
    }).then(function(){
      console.log("add B0");
      /*
      configuration.addHouse(address_H0, true);
      configuration.addHouse(address_H1, true);
      configuration.addHouse(address_H2, true);
      configuration.addPV(address_PV0, true);
      configuration.addPV(address_PV1, true);
      configuration.addPV(address_PV2, true);
      configuration.addBattery(address_B0,20, false);*/
      return configuration.getAdmin.call();
    }).then(function(result){
      console.log("Contract Creator=", result);
      configuration.linkDevices(address_H0,address_PV0);
    }).then(function(){
      console.log("H0 - PV0 linked");
      configuration.linkDevices(address_H1,address_PV1);
    }).then(function(){
      console.log("H1 - PV1 linked");
      configuration.linkDevices(address_H2,address_PV1);
    }).then(function(){
      console.log("H2 - PV1 linked");
      configuration.linkDevices(address_H1,address_PV2);
    }).then(function(){
      console.log("H1 - PV2 linked");
      configuration.linkDevices(address_H2,address_PV2);
    }).then(function(){
      console.log("H2 - PV2 linked");
      configuration.linkDevices(address_PV0,address_B0);
    }).then(function(){
      console.log("B0 - PV0 linked");
      configuration.linkDevices(address_H0,address_B0);
    }).then(function(){
      console.log("B0 - H0 linked");
      configuration.linkDevices(address_H2,address_B0);
    }).then(function(){
      console.log("B0 - H2 linked");
      return configuration.getGridAdr.call();
    }).then(function(result){
      console.log("The address (method contractList) of Grid is ",result);
      grid_adr = result;
      grid_c = Grid.at(result);
    }).then(function(){
      console.log("Now we have the address of the Grid contract");
      return configuration.getContractAddress.call(address_H0);
    }).then(function(result){
      console.log("The address (method contractList) of House0 is ",result);
      singleHouse0_adr = result;
      singleHouse0 = SingleHouse.at(result);
      return configuration.getContractAddress.call(address_H1);
    }).then(function(result){
      console.log("The address (method contractList) of House1 is ",result);
      singleHouse1_adr = result;
      singleHouse1 = SingleHouse.at(result);
      return configuration.getContractAddress.call(address_H2);
    }).then(function(result){
      console.log("The address (method contractList) of House2 is ",result);
      singleHouse2_adr = result;
      singleHouse2 = SingleHouse.at(result);
      return configuration.getContractAddress.call(address_PV0);
    }).then(function(result){
      console.log("The address (method contractList) of PV0 is ",result);
      singlePV0_adr = result;
      singlePV0 = SinglePV.at(result);
      return configuration.getContractAddress.call(address_PV1);
    }).then(function(result){
      console.log("The address (method contractList) of PV1 is ",result);
      singlePV1_adr = result;
      singlePV1 = SinglePV.at(result);
      return configuration.getContractAddress.call(address_PV2);
    }).then(function(result){
      console.log("The address (method contractList) of PV2 is ",result);
      singlePV2_adr = result;
      singlePV2 = SinglePV.at(result);
      return configuration.getContractAddress.call(address_B0);
    }).then(function(result){
      console.log("The address (method contractList) of Battery0 is ",result);
      singleBattery0_adr = result;
      singleBattery0 = SingleBattery.at(result);
    });    
  });
/*
  it("II. Set Production and price", function() {

    // Basic input. Now we are simulating inputs at one moment in the system
    singleHouse0.setConsumption(3, {from: address_H0});
    return singleHouse0.getConsumption.call().then(function(result){
      console.log("The consumption of House0 is ",result[0].toNumber(),result[1].toNumber());
      singleHouse1.setConsumption(3, {from: address_H1});
      return singleHouse1.getConsumption.call();
    }).then(function(result){
      console.log("The consumption of House1 is ",result[0].toNumber(),result[1].toNumber());
      singleHouse2.setConsumption(8, {from: address_H2});
      return singleHouse2.getConsumption.call();
    }).then(function(result){
      console.log("The consumption of House2 is ",result[0].toNumber(),result[1].toNumber());
      singlePV0.setProduction(5, {from: address_PV0});
      return singlePV0.getProduction.call();
    }).then(function(result){
      console.log("The production of PV0 is ",result[0].toNumber(),result[1].toNumber());
      singlePV1.setProduction(10, {from: address_PV1});
      return singlePV1.getProduction.call();
    }).then(function(result){
      console.log("The production of PV1 is ",result[0].toNumber(),result[1].toNumber());
      singlePV2.setProduction(10, {from: address_PV2});
      return singlePV2.getProduction.call();
    }).then(function(result){
      console.log("The production of PV2 is ",result[0].toNumber(),result[1].toNumber());
      singleBattery0.setVolume(5, {from: address_B0});
      return singleBattery0.getVolumeCapacity.call();
    }).then(function(result){
      console.log("The current volume and total capacity of Battery0 is ",result[0].toNumber(),result[1].toNumber(),result[2].toNumber());
      singleBattery0.setBuyVolume(3,{from: address_B0});
      return singleBattery0.getBuyVol.call();
    }).then(function(result){
      console.log("Battery0 wants to buy" ,result.toNumber(), "kWh.");
      singlePV0.setPrice(20, {from: address_PV0});
      return singlePV0.getPrice.call();
    }).then(function(result){
      console.log("The price of PV0 is ",result[0].toNumber(), result[1]);
      singlePV1.setPrice(15, {from: address_PV1});
      return singlePV1.getPrice.call();
    }).then(function(result){
      console.log("The price of PV1 is ",result[0].toNumber(), result[1]);
      singlePV2.setPrice(30, {from: address_PV2});
      return singlePV2.getPrice.call();
    }).then(function(result){
      console.log("The price of PV2 is ",result[0].toNumber(), result[1]);
      singleBattery0.setPrice(20, 3, {from: address_B0});
      return singleBattery0.getSalePrice.call();
    }).then(function(result){
      console.log("The sale's price of Battery0 is ",result[0].toNumber(), result[1]);
      grid_c.setPrice(10, 1, {from: address_G});
      return grid_c.getPrice.call();
    }).then(function(result){
      console.log("The sale's price of the grid is ",result[0].toNumber(), result[1]);
    });
  });*/
});