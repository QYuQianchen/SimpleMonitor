pragma solidity ^0.4.4;

contract IGrid {

  int     wallet;                   // To record loss & gain
  function getPrice() returns (uint prs, bool updatedOrNot);
}
