pragma solidity ^0.4.4;

contract GeneralDevice {
  address public Admin;             // the account address of the admin
  address public owner;             // the account address of the owner
  bytes32 public name;              // name of the device (Serie No.)

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
}
