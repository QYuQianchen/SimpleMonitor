pragma solidity ^0.4.4;

//import "./SinglePV.sol";
import "./SingleHouse.sol";
import "./SingleBattery.sol";
import "./Grid.sol";
import "./HouseLib.sol";
import "./SortLib.sol";

//=====interfaces====
contract Single {
  function getPrice(uint queryTime) returns (uint prs, bool updatedOrNot, address adr);
}

contract MatchableHouse is SingleHouse {

  function MatchableHouse(address adr, address adm)  SingleHouse(adr, adm) {
    // constructor
  }

  function getPVPrice(address houseAdr) returns (uint, bool, address) {
      // compiling error.... need to re-write the contract
      //return houseAdr.call(bytes4(sha3("getPrice(uint)")),lastPriceQueryAt);
  }


// Need to write code - use HouseLib to query the price
/*
  function queryPrice(address deviceAdr) ownerOnly {
    SortLib.PriceTF memory tempPriceTF;
    uint prs;
    bool updatedOrNot;
    address adr;

    lastPriceQueryAt = now;
    for (uint i = 0; i < connectedPV.length; i++) {
      (prs, updatedOrNot, adr) = deviceAdr.call(bytes4(sha3("getPrice(uint)")),lastPriceQueryAt);
      tempPriceTF.prs = prs;
      tempPriceTF.updated = updatedOrNot;
      priceQueryInfo[adr] = tempPriceTF;
    }
    for (uint j = 0; j < connectedBattery.length; j++) {
      (prs, updatedOrNot, adr) = deviceAdr.call(bytes4(sha3("getSalePrice(uint)")),lastPriceQueryAt);
      tempPriceTF.prs = prs;
      tempPriceTF.updated = updatedOrNot;
      priceQueryInfo[adr] = tempPriceTF;
    }
  }*/
}
