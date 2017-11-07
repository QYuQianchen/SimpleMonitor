pragma solidity ^0.4.4;

import "./SortLib.sol";
import "./IPV.sol";
import "./IGrid.sol";
import "./IBattery.sol";
import "./IHouse.sol";

contract SingleHouse is IHouse {
  
  // one contract is associated to one particular House in the network.

  address Admin;                    // shall be defined at the creation of contract or to be defined manually... now it doesn't work well. It captures the address of the Configuration contract.
  address public owner;
  bytes32 public name;              // name of the device (Serie No.)
  uint    consumption;              // Production of electricity (consumption: positive)
  uint    consumStatusAt;           // timestamp of the update (consumption)
  uint    consumTimeOut = 5 minutes;
  address grid = 0x0;                     // contract address of grid
  address[] connectedPV;            // List of contract address of connected PV
  address[] connectedBattery;       // List of contract address of connected batteries

  // may be splited into another contract

  /*struct PriceTF {
    uint  prs;
    bool  updated;
  }*/

  using SortLib for SortLib.PriceTF[];

  SortLib.PriceTF[] prepPriceQueryInfo;

  uint    lastPriceQueryAt;

  mapping(address=>SortLib.PriceTF) priceQueryInfo;
  mapping(uint=>address) sortedPriceQueryInfo;
  
// ======= Modifiers =======
  
  modifier ownerOnly {
    if (msg.sender == owner) {
      _;
    } else {
      revert();
    }
  }

  modifier adminOnly {
    if (msg.sender == Admin) {
      _;
    } else {
      revert();
    }
  }

  modifier connectedPVOnly (address adrP) {
    var check = false;
    for (uint i = 0; i < connectedPV.length; i++) {
      if (msg.sender == connectedPV[i]) {
        check = true;
      }
    }
    if (check == true) {
      _;
    } else {
      revert();
    }
  }

  modifier connectedBatteryOnly (address adrB) {
    var check = false;
    for (uint i = 0; i < connectedBattery.length; i++) {
      if (msg.sender == connectedBattery[i]) {
        check = true;
      }
    }
    if (check == true) {
      _;
    } else {
      revert();
    }
  }

  modifier timed (uint allowedTimeOut) {
    if(now < consumStatusAt + allowedTimeOut) {
      _;
    } else {
      revert();
    }
  }

// ======= Event Logs =======
  event ConsumptionLog(address adr, uint consum, uint consumAt);
  event ConfigurationLog(string confMod, uint statusAt);

// ======= Basic Functionalities =======

  // --- Upon contract creation and configuration ---

  function SingleHouse (address adr) {
    owner = adr;
    Admin = msg.sender;
  }
  
  function setGridAdr(address adr) adminOnly external{
    grid = adr;
  }
  
  function addConnectedPV(address adrP) adminOnly external{
    connectedPV.push(adrP);
    ConfigurationLog("PV linked to House",now);
  }

  function addConnectedBattery(address adrB) adminOnly external {
    connectedBattery.push(adrB);
    ConfigurationLog("Battery linked to House",now);
  }

  // --- Regular usage ---

  function setConsumption(uint consum) ownerOnly {
    consumption = consum;
    consumStatusAt = now;
    ConsumptionLog(owner, consumption, consumStatusAt);
  }

  function getConsumption()  external timed(consumTimeOut) returns (uint consum, uint consumAt) { //
    consum = consumption;
    consumAt = consumStatusAt;
  }

  // 

  function askForPrice() {
    // House query price info to all the connected PV/Battery. 
    // If the house is connected to grid (most of the time), the price of Grid will be automatically added to the end of the sorted list.
    uint tP = 0;
    bool tF = false;
    for (uint i = 0; i < connectedPV.length; i++) {
      (tP,tF) = IPV(connectedPV[i]).getPrice();
      setPriceQueryInfo(connectedPV[i],tP,tF);
    }
    for (i = 0; i < connectedBattery.length; i++) {
      (tP,tF) = IBattery(connectedBattery[i]).getSalePrice();
      setPriceQueryInfo(connectedBattery[i],tP,tF);
    }
    lastPriceQueryAt = now;
  }

  function setPriceQueryInfo(address adr, uint prs, bool tf) {
    //require(assertInConnectedPV(adr) || assertInConnectedBattery(adr));
    SortLib.PriceTF memory tempPriceTF;
    tempPriceTF.prs = prs;
    tempPriceTF.updated = tf;
    priceQueryInfo[adr] = tempPriceTF;
  }

  function assertInConnectedPV(address adr) returns (bool) {
    for (uint i = 0; i < connectedPV.length; i++) {
      if (adr == connectedPV[i]) {
        return true;
      }
    }
    return false;
  }
  
  function assertInConnectedBattery(address adr) returns (bool) {
    for (uint i = 0; i < connectedBattery.length; i++) {
      if (adr == connectedBattery[i]) {
        return true;
      }
    }
    return false;
  }

  //------------------------------
  // to Sort the received list of Price (from PV and Battery)
  //------------------------------
  

  function sortPriceList() {
    createPriceList();
    uint maxTemp;
    uint totalLength = connectedPV.length + connectedBattery.length;
    for (uint i=0; i<totalLength; i++) {
      maxTemp = prepPriceQueryInfo.maxStruct();
      swap(totalLength-1-i,maxTemp);
      del(maxTemp);
    }
    // if the grid is connected -> add the price from the grid to the end of the sorted list 
    if (grid != 0x0) {
      uint tP = 0;
      bool tF = false;
      (tP,tF) = IGrid(grid).getPrice();
      setPriceQueryInfo(grid,tP,tF);
      sortedPriceQueryInfo[totalLength] = grid;
    }
  }

  function createPriceList() private {
    prepPriceQueryInfo.length = connectedPV.length + connectedBattery.length;
    //sortedPriceQueryInfo.length = prepPriceQueryInfo.length; => sortedPQI is using mapping now
    for (uint i = 0; i < connectedPV.length; i++) {
      prepPriceQueryInfo[i] = priceQueryInfo[connectedPV[i]];
      sortedPriceQueryInfo[i] = connectedPV[i];
    }
    for (i = connectedPV.length; i < prepPriceQueryInfo.length; i++) {
      prepPriceQueryInfo[i] = priceQueryInfo[connectedBattery[i-connectedPV.length]];
      sortedPriceQueryInfo[i] = connectedBattery[i-connectedPV.length];
    }
  }

  function del (uint _id) private {
    if (_id != prepPriceQueryInfo.length) {
      delete prepPriceQueryInfo[_id];
      prepPriceQueryInfo[_id] = prepPriceQueryInfo[prepPriceQueryInfo.length-1];
      prepPriceQueryInfo.length--;
    } else {
      delete prepPriceQueryInfo[_id];
      prepPriceQueryInfo.length--;
    }
  }

  function swap (uint _id1, uint _id2) private {
    if (_id1 != _id2) {
      address temp;
      temp = sortedPriceQueryInfo[_id1];
      sortedPriceQueryInfo[_id1] = sortedPriceQueryInfo[_id2];
      sortedPriceQueryInfo[_id2] = temp;   
    }
  }

  //------------------------------
  // Once sorted, actively send to all the connected devices.
  //------------------------------

  function getSortedPosition (address adr) returns (uint) { // should be private, here the "private" is temporarily removed due to testing
    require(adr != 0x0);      // Sometimes with this line, there will be error in the configuration.js test... sometimes not.... sometimes need to _migrate_ twice to eliminate the error.... Don't know why
    for (uint i=0; i<connectedPV.length + connectedBattery.length+1; i++) {
      if (adr == sortedPriceQueryInfo[i]) {
        return (i+1);
      }
    }
    return 0;
  }

  function getSortedInfo() returns(uint consum, uint rank, uint tot, bool updated) {
    return  getSortedHInfo(msg.sender);
  }

  function getSortedHInfo(address adr) returns(uint consum, uint rank, uint tot, bool updated) {  // should be private, here the "private" is temporarily removed due to testing
    //address adr = msg.sender;
    consum = consumption;
    rank = getSortedPosition(adr);
    if (grid != 0x0) {
      tot = connectedPV.length + connectedBattery.length+1;
    } else {
      tot = connectedPV.length + connectedBattery.length;
    }
    if (lastPriceQueryAt + consumTimeOut < now) {
      updated = false;    // The house may be inactive for a while, so the list stored is outdated.
    } else {
      updated = true;      
    }
  }


  // ------------Functions used in testing------------------
/*
  function getSortedPriceList (uint _id) returns (address) {
    return sortedPriceQueryInfo[_id];
  }

  function getAskedPrice(address adr) returns (uint,bool) {
    return (priceQueryInfo[adr].prs,priceQueryInfo[adr].updated) ;
  }

  function askForPricePV(uint i) returns (uint,bool) {
    return IPV(connectedPV[i]).getPrice();
  }

  function askForPriceB(uint i) returns (uint,bool) {
    return IBattery(connectedBattery[i]).getSalePrice();
  }

  function getOwnerAdmin() returns (address, address){
    return (owner,Admin);
  }

  function getConnectedPVCount() returns (uint){
    return connectedPV.length;
  }

  function getconnectedBatteryCount() returns (uint){
    return connectedBattery.length;
  }

  function getConnectPVAddress(uint a) returns (address) {
    if (a<connectedPV.length) {
      return connectedPV[a];
    } else {
      return 0x0;
    }
  }

  function getconnectedBatteryAddress(uint a) returns (address) {
    if (a<connectedBattery.length) {
      return connectedBattery[a];
    } else {
      return 0x0;
   
    }
  }
  */

  function getConnectPVAddress(uint a) returns (address) {
      return connectedPV[a];
  }
}
