pragma solidity ^0.4.4;

contract House {
  
  // one contract is associated to one particular House in the network.

  address Admin;                    // shall be defined at the creation of contract or to be defined manually
  address public Address;
  bytes32 public name;              // name of the device (Serie No.)
  uint    consumption;              // Production of electricity (consumption: positive)
  uint    consumStatusAt;           // timestamp of the update (consumption)
  uint    consumTimeOut = 5 minutes;
  address[] connectedPV;            // List of PV connected
  address[] connectedBattery;       // List of batteries connected

  uint    lastPriceQueryAt;
  struct PriceTF {
    uint  prs;
    bool  updated;
  }
  mapping(address=>PriceTF) priceQueryInfo;
  mapping(uint=>address) priceSort;

  
  modifier ownerOnly {
    if (msg.sender == Address) {
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
    for (var i = 0; i < connectedPV.length; i++) {
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
    for (var i = 0; i < connectedBattery.length; i++) {
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

  modifier timed (uint initialTime, uint allowedTimeOut) {
    if(now < initialTime + allowedTimeOut) {
      _;
    } else {
      revert();
    }
  }

  function House (address adr, address adm) {
    // constructor
    Address = adr;
    Admin = adm;
  }

  function setConsumption(uint consum) ownerOnly {
    consumption = consum;
    consumStatusAt = now;
  }

  function addConnectedPV(address adrP) adminOnly external {
    connectedPV.push(adrP);
  }

  function deleteConnectedPV(address adrP) adminOnly external {
    for (var i = 0; i < connectedPV.length; i++) {
      if (adrP == connectedPV[i]) {
        delete connectedPV[i];
        if (i != connectedPV.length-1) {
          connectedPV[i] = connectedPV[connectedPV.length-1];
        }
        connectedPV.length--;
      }
    }
  }

  function addConnectedBattery(address adrB) adminOnly external {
    connectedBattery.push(adrB);
  }

  function deleteConnectedBattery(address adrB) adminOnly external {
    for (var i = 0; i < connectedBattery.length; i++) {
      if (adrB == connectedBattery[i]) {
        delete connectedBattery[i];
        if (i != connectedBattery.length-1) {
          connectedBattery[i] = connectedBattery[connectedBattery.length-1];
        }
        connectedBattery.length--;
      }
    }
  }

  function getConsumption(uint initTime) timed(initTime,consumTimeOut) external returns (uint consum, uint consumAt) {
    consum = consumption;
    consumAt = consumStatusAt;
  }

  function getPVPrice(address deviceAdr) returns (uint, bool, address) {
      return deviceAdr.call(bytes4(sha3("getPrice(uint)")),lastPriceQueryAt);
  }

  function queryPrice(address deviceAdr) ownerOnly {
    PriceTF memory tempPriceTF;
    uint prs;
    bool updatedOrNot;
    address adr;

    lastPriceQueryAt = now;
    for (var i = 0; i < connectedPV.length; i++) {
      (prs, updatedOrNot, adr) = deviceAdr.call(bytes4(sha3("getPrice(uint)")),lastPriceQueryAt);
      tempPriceTF.prs = prs;
      tempPriceTF.updated = updatedOrNot;
      priceQueryInfo[adr] = tempPriceTF;
    }
    for (var j = 0; j < connectedBattery.length; j++) {
      (prs, updatedOrNot, adr) = deviceAdr.call(bytes4(sha3("getSalePrice(uint)")),lastPriceQueryAt);
      tempPriceTF.prs = prs;
      tempPriceTF.updated = updatedOrNot;
      priceQueryInfo[adr] = tempPriceTF;
    }



  }

}
