pragma solidity ^0.4.4;

library ClockLib {

  struct GlobalClock {
    uint statusNo;
    uint maxLoop;
    uint currentLoop;
    uint[6] timeInterval; // = [9, 1, 2, 2, 5, 2]; 
  }


  function initClock(GlobalClock storage _gc) {
    _gc.statusNo = 0;
    _gc.maxLoop = 0;
    _gc.currentLoop = 0;
    _gc.timeInterval = [9, 1, 2, 2, 5, 2]; 
  }
}
