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
  using SortRLib for *;

  uint    capacity;                 // Cap of the device
  uint    currentVolume;            // Production of electricity
  uint    buyVolume;                // Amount of electricity that this battery would like to buy. Will first participate in the supply competition 
                                    //and will be finally (anyway) fulfilled b either the network or from the grid...
  uint    priceForSale;
  uint    priceForBuy;              // lower than market price (ForExcessEnergy)

  SortPLib.PriceMap draftPriceMap;
  SortRLib.RankMap draftRankMap;

// ======= Modifiers =======

  modifier timed (uint initialTime, uint allowedTimeOut) {
    if(now < initialTime + allowedTimeOut) {
      _;
    } else {
      revert();
    }
  }

// ======= Event Logs =======

  event VolLog(address adr, uint vol, uint volAt);
  //event ConfigurationLog(string confMod, uint statusAt);
  event PriceUpdate(uint updateAt);

// ======= Basic Functionalities =======

  // --- 0. Upon contract creation and configuration ---

  function SingleBattery (address adr,  uint cap) GeneralDevice(adr) {
    capacity = cap;
  }

  function setVolume(uint vol) public ownerOnly {
    // Can only be triggered once....Should be moved into the constructor...Once the initial volumne is set, can only be changed by energy trading.
    currentVolume = vol;
    volStatusAt = now;
    VolLog(owner,vol,volStatusAt);
  }

  // --- 1. set and get the active purchase volume (if battery wants) and selling price every 15 min (or less) ---

  function setPrice(uint prsSale, uint prsBuy) public ownerOnly {
    priceForSale = prsSale;
    priceForBuy = prsBuy;
    priceStatusAt = now;
    PriceUpdate(priceStatusAt);
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

  function setBuyVolume(uint v) public ownerOnly {
    require(currentVolume + v <= capacity);
    buyVolume = v;
  }

  function getVolumeCapacity () external view returns (uint vol, uint volAt, uint cap) { // timed(initTime,volTimeOut) 
    vol = currentVolume;
    volAt = volStatusAt;
    cap = capacity;
  }

  // --- 2. Battery can be considered as a house if it wants to actively purchase energy. --- 
  // ---    Ask for connected PV / batteries / grid for price of electricity supply. --- 
  // ---    Sort the list of offers. --- 

  function askForPrice() {
    // Battery query price info to all the connected PV/Battery. 
    uint tP = 0;
    bool tF = false;
    draftPriceMap.initPrsTable();
    for (uint i = 0; i < connectedDevice[1].length; i++) {
      (tP,tF) = IPV(connectedDevice[1][i]).getPrice();
      draftPriceMap.addToPrsTable(connectedDevice[1][i],tP,tF);
    }
    lastPriceQueryAt = now;
  }

  function sortPrice() {
    draftPriceMap.sortPrsTable();
    // if the grid is connected -> add the price from the grid to the end of the sorted list 
    if (grid != 0x0) {
      uint tP = 0;
      bool tF = false;
      (tP,tF) = IGrid(grid).getPrice();
      draftPriceMap.addToPrsTable(grid,tP,tF);
    }
  }

  function getSortedPrice() external view returns(uint consum, uint rank, uint tot, bool updated) {
    consum = buyVolume;
    (rank,tot,updated) = draftPriceMap.getPrsTable(msg.sender);
  }

  // --- 3. Battery can also provide energy to houses. --- 
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
    lastRankingAt = now;
  }

  function sortRank() {
    draftRankMap.sortRnkTable();
  }

  function getSortedRank(uint _id) returns(address adr, uint consum, uint rank, uint tot) {
    return draftRankMap.getSortedList(_id);
  }

  /*//  for test 

  function getDraftPrsMap(address adr) public view returns (uint, bool) {
    return (draftPriceMap.prsTable[adr].prs, draftPriceMap.prsTable[adr].updated);
  }

  function getSrtList(uint a) public returns(address, uint, bool) { //address, uint, bool
    return draftPriceMap.getSortedList(a);
  }*/


  // --- 4. PV/Battery/Grid asks Battery to confirm energy transaction ---

  function goNoGo(uint giveoutvol) returns (uint) {
    address adrDevice = msg.sender;
    uint takeoutvol;
    require(connectedDevice[1].assertInside(adrDevice) || adrDevice == grid);
    takeoutvol = buyVolume.findMin(giveoutvol);
    currentVolume += takeoutvol;
    volStatusAt = now;
    VolLog(owner,currentVolume,volStatusAt);
    buyVolume = buyVolume.clearEnergyTransfer(takeoutvol, address(this));
    wallet -= int(takeoutvol*draftPriceMap.prsTable[adrDevice].prs);
    return (takeoutvol); 
  }

  function goExcess(uint vol) returns (uint takeVol, uint prs) {
    prs = priceForBuy;
    takeVol = vol.findMin(capacity-currentVolume);
    currentVolume = currentVolume.clearExcessTransfer(takeVol, address(this));
    wallet -= int(takeVol*prs);
  }


  function getBuyVol() returns (uint) {return buyVolume;}

  
  function initiateTransaction(uint _id) returns (uint, uint) {
    uint giveoutVol;
    address adr;
    uint consum;
    uint rank;
    uint tot;

    uint whatDeviceAccept;
    uint receivedMoney;
    //for (uint i = 0; i < rLength; i++) {
      (adr,consum,rank,tot) = getSortedRank(_id);//sortedRankingInfo[_id];
      giveoutVol = currentVolume.findMin(consum);
      if (connectedDevice[0].assertInside(adr)) {
        whatDeviceAccept = IHouse(adr).goNoGo(giveoutVol);
        //setVolume(currentVolume-whatDeviceAccept);
        currentVolume -= whatDeviceAccept;
        volStatusAt = now;
        VolLog(owner,currentVolume,volStatusAt);
        receivedMoney = whatDeviceAccept*priceForSale;
        wallet = wallet.clearMoneyTransfer(receivedMoney,adr, address(this));
      } else {
        whatDeviceAccept = 0; 
      }
      return(giveoutVol, whatDeviceAccept);
    //}
  }



}
