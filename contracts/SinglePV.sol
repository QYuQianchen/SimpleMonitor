pragma solidity ^0.4.4;

import "./IPV.sol";
import "./IHouse.sol";
import "./IBattery.sol";
import "./IGrid.sol";
import "./SortRLib.sol";
import "./AdrLib.sol";
import "./TransactLib.sol";
import "./GeneralDevice.sol";

contract SinglePV is GeneralDevice, IPV {
  
  using AdrLib for address[];
  using TransactLib for *;
  // one contract is associated to one particular PV panel in the network.
  // later we need to modify the parent contract that creates each PV contract - configuration.sol

  uint    production;               // Production of electricity (supply: negative)
  uint    prodStatusAt;             // timestamp of the update (prod)
  //uint    prodTimeOut = 5 minutes;
  uint    price;
  uint    priceStatusAt;            // timestamp of the update (price)
  //uint    priceTimeOut = 5 minutes;

  address[] connectedHouse;         // List of households connected
  address[] connectedBattery;       // List of batteries connected

  /*struct Request {
    uint  consump;
    uint  rank;
    uint  total;
  } */

  using SortRLib for SortRLib.Request[];
  SortRLib.Request[] prepRankingInfo;

  uint    rLength;
  uint    lastRankingAt;
  mapping(address=>SortRLib.Request) RankingInfo;
  mapping(uint=>address) sortedRankingInfo;

  /*function askForRankTEST() returns (uint, uint) {
    uint consum;
    uint rank;
    uint tot;
    bool updated;
    uint num1 = 0;
    uint num2 = 0;
    prepRankingInfo.length = connectedHouse.length+connectedBattery.length;

    for (uint i = 0; i < connectedHouse.length; i++) {
      
      (consum, rank, tot, updated) = IHouse(connectedHouse[i]).getSortedInfo();
      GetSortedInfo(connectedHouse[i], consum, rank, tot, updated);
      RankingInfo[connectedHouse[i]] = SortRLib.Request(consum, rank, tot);

      prepRankingInfo[num1] = RankingInfo[connectedHouse[i]];
      num1++;
    }

    for (i = 0; i < connectedBattery.length; i++) {
        num2++;
    }

    return (num1, num2);
  }*/

  function getPrepInfo(uint _id) returns(uint consum, uint rank, uint tot) {
    consum = prepRankingInfo[_id].consump;
    rank = prepRankingInfo[_id].rank;
    tot = prepRankingInfo[_id].total;
  }

  function askForRank() {
    // ask and prepare for sorting the ranking...
    uint consum;
    uint rank;
    uint tot;
    bool updated;
    uint num;
    prepRankingInfo.length = connectedHouse.length+connectedBattery.length;
    for (uint i = 0; i < connectedHouse.length; i++) {
      (consum, rank, tot, updated) = IHouse(connectedHouse[i]).getSortedInfo();
      //GetSortedInfo(connectedHouse[i], consum, rank, tot, updated);
      if (updated) {
        RankingInfo[connectedHouse[i]] = SortRLib.Request(consum, rank, tot);
        prepRankingInfo[num] = RankingInfo[connectedHouse[i]];
        sortedRankingInfo[num] = connectedHouse[i];
        num++;
      }
    }
    for (i = 0; i < connectedBattery.length; i++) {
      (consum,rank,tot,updated) = IBattery(connectedBattery[i]).getSortedPVInfo();
      //GetSortedInfo(connectedBattery[i], consum, rank, tot, updated);
      if (updated) {
        RankingInfo[connectedBattery[i]] = SortRLib.Request(consum, rank, tot);
        prepRankingInfo[num] = RankingInfo[connectedBattery[i]];
        sortedRankingInfo[num] = connectedBattery[i];
        num++;
      }
    }
    rLength = num;
    prepRankingInfo.length = num;
    lastRankingAt = now;
  }
  // This event is only for testing reason
  //event GetSortedInfo(address device, uint consum, uint rank, uint tot, bool updated);

  function swap (uint _id1, uint _id2) private {
    if (_id1 != _id2) {
      address temp;
      temp = sortedRankingInfo[_id1];
      sortedRankingInfo[_id1] = sortedRankingInfo[_id2];
      sortedRankingInfo[_id2] = temp;   
    }
  }

  function sortRankList() {
    uint minTemp;
    for (uint i=0; i<rLength; i++) {
      minTemp = prepRankingInfo.minStruct();
      swap(i,i+minTemp);
      prepRankingInfo.del(minTemp);
    }
    /*
    // In case there is still excess, need to ask connectedBattery to buy for the extra...as much as possible
    if (connectedBattery.length != 0) {
      for (i=0; i<connectedBattery.length; i++) {
        uint prs = 0;
        uint cap = 0;
        (prs, cap) = IBattery(grid).getExcess();
      
      }
      
    }
    // if the grid is connected -> add the price from the grid to the end of the sorted list 
    if (grid != 0x0) {
      uint tP = 0;
      bool tF = false;
      (tP,tF) = IGrid(grid).getPrice();
      setPriceQueryInfo(grid,tP,tF);
      sortedPriceQueryInfo[num] = grid;
    }*/
  }


  function getSortedInfo(uint _id) returns(address adr, uint consum, uint rank, uint tot) {
    adr = sortedRankingInfo[_id];
    consum = RankingInfo[adr].consump;
    rank = RankingInfo[adr].rank;
    tot = RankingInfo[adr].total;
  }
  
  function initiateTransaction(uint _id) returns (uint, uint) {
    uint giveoutVol;
    address adr;
    uint whatDeviceAccept;
    uint receivedMoney;
    //for (uint i = 0; i < rLength; i++) {
      adr = sortedRankingInfo[_id];
      giveoutVol = production.findMin(RankingInfo[adr].consump);
      if (connectedBattery.AssertInside(adr)) {
        whatDeviceAccept = IBattery(adr).goNoGo(giveoutVol);
        production -= whatDeviceAccept;
        receivedMoney = whatDeviceAccept*price;
        wallet = wallet.clearMoneyTransfer(receivedMoney,adr, address(this));
      } else if (connectedHouse.AssertInside(adr)) {
        whatDeviceAccept = IHouse(adr).goNoGo(giveoutVol);
        production -= whatDeviceAccept;
        receivedMoney = whatDeviceAccept*price;
        wallet = wallet.clearMoneyTransfer(receivedMoney,adr, address(this));
      } else {
        whatDeviceAccept = 0; 
      }
      return(giveoutVol, whatDeviceAccept);
    //}
  }

  function sellExcess() {
    // after all, if there's still excess and the connected Battery still have the capacity.
    uint whatDeviceAccept;
    uint receivedMoney;
    uint unitPrs;
    address adr;
    if (production > 0) {
      //ToBattery
      if (connectedBattery.length != 0) {
        for (uint i = 0; i < connectedBattery.length; i++) {
          adr = connectedBattery[i];
          (whatDeviceAccept, unitPrs) = IBattery(adr).goExcess(production);
          production -= whatDeviceAccept;
          receivedMoney = whatDeviceAccept*unitPrs;
          wallet = wallet.clearMoneyTransfer(receivedMoney,adr, address(this));
        }
      } else {
        //ToGrid (by default, it's connected to grid)
        (whatDeviceAccept, unitPrs) = IGrid(grid).goExcess(production);
        production -= whatDeviceAccept;
        receivedMoney = whatDeviceAccept*unitPrs;
        wallet = wallet.clearMoneyTransfer(receivedMoney,grid, address(this));
      }
    }
  }
  /*
  modifier ownerOnly {
    if (msg.sender == owner) {
      _;
    } else {
      revert();
    }
  }*/

  modifier connectedHouseOnly {
    if (connectedHouse.AssertInside(msg.sender) == true) {
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

  modifier timed (uint initialTime, uint allowedTimeOut){
    if(now < initialTime + allowedTimeOut){
      _;
    } else {
      revert();
    }
  }

  event ProductionLog(address adr, uint produc, uint prodAt);
  event ConfigurationLog(string confMod, uint statusAt);
  event PriceUpdate(uint updateAt);
  

  function SinglePV(address adr) GeneralDevice(adr) { }

  function setProduction(uint produc) ownerOnly {
    production = produc;
    prodStatusAt = now;
    ProductionLog(owner, production, prodStatusAt);
  }

  function setPrice(uint prs) ownerOnly {
    price = prs;
    priceStatusAt = now;
    PriceUpdate(now);
  }

  function setGridAdr(address adr) adminOnly external {
    grid = adr;
  }

  function addConnectedHouse(address adrH) adminOnly external {
    connectedHouse.push(adrH);
    ConfigurationLog("House linked to PV",now);
  }

  /*
  function deleteConnectedHouse(address adrH) adminOnly external returns (bool) {
    for (uint i = 0; i < connectedHouse.length; i++) {
      if (adrH == connectedHouse[i]) {
        delete connectedHouse[i];
        if (i != connectedHouse.length-1) {
          connectedHouse[i] = connectedHouse[connectedHouse.length-1];
        }
        connectedHouse.length--;
        ConfigurationLog("House Deleted",now);
        return true;
      }
    }
    return false;
  }*/

  function addConnectedBattery(address adrB) adminOnly external {
    connectedBattery.push(adrB);
    ConfigurationLog("Battery linked to PV",now);

  }

  /*
  function deleteConnectedBattery(address adrB) adminOnly external returns (bool) {
    for (uint i = 0; i < connectedBattery.length; i++) {
      if (adrB == connectedBattery[i]) {
        delete connectedBattery[i];
        if (i != connectedBattery.length-1) {
          connectedBattery[i] = connectedBattery[connectedBattery.length-1];
        }
        connectedBattery.length--;
        ConfigurationLog("Battery Deleted",now);
        return true;
      }
    }
    return false;
  }*/

  function getProduction() external returns (uint prod, uint prodAt) {//timed(queryTime,prodTimeOut)
    prod = production;
    prodAt = prodStatusAt;
  }

  function getPrice() returns (uint prs, bool updatedOrNot) { //connectedHouseOnly external
    prs = price;
    //prsAt = priceStatusAt;
    if (priceStatusAt + priceTimeOut < now) {
      updatedOrNot = false;
    } else {
      updatedOrNot = true;
    }
    //adr = owner;
  }
}
