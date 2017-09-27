pragma solidity ^0.4.4;

contract MultiNumberBettingV2 {
  uint8 loserCount;
  uint8 winnerCount;
  //uint8[] numArray;
  uint8[3] numArray;
  string lastWinnerName;

  function MultiNumberBettingV2(uint8 num1,uint8 num2,uint8 num3) {
    // constructor
    //numArray.length = 3;
    //numArray = [num1, num2, num3];
    numArray[0] = num1;
    numArray[1] = num2;
    numArray[2] = num3;
  }

  function  guess(uint8 guessNum, string guessName) returns (bool) {

    for (uint8 i = 0; i < numArray.length; i++) { 
      if (numArray[i] == guessNum) {
        winnerCount += 1;
        lastWinnerName = guessName;
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

  function getLastWinner() returns(string) {
    return lastWinnerName;
  }
}
