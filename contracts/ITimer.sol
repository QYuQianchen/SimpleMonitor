pragma solidity ^0.4.4;

contract ITimer {
  /*function ITimer() {
    // constructor
  }*/

  function checkStatus() public returns (uint);
  function checkIndex() public returns (uint);
  function getTimeToNextStatus() public returns (uint);

  // this function is only for testing.
  // it changes the step of the global timer according to the need. 
  function testSetStep(uint forcedChange) public returns (bool);
}
