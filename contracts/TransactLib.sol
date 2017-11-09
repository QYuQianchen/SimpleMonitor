pragma solidity ^0.4.4;

library TransactLib {

  event EnergyTransferLog(address adrFrom, address adrTo, uint eVol, uint transferAt);
  event MoneyTransferLog(address adrFrom, address adrTo, uint mAmount, uint transferAt);

  function calculateHouseReceivedVolume(uint consum, uint giveoutvol) returns (uint takeoutvol) {
    if (consum >= giveoutvol) { // house should take all what PV gives
      takeoutvol = giveoutvol;
    } else {
      takeoutvol = consum;
    }
  }

  function calculatePVGiveoutVolume (uint prod, uint consumvol) returns(uint giveoutvol) {
    if (prod >= consumvol) {  // PV should give out what they require
      giveoutvol = consumvol;
    } else {
      giveoutvol = prod;
    }
  }

  function clearEnergyTransfer (uint consump, uint delta, address adr) returns (uint) {   // the receiver of energy triggers
    consump = consump - delta;
    EnergyTransferLog(msg.sender, adr, delta, now);
    return consump;
  }

  function clearMoneyTransfer (int wallet, uint delta, address adr1, address adr2) returns (int) {     // the recevier of money triggers
    wallet = wallet + int(delta);
    MoneyTransferLog(adr1, adr2, delta, now);
    return wallet;
  }
}
