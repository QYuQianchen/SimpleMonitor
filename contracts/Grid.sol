pragma solidity ^0.4.4;

contract Grid {

  address Admin;                    // shall be defined at the creation of contract or to be defined manually
  address public Address;
  uint    price;
  uint    priceStatusAt;            // timestamp of the update (price)
  uint    priceTimeOut = 5 minutes;

  modifier ownerOnly {
    if (msg.sender == Address) {
      _;
    } else {
      revert();
    }
  }

  function Grid(address adr, address adm) {
    // constructor
    // Assuming that the Grid can be connected by all the devices
    Address = adr;
    Admin = adm;
  }

  function setPrice(uint prs) ownerOnly {
    price = prs;
    priceStatusAt = now;
  }

  function getPrice(uint queryTime) external returns (uint prs, bool updatedOrNot, address adr) {
    prs = price;
    //prsAt = priceStatusAt;
    if (priceStatusAt < queryTime+priceTimeOut) {
      updatedOrNot = true;
    } else {
      updatedOrNot = false;
    }
    adr = Address;
  }
}
