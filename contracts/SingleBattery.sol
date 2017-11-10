pragma solidity ^0.4.4;

import "./IBattery.sol";
import "./IPV.sol";
import "./IGrid.sol";
import "./IHouse.sol";

import "./SortRLib.sol";
import "./SortLib.sol"; 
import "./AdrLib.sol"; 
import "./TransactLib.sol";


//For simplicity, we do not use the sorting functions here, as in our configuration, there is only one battery and there's only one PV connected.  

contract SingleBattery is IBattery {
  
  using AdrLib for address[];
  using TransactLib for *;

  
  address public owner;
  bytes32 public name;              // name of the device (Serie No.)
  uint    capacity;                 // Cap of the device
  uint    currentVolume;            // Production of electricity
  uint    buyVolume;                // Amount of electricity that this battery would like to buy. Will first participate in the supply competition 
                                    //and will be finally (anyway) fulfilled b either the network or from the grid...
  uint    volTimeOut = 5 minutes;
  uint    volStatusAt;              // timestamp of the update
  
  uint    priceStatusAt;            // timestamp of the update (price)
  uint    priceTimeOut = 5 minutes;
  uint    priceForSale;
  uint    priceForBuy;              // lower than market price (ForExcessEnergy)
  
  address[] connectedHouse; // List of households connected
  address[] connectedPV;// List of PV connected
  
  /*struct PriceTF {
    uint  prs;
    bool  updated;
  }*/

  using SortLib for SortLib.PriceTF[];
  SortLib.PriceTF[] prepPriceQueryInfo;
  uint    lastPriceQueryAt;

  mapping(address=>SortLib.PriceTF) priceQueryInfo;
  mapping(uint=>address) sortedPriceQueryInfo;

  using SortRLib for SortRLib.Request[];
  SortRLib.Request[] prepRankingInfo;


  uint    lastRankingAt;
  uint    rLength;
  mapping(address=>SortRLib.Request) RankingInfo;
  mapping(uint=>address) sortedRankingInfo;

  function askForPrice() {
    // House query price info to all the connected PV/Battery. 
    // If the house is connected to grid (most of the time), the price of Grid also participates in the sorting (it's not less favored anymore)
    uint tP = 0;
    bool tF = false;
    for (uint i = 0; i < connectedPV.length; i++) {
      (tP,tF) = IPV(connectedPV[i]).getPrice();
      priceQueryInfo[connectedPV[i]] = SortLib.PriceTF(tP,tF);
    }
    if (grid != 0x0) {
      (tP,tF) = IGrid(grid).getPrice();
      priceQueryInfo[grid] = SortLib.PriceTF(tP,tF);
    }
    lastPriceQueryAt = now;
  }

  function getSortedPosition (address adr) returns (uint) { // should be private, here the "private" is temporarily removed due to testing
    //require(adr != 0x0);      // Sometimes with this line, there will be error in the configuration.js test... sometimes not.... sometimes need to _migrate_ twice to eliminate the error.... Don't know why
    uint _l;
    if (grid != 0x0) {
      _l = connectedPV.length+1;
    } else {
      _l = connectedPV.length;
    }
    for (uint i=0; i<_l; i++) {
      if (adr == sortedPriceQueryInfo[i]) {
        return (i+1);
      }
    }
    return 0;
  }

  function sort() { // we are not doing sorting here -> as there is only 1 PV in the exercise layout
    /*sortedPriceQueryInfo[0] = connectedPV[0];
    if (grid != 0x0) {
      sortedPriceQueryInfo[1] = grid;
    }*/
    createPriceList();
    uint maxTemp;
    uint totalLength;
    if (grid != 0x0) {
      totalLength = connectedPV.length+1;
    } else {
      totalLength = connectedPV.length;
    }
    for (uint i = 0; i < totalLength; i++) {
      maxTemp = prepPriceQueryInfo.maxStruct();
      swap(totalLength-1-i,maxTemp);
      prepPriceQueryInfo.del(maxTemp);
    }
  } 

  function createPriceList() private {
    if (grid != 0x0) {
      prepPriceQueryInfo.length = connectedPV.length+1;
    } else {
      prepPriceQueryInfo.length = connectedPV.length;
    }
    for (uint i = 0; i < connectedPV.length; i++) {
      prepPriceQueryInfo[i] = priceQueryInfo[connectedPV[i]];
      sortedPriceQueryInfo[i] = connectedPV[i];
    }
    for (i = connectedPV.length; i < prepPriceQueryInfo.length; i++) {
      prepPriceQueryInfo[i] = priceQueryInfo[grid];
      sortedPriceQueryInfo[i] = grid;
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

  function getSortedPVInfo() returns(uint consum, uint rank, uint tot, bool updated) {
    address adr = msg.sender;     //If the PV is connected
    consum = buyVolume;
    rank = getSortedPosition(adr); // We only have one PV connnected (In the demo layout)
    if (grid != 0x0) {
      tot = connectedPV.length + 1;
    } else {
      tot = connectedPV.length;
    }
    if (lastPriceQueryAt + priceTimeOut < now) {
      updated = false;    // The house may be inactive for a while, so the list stored is outdated.
    } else {
      updated = true;      
    }
  }

// start transaction
  function goNoGo(uint giveoutvol) returns (uint) {
    address adrDevice = msg.sender;
    uint takeoutvol;
    require(connectedPV.AssertInside(adrDevice) || adrDevice == grid);
    takeoutvol = buyVolume.findMin(giveoutvol);
    currentVolume += takeoutvol;
    buyVolume = buyVolume.clearEnergyTransfer(takeoutvol, address(this));
    wallet -= int(takeoutvol*priceQueryInfo[adrDevice].prs);
    return (takeoutvol); 
  }


  modifier ownerOnly {
    if (msg.sender == owner) {
      _;
    } else {
      revert();
    }
  }

  

  modifier connectedPVOnly (address adrP) {
    if (connectedPV.AssertInside(adrP) == true) {
      _;
    } else {
      revert();
    }
  }

  modifier connectedHouseOnly {
    if (connectedPV.AssertInside(msg.sender) == true) {
      _;
    } else {
      revert();
    } 
  }

  modifier timed (uint initialTime, uint allowedTimeOut) {
    if(now < initialTime + allowedTimeOut) {
      _;
    } else {
      revert();
    }
  }

  event VolLog(address adr, uint vol, uint volAt);
  event ConfigurationLog(string confMod, uint statusAt);
  event PriceUpdate(uint updateAt);

  function SingleBattery (address adr,  uint cap) {
    // constructor
    owner = adr;
    Admin = msg.sender;
    capacity = cap;
  }

  

  function setVolume(uint vol) ownerOnly {
    // Can only be triggered once....Should be moved to the constructor...Once the initial volumne is set, can only be changed by energy trading.
    currentVolume = vol;
    volStatusAt = now;
    VolLog(owner,vol,volStatusAt);
  }

  function setPrice(uint prsSale, uint prsBuy) ownerOnly {
    priceForSale = prsSale;
    priceForBuy = prsBuy;
    priceStatusAt = now;
    PriceUpdate(priceStatusAt);
  }

  function setBuyVolume(uint v) ownerOnly {
    require(currentVolume + v <= capacity);
    buyVolume = v;
  }

  // function askForPrice() {} // to ask for prices set by PVs...

  function addConnectedPV(address adrP) adminOnly external {
    connectedPV.push(adrP);
    ConfigurationLog("PV linked to Battery",now);
  }

  /*function deleteConnectedPV(address adrP) adminOnly external {
    for (uint i = 0; i < connectedPV.length; i++) {
      if (adrP == connectedPV[i]) {
        delete connectedPV[i];
        if (i != connectedPV.length-1) {
          connectedPV[i] = connectedPV[connectedPV.length-1];
        }
        connectedPV.length--;
      }
    }
  }*/

  function addConnectedHouse(address adrH) adminOnly external {
    connectedHouse.push(adrH);
    ConfigurationLog("House linked to Battery",now);
  }

  /*function deleteConnectedHouse(address adrH) adminOnly external {
    for (uint i = 0; i < connectedHouse.length; i++) {
      if (adrH == connectedHouse[i]) {
        delete connectedHouse[i];
        if (i != connectedHouse.length-1) {
          connectedHouse[i] = connectedHouse[connectedHouse.length-1];
        }
        connectedHouse.length--;
      }
    }
  }*/

  function getVolumeCapacity () external returns (uint vol, uint volAt, uint cap) { // timed(initTime,volTimeOut) 
    vol = currentVolume;
    volAt = volStatusAt;
    cap = capacity;
  }

  function getSalePrice() returns (uint prs, bool updatedOrNot) { // connectedHouseOnly external
    prs = priceForSale;
    //prsAt = priceStatusAt;
    if (priceStatusAt + priceTimeOut < now) {
      updatedOrNot = false;
    } else {
      updatedOrNot = true;
    }
    //adr = owner;
  }

  function goExcess(uint vol) returns (uint takeVol, uint prs) {
    prs = priceForBuy;
    takeVol = vol.findMin(capacity-currentVolume);
    currentVolume = currentVolume.clearExcessTransfer(takeVol, address(this));
    wallet -= int(takeVol*prs);
  }


  function getBuyVol() returns (uint) {return buyVolume;}

  // Battery also provides energy to houses
  function askForRank() {
    // ask and prepare for sorting the ranking...
    uint consum;
    uint rank;
    uint tot;
    bool updated;
    uint num;

    prepRankingInfo.length = connectedHouse.length;
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
    prepRankingInfo.length = num;
    rLength = num;
    lastRankingAt = now;
  }

  function sortRankList() {
    uint minTemp;
    for (uint i=0; i<rLength; i++) {
      minTemp = prepRankingInfo.minStruct();
      swap(i,i+minTemp);
      prepRankingInfo.del(minTemp);
    }
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
      giveoutVol = currentVolume.findMin(RankingInfo[adr].consump);
      if (connectedHouse.AssertInside(adr)) {
        whatDeviceAccept = IHouse(adr).goNoGo(giveoutVol);
        currentVolume -= whatDeviceAccept;
        receivedMoney = whatDeviceAccept*priceForSale;
        wallet = wallet.clearMoneyTransfer(receivedMoney,adr, address(this));
      } else {
        whatDeviceAccept = 0; 
      }
      return(giveoutVol, whatDeviceAccept);
    //}
  }



}
