pragma solidity ^0.4.4;

contract MultiNumberBettingV1 {
  uint8 loserCount;
  uint8 winnerCount;
  //uint8[] numArray;
  uint8[3] numArray;

  function MultiNumberBettingV1(uint8 num1,uint8 num2,uint8 num3) {
    // constructor
    //numArray.length = 3;
    //numArray = [num1, num2, num3];
    numArray[0] = num1;
    numArray[1] = num2;
    numArray[2] = num3;
  }

  function  guess(uint8 guessNum) returns (bool) {

    for (uint8 i = 0; i < numArray.length; i++) { 
      if (numArray[i] == guessNum) {
        winnerCount += 1;
        return true;
      } else {
        loserCount += 1;
        return false;
      }
    }
  }

  function totalGuesses() returns(uint) {
    uint tG;
    tG = (winnerCount + loserCount);
    return tG;
  }

  function getArray() returns(uint8[3]) {
    return numArray;
  }
}
