pragma solidity ^0.4.4;

import "./IGrid.sol";
import "./IBattery.sol";
import "./TransactLib.sol";
import "./GeneralDevice.sol";

contract Grid is GeneralDevice, IGrid {

  using TransactLib for *;

  uint    price;
  uint    priceFeedIn;
  uint    priceStatusAt;            // timestamp of the update (price)


  function Grid(address adr) GeneralDevice(adr) { }

  function setPrice(uint prs, uint prsF) ownerOnly {
    price = prs;
    priceFeedIn = prsF;
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
    for (uint i = 0; i < connectedDevice[2].length; i++) {
      (consum,rank,tot,updated) = IBattery(connectedDevice[2][i]).getSortedPVInfo();
      if (updated && consum != 0) {
        // transaction
        adr = connectedDevice[2][i];
        whatDeviceAccept = IBattery(adr).goNoGo(posBackup);
        posBackup -= whatDeviceAccept;
        receivedMoney = whatDeviceAccept*price;
        wallet = wallet.clearMoneyTransfer(receivedMoney,adr, address(this));
      }
    }
  }

  function goExcess(uint vol) returns (uint takeVol, uint prs) {
    prs = priceFeedIn;
    takeVol = vol.findMin(negBackup);
    negBackup = negBackup.clearEnergyTransfer(takeVol, address(this));
    wallet -= int(takeVol*prs);
  }

  function goExtra(uint vol) returns (uint takeVol, uint prs) { // when houses have not sufficient energy supply from microgrid
    prs = price;
    takeVol = vol.findMin(posBackup);
    posBackup -= takeVol;
    wallet = wallet.clearMoneyTransfer(takeVol*prs,msg.sender, address(this));
  }
}
