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
  using SortRLib for *;

  // one contract is associated to one particular PV panel in the network.
  // later we need to modify the parent contract that creates each PV contract - configuration.sol

  uint    production;               // Production of electricity (supply: negative)
  uint    price;

  SortRLib.RankMap draftRankMap;

// ======= Modifiers =======

  modifier timed (uint initialTime, uint allowedTimeOut){
    if(now < initialTime + allowedTimeOut){
      _;
    } else {
      revert();
    }
  }

// ======= Event Logs =======

  event ProductionLog(address adr, uint produc, uint prodAt);
  event ConfigurationLog(string confMod, uint statusAt);
  event PriceUpdate(uint updateAt);
  
// ======= Basic Functionalities =======

  // --- 0. Upon contract creation and configuration ---

  function SinglePV(address adr) GeneralDevice(adr) { }

  // --- 1. set and get PV price & production every 15 min (or less) ---

  function setProduction(uint produc) public ownerOnly {
    production = produc;
    prodStatusAt = now;
    ProductionLog(owner, production, prodStatusAt);
  }

  function setPrice(uint prs) public ownerOnly {
    price = prs;
    priceStatusAt = now;
    PriceUpdate(now);
  }

  function getProduction() external view returns (uint prod, uint prodAt) {//timed(queryTime,prodTimeOut)
    prod = production;
    prodAt = prodStatusAt;
  }

  function getPrice() public view returns (uint prs, bool updatedOrNot) { //connectedHouseOnly external
    prs = price;
    //prsAt = priceStatusAt;
    if (priceStatusAt + priceTimeOut < now) {
      updatedOrNot = false;
    } else {
      updatedOrNot = true;
    }
    //adr = owner;
  }

  // --- 3. PV can provide energy to houses. --- 
  // ---    Sort the list of ranks. --- 

  function askForRank() {
    uint consum;
    uint rank;
    uint tot;
    bool updated;
    draftRankMap.initRnkTable();
    for (uint i = 0; i < connectedDevice[0].length; i++) {
      (consum, rank, tot, updated) = IHouse(connectedDevice[0][i]).getSortedPrice();
      if (updated) {
        draftRankMap.addToRnkTable(connectedDevice[0][i],consum, rank, tot);
      }
    }
    for (i = 0; i < connectedDevice[2].length; i++) {
      (consum,rank,tot,updated) = IBattery(connectedDevice[2][i]).getSortedPrice();
      if (updated) {
        draftRankMap.addToRnkTable(connectedDevice[2][i],consum, rank, tot);
      }
    }
    lastRankingAt = now;
  }

  function sortRank() {
    draftRankMap.sortRnkTable();
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

  function getSortedRank(uint _id) returns(address adr, uint consum, uint rank, uint tot) {
    return draftRankMap.getSortedList(_id);
  }
 
  // --- 4. Initiate e transaction --- 
  
  function initiateTransaction(uint _id) returns (uint, uint) {
    uint giveoutVol;
    address adr;
    uint consum;
    uint rank;
    uint tot;
    uint whatDeviceAccept;
    uint receivedMoney;
    //for (uint i = 0; i < rLength; i++) {
      //adr = sortedRankingInfo[_id];
      (adr,consum,rank,tot) = getSortedRank(_id);
      giveoutVol = production.findMin(consum);
      if (connectedDevice[2].assertInside(adr)) {
        whatDeviceAccept = IBattery(adr).goNoGo(giveoutVol);
        production -= whatDeviceAccept;
        receivedMoney = whatDeviceAccept*price;
        wallet = wallet.clearMoneyTransfer(receivedMoney,adr, address(this));
      } else if (connectedDevice[0].assertInside(adr)) {
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
      if (connectedDevice[2].length != 0) {
        for (uint i = 0; i < connectedDevice[2].length; i++) {
          adr = connectedDevice[2][i];
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


}
