pragma solidity ^0.4.4;

import "./GeneralDevice.sol";

contract IPV is GeneralDevice {
  // this is the interface for SinglePV

  uint    prodTimeOut = 5 minutes;
  uint    priceTimeOut = 5 minutes;
  int     wallet;                   // To record loss & gain

  function getPrice() public view returns (uint prs, bool updatedOrNot);
  //function setRankingInfo(uint c, uint r, uint tot);

  function getWallet() returns (int) {return wallet;}
  
}
