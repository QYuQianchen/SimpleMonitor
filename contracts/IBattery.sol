pragma solidity ^0.4.4;

contract IBattery {

  function getSalePrice() returns (uint prs, bool updatedOrNot);
  function getExcess() returns (uint prs, uint cap);
  function getSortedPVInfo() returns(uint consum, uint rank, uint tot, bool updated);
}
