pragma solidity ^0.4.4;

//import "./SinglePV.sol";
import "./SingleHouse.sol";
import "./SingleBattery.sol";
import "./Grid.sol";
import "./HouseLib";

//=====interfaces====
contract Single {
  function getPrice(uint queryTime) returns (uint prs, bool updatedOrNot, address adr);
}

contract MatchableHouse is House {

  function MatchableHouse(address adr, address adm)  House (adr, adm) {
    // constructor
  }

  function getPVPrice(address houseAdr) returns (uint, bool, address) {
      return deviceAdr.call(bytes4(sha3("getPrice(uint)")),lastPriceQueryAt);
  }


  function queryPrice(address deviceAdr) ownerOnly {
    PriceTF memory tempPriceTF;
    uint prs;
    bool updatedOrNot;
    address adr;

    lastPriceQueryAt = now;
    for (var i = 0; i < connectedPV.length; i++) {
      (prs, updatedOrNot, adr) = deviceAdr.call(bytes4(sha3("getPrice(uint)")),lastPriceQueryAt);
      tempPriceTF.prs = prs;
      tempPriceTF.updated = updatedOrNot;
      priceQueryInfo[adr] = tempPriceTF;
    }
    for (var j = 0; j < connectedBattery.length; j++) {
      (prs, updatedOrNot, adr) = deviceAdr.call(bytes4(sha3("getSalePrice(uint)")),lastPriceQueryAt);
      tempPriceTF.prs = prs;
      tempPriceTF.updated = updatedOrNot;
      priceQueryInfo[adr] = tempPriceTF;
    }



  }
}
