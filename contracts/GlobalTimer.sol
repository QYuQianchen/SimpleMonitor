pragma solidity ^0.4.4;

import "./ITimer.sol";

contract GlobalTimer is ITimer {

  uint startingTime;
  uint statusNo;
  uint maxLoop;
  uint currentLoop;
  uint[6] cumulatedTime; 

  function GlobalTimer() {
    // constructor
    statusNo = 0;
    maxLoop = 0;
    currentLoop = 0;
    cumulatedTime = [9, 1, 3, 5, 10, 12];  //[inf, 1, 2, 2, 5, 2];
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
    } else {
      for (uint i = 1; i < cumulatedTime.length; i++) {
        if (now <= startingTime + cumulatedTime[i] * 1 minutes) {
          // remain the same status
          statusNo = i;
          break;
        }
      }
      if (i == cumulatedTime.length+1) {
        // one loop finished.
        statusNo = 1;
        startingTime = now; 
      }
    }
    return statusNo;
  }
}
