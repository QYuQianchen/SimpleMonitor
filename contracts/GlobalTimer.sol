pragma solidity ^0.4.4;

import "./ITimer.sol";

contract GlobalTimer is ITimer {

  uint startingTime;
  uint statusNo;
  uint maxLoop;
  uint currentLoop;
  uint[6] timeInterval; 

  function GlobalTimer() {
    // constructor
    statusNo = 0;
    maxLoop = 0;
    currentLoop = 0;
    timeInterval = [9, 1, 2, 2, 5, 2];
  }

  /*function setStatus(uint s) {
    statusNo = s;
  }*/

  function checkStatus() public returns (uint) {
    // everytime one asks for Status, the GlobalTimer updates the status.
    if (statusNo == 0) {
      // start counting time
      statusNo = 1;
      startingTime = now;
    }
    return statusNo;
  }
}
