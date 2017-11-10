pragma solidity ^0.4.4;

import "./IGrid.sol";
import "./IBattery.sol";
import "./TransactLib.sol";

contract Grid is IGrid {

  using TransactLib for *;

  address Admin;                    // shall be defined at the creation of contract or to be defined manually
  address public owner;
  uint    price;
  uint    priceStatusAt;            // timestamp of the update (price)

  modifier ownerOnly {
    if (msg.sender == owner) {
      _;
    } else {
      revert();
    }
  }

  function Grid(address adr) {
    // constructor
    // Assuming that the Grid can be connected by all the devices
    owner = adr;
    Admin = msg.sender;
  }

  function setPrice(uint prs) ownerOnly {
    price = prs;
    priceStatusAt = now;
  }

  function getPrice() returns (uint prs, bool updatedOrNot) {
    prs = price;
    //prsAt = priceStatusAt;
    if (priceStatusAt + priceTimeOut < now) {
      updatedOrNot = false;
    } else {
      updatedOrNot = true;
    }
    //adr = owner;
  }

  function needTBCharged() {
    //Grid ask if battery is actively buying energy from grid?
    uint consum;
    uint rank;
    uint tot;
    bool updated;
    uint whatDeviceAccept;
    uint receivedMoney;
    address adr;
    for (uint i = 0; i < connectedBattery.length; i++) {
      (consum,rank,tot,updated) = IBattery(connectedBattery[i]).getSortedPVInfo();
      if (updated && consum != 0) {
        // transaction
        adr = connectedBattery[i];
        whatDeviceAccept = IBattery(adr).goNoGo(posBackup);
        posBackup -= whatDeviceAccept;
        receivedMoney = whatDeviceAccept*price;
        wallet = wallet.clearMoneyTransfer(receivedMoney,adr, address(this));
      }
    }
  }
}
