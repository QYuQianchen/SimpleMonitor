pragma solidity ^0.4.4;

import "./AdrLib.sol";
//import "./ClockLib.sol";
import "./ITimer.sol";

contract GeneralDevice {
  using AdrLib for address[];
  //using ClockLib for ClockLib.GlobalClock;

  address public Admin;               // the account address of the admin
  address internal owner;             // the account address of the owner. Here we are still using adr in the constructor,
                                      // but later we may change the adr input into byte32, by a harshed device identifier
  bytes32 internal name;              // name of the device (Serie No.)
  address grid = 0x0;
  address globalTimer = 0x0;
  int     wallet;                     // To record loss & gain (that of house is negative -> need to pay others)
  mapping(uint=>address[]) connectedDevice;
  //ClockLib.GlobalClock globalTimer;

  modifier adminOnly {
    if (msg.sender == Admin) {
      _;
    } else {
      revert();
    }
  }

  modifier ownerOnly {
    if (msg.sender == owner) {
      _;
    } else {
      revert();
    }
  }

  modifier connectedHouseOnly (address adr) {
    if (connectedDevice[1].assertInside(adr) == true) {
      _;
    } else {
      revert();
    }
  }

  modifier connectedPVOnly (address adr) {
    if (connectedDevice[1].assertInside(adr)) {
      _;
    } else {
      revert();
    }
  }

  modifier connectedBatteryOnly (address adr) {
    if (connectedDevice[2].assertInside(adr)) {
      _;
    } else {
      revert();
    }
  }

  modifier timed (uint shouldStatus) {
    if(shouldStatus == getTimerStatus()) {
      _;
    } else {
      revert();
    }
  }

  function GeneralDevice (address adr) {
    owner = adr;
    Admin = msg.sender;
  }

  function setGridAdr(address adr) adminOnly {
    grid = adr;
  }

  function setTimerAdr(address adr) adminOnly {
    globalTimer = adr;
  }

  function addConnectedDevice(uint a, address adr) adminOnly {
    connectedDevice[a].push(adr);
  }
  // a function that disconnects devices can be added here, if needed

  function getTimerStatus() returns (uint) {
    return ITimer(globalTimer).checkStatus();
  }

  function getTimerIndex() returns (uint) {
    return ITimer(globalTimer).checkIndex();
  }

  function getTimeToNextStatus() returns (uint) {
    return ITimer(globalTimer).getTimeToNextStatus();
  }

  function getWallet() returns (int) {
    return wallet;
  }

  //test

  function getTimerAddress() returns (address) {
    return globalTimer;
  }

}
