pragma solidity ^0.4.4;

contract Calculator {
  
  uint result;

  function Calculator(uint initial) {
    // constructor
    result = initial;
  }

  function  getResult() constant returns (uint) {
    return result;
  }

  function addToNumber(uint num) {
    result += num;
  }

  function subtractFromNumber(uint num) {
    result -= num;
  }

  function multiplyWithNumber(uint num) {
    result *= num;
  }

  function divideByNumber(uint num) {
    if (num != 0) {
      result /= num;
    }
  }

  function double(){
    // result *=2
    multiplyWithNumber(2);
  }

  function half(){
    // result /=2
    divideByNumber(2);
  }
}
