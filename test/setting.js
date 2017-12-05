import latestTime from './helpers/latestTime'
import {increaseTimeTo, duration} from './helpers/increaseTime'

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
  var singleHouse2_adr
  var singleBattery0_adr;
  var grid_adr;

  var virtualTime;

  it("I. Create 3 SingleHouse contracts and link to 3 SinglePVs", function() {
    // Here to allocate account information + display them on the screen 

    /*beforeEach(async function() {
      this.startTime = latestTime();
    });*/

    return Configuration.deployed().then(function(instance){
      configuration = instance;
      configuration.addGrid(address_G);
      configuration.addDevice(0, address_H0, 0, true);
      configuration.addDevice(0, address_H1, 0, true);
      configuration.addDevice(0, address_H2, 0, true);
      configuration.addDevice(1, address_PV0, 0, true);
      configuration.addDevice(1, address_PV1, 0, true);
      configuration.addDevice(1, address_PV2, 0, true);
      configuration.addDevice(2, address_B0, 20, true);
      return configuration.getAdmin.call();
    }).then(function(result){
      console.log("Contract Creator=", result);
      configuration.linkDevices(address_H0,address_PV0);
      configuration.linkDevices(address_H1,address_PV1);
      configuration.linkDevices(address_H2,address_PV1);
      configuration.linkDevices(address_H1,address_PV2);
      configuration.linkDevices(address_H2,address_PV2);
      configuration.linkDevices(address_PV0,address_B0);
      configuration.linkDevices(address_H0,address_B0);
      configuration.linkDevices(address_H2,address_B0);
      //configuration.linkDevices(address_H2,address_PV0);
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

  it("II. Set Production and price", function() {

    // Basic input. Now we are simulating inputs at one moment in the system
    //singleHouse0.setConsumption(3, {from: address_H0});
    /*beforeEach(function (done) {
      setTimeout(function(){
        done();
      }, 500);
    });*/
    return singleHouse0.getTime.call().then(function(result){
      console.log("The status of the global timer is ",result.toNumber());
      singleHouse0.setConsumption(3, {from: address_H0});
      return singleHouse0.getConsumption.call();
    }).then(function(result){
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
      return singleHouse2.getNow.call();
      }).then(function(result){
        console.log("Now is", result.toNumber());
    });
  });

  it("III. Price communication House<->PV (1. House ask for price info and sort)", async function() {
    // this.startTime = latestTime();
    await increaseTimeTo(latestTime() + duration.seconds(70));
    return singleHouse2.getNow.call().then(function(result){
      console.log("Now is", result.toNumber());
      return singleHouse2.getNow.call();
    }).then(function(result){
      console.log("Now is", result.toNumber());
      return singleHouse0.getTime.call();
    }).then(function(result){
        console.log("The status of the global timer is ",result.toNumber());
      singleHouse2.askForPrice();
      singleHouse2.sortPrice();//.then(function(result){
      return singleHouse2.getNow.call();
    }).then(function(result){
      console.log("House 2 asked and sorted");
      console.log("Now is", result.toNumber());
      singleHouse0.askForPrice();
      singleHouse0.sortPrice();
    }).then(function(){
      console.log("House 0 asked and sorted");
      singleHouse1.askForPrice();
      singleHouse1.sortPrice();
    }).then(function(){
      console.log("House 1 asked and sorted");
      singleBattery0.askForPrice();
      singleBattery0.sortPrice();
    }).then(function(){
      console.log("Battery 0 asked and sorted");
    });
  });

  it("III. Price communication House <-> PV (2. PV collect info - Try another time delay)", async function() {
    
    let nowTime = await singleHouse2.getNow.call();
    console.log("Now is", nowTime.toNumber());
    await increaseTimeTo(latestTime() + duration.seconds(150));
    nowTime = await singleHouse2.getNow.call();
    console.log("Now is", nowTime.toNumber());
    let statTime = await singleHouse0.getTime.call();
    console.log("The status of the global timer is ",statTime.toNumber());

    let result1 = await singleHouse1.getSortedPrice.call({from: singlePV1_adr});
    console.log("returned sorted information from sH1 is",result1[0].toNumber(),result1[1].toNumber(),result1[2].toNumber(),result1[3]);
    let currentPV = singlePV1;
    await currentPV.askForRank();
    await currentPV.sortRank();
    let result2 = await currentPV.getSortedRank.call(0);
    console.log("The sorted result at 0 is", result2[0],result2[1].toNumber(),result2[2].toNumber(),result2[3].toNumber());
    let result3 = await currentPV.getSortedRank.call(1);
    console.log("The sorted result at 1 is", result3[0],result3[1].toNumber(),result3[2].toNumber(),result3[3].toNumber());
    let result4 = await currentPV.getSortedRank.call(2);
    console.log("The sorted result at 2 is", result4[0],result4[1].toNumber(),result4[2].toNumber(),result4[3].toNumber());
    await singlePV0.askForRank();
    await singlePV0.sortRank();
    await singlePV2.askForRank();
    await singlePV2.sortRank();
    await singleBattery0.askForRank();
    await singleBattery0.sortRank();
    console.log("Other devices sorted");
  });

  it("III. Price communication House<->PV (2. PV collect Info)", function() {
    // Let the rest of the houses calculate their preference list (given the price of PV/Battery/Grid)
    var currentPV;
    currentPV = singlePV1;
    return singleHouse1.getSortedPrice.call({from: singlePV1_adr}).then(function(result){
      //console.log("The query is from singlePV1_adr", singlePV1_adr);
      console.log("returned sorted information from sH1 is",result[0].toNumber(),result[1].toNumber(),result[2].toNumber(),result[3]);
      currentPV.askForRank();
    /*}).then(function(result){
      console.log("PV collected the information");
      return currentPV.getSortedRank.call(0);
    }).then(function(result){
      console.log("PV collected the information. num is", result[0],result[1].toNumber(),result[2].toNumber(),result[3].toNumber());
      return currentPV.getSortedRank.call(1);
    }).then(function(result){
      console.log("PV collected the information. num is", result[0],result[1].toNumber(),result[2].toNumber(),result[3].toNumber());*/
      currentPV.sortRank();  
    }).then(function(result){
      console.log("PV sorted the information");
      return currentPV.getSortedRank.call(0);
    }).then(function(result){
      console.log("The sorted result at 0 is", result[0],result[1].toNumber(),result[2].toNumber(),result[3].toNumber());
      return currentPV.getSortedRank.call(1);
    }).then(function(result){
      console.log("The sorted result at 1 is", result[0],result[1].toNumber(),result[2].toNumber(),result[3].toNumber());
      return currentPV.getSortedRank.call(2);
    }).then(function(result){
      console.log("The sorted result at 2 is", result[0],result[1].toNumber(),result[2].toNumber(),result[3].toNumber());
      singlePV0.askForRank();
      singlePV0.sortRank();
      //singlePV1.askForRank();
      //singlePV1.sortRank();
      singlePV2.askForRank();
      singlePV2.sortRank();
      singleBattery0.askForRank();
      singleBattery0.sortRank();
    }).then(function(result){
      console.log("Other devices sorted");
    });
  });

  it("III. Price communication House<->PV (3. PV and Battery intiate Transaction)", async function() {
    // Jumping into status 4. Ready for transaction
    let nowTime = await singleHouse2.getNow.call();
    console.log("Now is", nowTime.toNumber());
    await increaseTimeTo(latestTime() + duration.seconds(77));
    nowTime = await singleHouse2.getNow.call();
    console.log("After time increase, now is", nowTime.toNumber());
    let statTime = await singleHouse0.getTime.call();
    console.log("The status of the global timer is ",statTime.toNumber());
    // Time for index 1 transaction? Check the current index and status of houses...
    let i1 = await singlePV1.getTimerIndex.call();
    console.log("Before energy transaction:");
    console.log("0. Now index is",i1.toNumber());
    let result1 = await singleHouse0.getConsumption.call();
    console.log("Now SH0 consumes",result1[0].toNumber(),result1[1].toNumber());
    let result2 = await singleHouse1.getConsumption.call();
    console.log("Now SH1 consumes",result2[0].toNumber(),result2[1].toNumber());
    let result3 = await singleHouse2.getConsumption.call();
    console.log("Now SH2 consumes",result3[0].toNumber(),result3[1].toNumber());
    let result4 = await singleBattery0.getVolumeCapacity.call();
    console.log("Now B0 consumes",result4[0].toNumber(),result4[1].toNumber(),result4[2].toNumber());
      // PV1 wants to sell its energy.
    let currentPV = singlePV1;
    await currentPV.sellEnergy();
    i1 = await currentPV.getTimerIndex.call();
    console.log("PV1 reacts");
    console.log("1. Now index is",i1.toNumber());
    result1 = await singleHouse0.getConsumption.call();
    console.log("Now SH0 consumes",result1[0].toNumber(),result1[1].toNumber());
    result2 = await singleHouse1.getConsumption.call();
    console.log("Now SH1 consumes",result2[0].toNumber(),result2[1].toNumber());
    result3 = await singleHouse2.getConsumption.call();
    console.log("Now SH2 consumes",result3[0].toNumber(),result3[1].toNumber());
    result4 = await singleBattery0.getVolumeCapacity.call();
    console.log("Now B0 consumes",result4[0].toNumber(),result4[1].toNumber(),result4[2].toNumber());
    // PV0 wants to sell its energy.
    currentPV = singlePV0;
    await currentPV.sellEnergy();
    console.log("P0 reacts");
    i1 = await currentPV.getTimerIndex.call();
    console.log("2. Now index is",i1.toNumber());
    result1 = await singleHouse0.getConsumption.call();
    console.log("Now SH0 consumes",result1[0].toNumber(),result1[1].toNumber());
    result2 = await singleHouse1.getConsumption.call();
    console.log("Now SH1 consumes",result2[0].toNumber(),result2[1].toNumber());
    result3 = await singleHouse2.getConsumption.call();
    console.log("Now SH2 consumes",result3[0].toNumber(),result3[1].toNumber());
    result4 = await singleBattery0.getVolumeCapacity.call();
    console.log("Now B0 consumes",result4[0].toNumber(),result4[1].toNumber(),result4[2].toNumber());
     // PV2 also wants to sell its energy test whether now PV2 can do energy transaction... but failed (with r)
/*    currentPV = singlePV2;
    currentPV.sellEnergy();
    i1 = await currentPV.getTimerIndex.call();
    console.log("Now index is",i1.toNumber());
    nowTime = await singleHouse2.getNow.call();
    console.log("Now is", nowTime.toNumber(), latestTime());
    result1 = await singleHouse0.getConsumption.call();
    console.log("Now SH0 consumes",result1[0].toNumber(),result1[1].toNumber());
    result2 = await singleHouse1.getConsumption.call();
    console.log("Now SH1 consumes",result2[0].toNumber(),result2[1].toNumber());
    result3 = await singleHouse2.getConsumption.call();
    console.log("Now SH2 consumes",result3[0].toNumber(),result3[1].toNumber());
    result4 = await singleBattery0.getVolumeCapacity.call();
    console.log("Now SH2 consumes",result4[0].toNumber(),result4[1].toNumber(),result4[2].toNumber());*/
      // what about increasing time to 4 seconds later?
      // B0 starts
    await increaseTimeTo(latestTime() + duration.seconds(1));
    nowTime = await singleHouse2.getNow.call();
    console.log("B0 reacts");
    console.log("Now is", nowTime.toNumber(), latestTime());
    singleBattery0.sellEnergy();
    i1 = await currentPV.getTimerIndex.call();
    console.log("3. Now index is",i1.toNumber());
    result1 = await singleHouse0.getConsumption.call();
    console.log("Now SH0 consumes",result1[0].toNumber(),result1[1].toNumber());
    result2 = await singleHouse1.getConsumption.call();
    console.log("Now SH1 consumes",result2[0].toNumber(),result2[1].toNumber());
    result3 = await singleHouse2.getConsumption.call();
    console.log("Now SH2 consumes",result3[0].toNumber(),result3[1].toNumber());
    result4 = await singleBattery0.getVolumeCapacity.call();
    console.log("Now B0 consumes",result4[0].toNumber(),result4[1].toNumber(),result4[2].toNumber());
      // PV2 starts
    await increaseTimeTo(latestTime() + duration.seconds(1));
    nowTime = await singleHouse2.getNow.call();
    console.log("PV2 reacts");
    console.log("Now is", nowTime.toNumber(), latestTime());
    currentPV = singlePV2;
    currentPV.sellEnergy();
    i1 = await currentPV.getTimerIndex.call();
    console.log("4. Now index is",i1.toNumber());
    result1 = await singleHouse0.getConsumption.call();
    console.log("Now SH0 consumes",result1[0].toNumber(),result1[1].toNumber());
    result2 = await singleHouse1.getConsumption.call();
    console.log("Now SH1 consumes",result2[0].toNumber(),result2[1].toNumber());
    result3 = await singleHouse2.getConsumption.call();
    console.log("Now SH2 consumes",result3[0].toNumber(),result3[1].toNumber());
    result4 = await singleBattery0.getVolumeCapacity.call();
    console.log("Now B0 consumes",result4[0].toNumber(),result4[1].toNumber(),result4[2].toNumber());
  });

  it("III. Price communication House<->PV (4. PV sell excess energy to battery; House buy energy from battery)", async function() {
    // PV2 still has excess energy
    let prod = await singlePV2.getProduction.call();
    console.log("PV2 still has", prod[0].toNumber(), prod[1].toNumber());
    let nowTime = await singleHouse2.getNow.call();
    console.log("Now is", nowTime.toNumber());
    await increaseTimeTo(latestTime() + duration.seconds(300));
    nowTime = await singleHouse2.getNow.call();
    console.log("After time increase, now is", nowTime.toNumber());
    let statTime = await singleHouse0.getTime.call();
    console.log("The status of the global timer is ",statTime.toNumber());
    await singlePV2.sellExcess();
    prod = await singlePV2.getProduction.call();
    console.log("PV2 still has", prod[0].toNumber(), prod[1].toNumber());
  });
    

});
