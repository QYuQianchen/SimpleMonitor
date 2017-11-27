pragma solidity ^0.4.4;

import "./IBattery.sol";
import "./IPV.sol";
import "./IGrid.sol";
import "./IHouse.sol";
import "./GeneralDevice.sol";

import "./SortRLib.sol";
import "./SortPLib.sol"; 
import "./AdrLib.sol"; 
import "./TransactLib.sol";


//For simplicity, we do not use the sorting functions here, as in our configuration, there is only one battery and there's only one PV connected.  

contract SingleBattery is GeneralDevice, IBattery {
  
  using AdrLib for address[];
  using TransactLib for *;
  using SortPLib for *;


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
  
  
  /*struct PriceTF {
    uint  prs;
    bool  updated;
  }*/

  SortPLib.PriceMap draftPriceMap;
  uint    lastPriceQueryAt;

/*
  using SortLib for SortLib.PriceTF[];
  SortLib.PriceTF[] prepPriceQueryInfo;
  

  mapping(address=>SortLib.PriceTF) priceQueryInfo;
  mapping(uint=>address) sortedPriceQueryInfo;*/

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
    draftPriceMap.initPrsTable();
    for (uint i = 0; i < connectedDevice[1].length; i++) {
      (tP,tF) = IPV(connectedDevice[1][i]).getPrice();
      //priceQueryInfo[connectedDevice[1][i]] = SortLib.PriceTF(tP,tF);
      draftPriceMap.addToPrsTable(connectedDevice[1][i],tP,tF);
    }
    /*if (grid != 0x0) {
      (tP,tF) = IGrid(grid).getPrice();
      priceQueryInfo[grid] = SortLib.PriceTF(tP,tF);
    }*/
    lastPriceQueryAt = now;
  }
/*
  function getSortedPosition (address adr) returns (uint) { // should be private, here the "private" is temporarily removed due to testing
    //require(adr != 0x0);      // Sometimes with this line, there will be error in the configuration.js test... sometimes not.... sometimes need to _migrate_ twice to eliminate the error.... Don't know why
    uint _l;
    if (grid != 0x0) {
      _l = connectedDevice[1].length+1;
    } else {
      _l = connectedDevice[1].length;
    }
    for (uint i=0; i<_l; i++) {
      if (adr == sortedPriceQueryInfo[i]) {
        return (i+1);
      }
    }
    return 0;
  }*/

  function sortDraftPrsMap() {
    draftPriceMap.sortPrsTable();
    // if the grid is connected -> add the price from the grid to the end of the sorted list 
    if (grid != 0x0) {
      uint tP = 0;
      bool tF = false;
      (tP,tF) = IGrid(grid).getPrice();
      draftPriceMap.addToPrsTable(grid,tP,tF);
    }
  }

  //function sort() { // we are not doing sorting here -> as there is only 1 PV in the exercise layout
    /*sortedPriceQueryInfo[0] = connectedDevice[1][0];
    if (grid != 0x0) {
      sortedPriceQueryInfo[1] = grid;
    }*/
   /* createPriceList();
    uint maxTemp;
    uint totalLength;
    if (grid != 0x0) {
      totalLength = connectedDevice[1].length+1;
    } else {
      totalLength = connectedDevice[1].length;
    }
    for (uint i = 0; i < totalLength; i++) {
      maxTemp = prepPriceQueryInfo.maxStruct();
      swap(totalLength-1-i,maxTemp);
      prepPriceQueryInfo.del(maxTemp);
    }
  } 

  function createPriceList() private {
    if (grid != 0x0) {
      prepPriceQueryInfo.length = connectedDevice[1].length+1;
    } else {
      prepPriceQueryInfo.length = connectedDevice[1].length;
    }
    for (uint i = 0; i < connectedDevice[1].length; i++) {
      prepPriceQueryInfo[i] = priceQueryInfo[connectedDevice[1][i]];
      sortedPriceQueryInfo[i] = connectedDevice[1][i];
    }
    for (i = connectedDevice[1].length; i < prepPriceQueryInfo.length; i++) {
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
  }*/

  function getSortedPVInfo() external view returns(uint consum, uint rank, uint tot, bool updated) {
    consum = buyVolume;
    (rank,tot,updated) = draftPriceMap.getPrsTable(msg.sender);
  }

 /* function getSortedPVInfo() returns(uint consum, uint rank, uint tot, bool updated) {
    address adr = msg.sender;     //If the PV is connected
    consum = buyVolume;
    rank = getSortedPosition(adr); // We only have one PV connnected (In the demo layout)
    if (grid != 0x0) {
      tot = connectedDevice[1].length + 1;
    } else {
      tot = connectedDevice[1].length;
    }
    if (lastPriceQueryAt + priceTimeOut < now) {
      updated = false;    // The house may be inactive for a while, so the list stored is outdated.
    } else {
      updated = true;      
    }
  }*/

// start transaction
  function goNoGo(uint giveoutvol) returns (uint) {
    address adrDevice = msg.sender;
    uint takeoutvol;
    require(connectedDevice[1].assertInside(adrDevice) || adrDevice == grid);
    takeoutvol = buyVolume.findMin(giveoutvol);
    currentVolume += takeoutvol;
    buyVolume = buyVolume.clearEnergyTransfer(takeoutvol, address(this));
    wallet -= int(takeoutvol*draftPriceMap.prsTable[adrDevice].prs);
    return (takeoutvol); 
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

  function SingleBattery (address adr,  uint cap) GeneralDevice(adr) {
    capacity = cap;
  }

  function setVolume(uint vol) public ownerOnly {
    // Can only be triggered once....Should be moved to the constructor...Once the initial volumne is set, can only be changed by energy trading.
    currentVolume = vol;
    volStatusAt = now;
    VolLog(owner,vol,volStatusAt);
  }

  function setPrice(uint prsSale, uint prsBuy) public ownerOnly {
    priceForSale = prsSale;
    priceForBuy = prsBuy;
    priceStatusAt = now;
    PriceUpdate(priceStatusAt);
  }

  function setBuyVolume(uint v) public ownerOnly {
    require(currentVolume + v <= capacity);
    buyVolume = v;
  }

  // function askForPrice() {} // to ask for prices set by PVs...


  function getVolumeCapacity () external view returns (uint vol, uint volAt, uint cap) { // timed(initTime,volTimeOut) 
    vol = currentVolume;
    volAt = volStatusAt;
    cap = capacity;
  }

  function getSalePrice() public view returns (uint prs, bool updatedOrNot) { // connectedHouseOnly external
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

    prepRankingInfo.length = connectedDevice[0].length;
    for (uint i = 0; i < connectedDevice[0].length; i++) {
      (consum, rank, tot, updated) = IHouse(connectedDevice[0][i]).getSortedInfo();
      //GetSortedInfo(connectedDevice[0][i], consum, rank, tot, updated);
      if (updated) {
        RankingInfo[connectedDevice[0][i]] = SortRLib.Request(consum, rank, tot);
        prepRankingInfo[num] = RankingInfo[connectedDevice[0][i]];
        sortedRankingInfo[num] = connectedDevice[0][i];
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
      //swap(i,i+minTemp);
      if (i != i+minTemp) {
      address temp;
      temp = sortedRankingInfo[i];
      sortedRankingInfo[i] = sortedRankingInfo[i+minTemp];
      sortedRankingInfo[i+minTemp] = temp;   
      }
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
      if (connectedDevice[0].assertInside(adr)) {
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
