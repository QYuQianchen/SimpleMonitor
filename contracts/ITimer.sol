pragma solidity ^0.4.4;

contract ITimer {
  /*function ITimer() {
    // constructor
  }*/

  function checkStatus() public returns (uint);
  function checkIndex() public returns (uint);
  function getTimeToNextStatus() public returns (uint);
}
