pragma solidity ^0.4.4;

contract GeneralDevice {
  address public Admin;               // the account address of the admin
  address internal owner;             // the account address of the owner
  // Here we are still using adr in the constructor, but later maybe we should change the adr input into byte32, by a harshed device identifier
  bytes32 internal name;              // name of the device (Serie No.)
  address grid = 0x0;
  int     wallet;                     // To record loss & gain (that of house is negative -> need to pay others)
  mapping(uint=>address[]) connectedDevice;

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

  function GeneralDevice (address adr) {
    owner = adr;
    Admin = msg.sender;
  }

  function setGridAdr(address adr) adminOnly {
    grid = adr;
  }

  function addConnectedDevice(uint a, address adr) adminOnly {
    connectedDevice[a].push(adr);
  }
}
