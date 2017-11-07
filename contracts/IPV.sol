pragma solidity ^0.4.4;

contract IPV {

  // this is the interface for SinglePV
  function getPrice() returns (uint prs, bool updatedOrNot);
  //function setRankingInfo(uint c, uint r, uint tot);
}
