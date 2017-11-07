pragma solidity ^0.4.4;

import "./IGrid.sol";

contract Grid is IGrid {

  address Admin;                    // shall be defined at the creation of contract or to be defined manually
  address public owner;
  uint    price;
  uint    priceStatusAt;            // timestamp of the update (price)
  uint    priceTimeOut = 5 minutes;

  modifier ownerOnly {
    if (msg.sender == owner) {
      _;
    } else {
      revert();
    }
  }

  function Grid(address adr) {
    // constructor
    // Assuming that the Grid can be connected by all the devices
    owner = adr;
    Admin = msg.sender;
  }

  function setPrice(uint prs) ownerOnly {
    price = prs;
    priceStatusAt = now;
  }

  function getPrice() returns (uint prs, bool updatedOrNot) {
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
