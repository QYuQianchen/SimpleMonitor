pragma solidity ^0.4.4;

import "./ITimer.sol";

contract GlobalTimer is ITimer {

  uint startingTime;
  uint statusNo;
  //uint maxLoop;
  uint currentLoop;
  uint transactInterval;
  uint timeLapse;
  uint[6] cumulatedTime;

  function GlobalTimer() {
    // constructor
    statusNo = 0;
    transactInterval = 5; // seconds
    timeLapse = 0;
    //maxLoop = 30;  // each rank take 1s to finish transaction (5 min/10s = 30 times)
    currentLoop = 0;
    cumulatedTime = [9, 15, 30, 45, 60, 75]; //[inf, 1, 2, 2, 5, 2];
  }

  /*function setStatus(uint s) {
    statusNo = s;
  }

  function setcurrentLoop(uint s) {
    currentLoop = s;
  }*/

  function checkStatus() public returns (uint) {
    // everytime one asks for Status, the GlobalTimer updates the status.
    if (statusNo == 0) {
      // start counting time
      statusNo = 1;
      startingTime = now;
    } else {
      for (uint i = statusNo; i < cumulatedTime.length; i++) {
        if (now <= startingTime + cumulatedTime[i]) {
          // remain the same status
          statusNo = i;
          break;
        }
      }
      if (i == cumulatedTime.length) {
        // one loop finished.
        statusNo = 1;
        startingTime = now;
      }
    }
    return statusNo;
  }

  function checkIndex() public returns (uint) {
    if (checkStatus() != 4) {
      //no transaction can be made at this time
      timeLapse = 0;
      currentLoop = 0;
    } else {
      timeLapse = now - startingTime - cumulatedTime[3];    // try seconds instead of minutes...
      currentLoop = uint(timeLapse/transactInterval) + 1;
    }
    return currentLoop;
  }

  function getTimeToNextStatus() public returns (uint) {
    if (statusNo == 0) {
      return 0;
    } else {
      checkStatus();
      uint elapsed = (now - startingTime);
      return (cumulatedTime[statusNo] - elapsed);
    }
  }
}
