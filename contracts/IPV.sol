pragma solidity ^0.4.4;

import "./GeneralDevice.sol";

contract IPV is GeneralDevice {
  // this is the interface for SinglePV

  //address Admin; 
  address grid = 0x0;
  uint    prodTimeOut = 5 minutes;
  uint    priceTimeOut = 5 minutes;
  int     wallet;                   // To record loss & gain

  /*modifier adminOnly {
    if (msg.sender == Admin) {
      _;
    } else {
      revert();
    }
  }*/
  function getPrice() returns (uint prs, bool updatedOrNot);
  //function setRankingInfo(uint c, uint r, uint tot);

  function setGridAdr(address adr) adminOnly external {
    grid = adr;
  }

  function getWallet() returns (int) {return wallet;}
  
}
