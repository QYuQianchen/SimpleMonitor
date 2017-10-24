pragma solidity ^0.4.4;

contract House {
  
  // one contract is associated to one particular House in the network.

  address Admin;            // shall be defined at the creation of contract or to be defined manually
  address public Address;
  bytes32 public name;             // name of the device (Serie No.)
  uint    consumption;      // Production of electricity (consumption: positive)
  uint    consumStatusAt;         // timestamp of the update (consumption)
  uint    consumTimeOut = 5 minutes;

  mapping(address=>bool) connectedPV;  // List of PV connected
  mapping(address=>bool) connectedBattery;  // List of batteries connected
  uint    connectedPVNum;
  uint    connectedBatteryNum;  
  
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
    if (connectedPV[adrP] == true) {
      _;
    } else {
      revert();
    }
  }

  modifier connectedBatteryOnly (address adrB) {
    if (connectedBattery[adrB] == true) {
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
    connectedPVNum = 0;
    connectedBatteryNum = 0;
  }

  function setConsumption(uint consum) ownerOnly {
    consumption = consum;
    consumStatusAt = now;
  }

  function addConnectedPV(address adrP) adminOnly {
    connectedPV[adrP] = true;
    connectedPVNum++;
  }

  function deleteConnectedPV(address adrP) adminOnly {
    connectedPV[adrP] = false;
    connectedPVNum--;
  }

  function addConnectedBattery(address adrB) adminOnly {
    connectedBattery[adrB] = true;
    connectedBatteryNum++;
  }

  function deleteConnectedBattery(address adrB) adminOnly {
    connectedBattery[adrB] = false;
    connectedBatteryNum--;
  }

  function getConsumption(uint initTime) timed(initTime,consumTimeOut) returns (uint consum, uint consumAt) {
    consum = consumption;
    consumAt = consumStatusAt;
  }

}
