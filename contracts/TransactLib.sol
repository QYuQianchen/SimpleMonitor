pragma solidity ^0.4.4;

library TransactLib {

  event EnergyTransferLog(address adrFrom, address adrTo, uint eVol, uint transferAt);
  event MoneyTransferLog(address adrFrom, address adrTo, uint mAmount, uint transferAt);

  /*function calculateHouseReceivedVolume(uint consum, uint giveoutvol) returns (uint takeoutvol) {
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
  }*/

  // calculateMin...
  function findMin(uint a, uint b) pure public returns (uint c) {
    if (a >= b) {
      c = b;      
    } else {
      c = a;      
    }
  }

  function clearEnergyTransfer (uint consump, uint delta, address adr) internal returns (uint) {   // the receiver of energy triggers
    consump = consump - delta;
    EnergyTransferLog(msg.sender, adr, delta, now);
    return consump;
  }

  function clearMoneyTransfer (int wallet, uint delta, address adr1, address adr2) internal returns (int) {     // the recevier of money triggers
    wallet = wallet + int(delta);
    MoneyTransferLog(adr1, adr2, delta, now);
    return wallet;
  }

  function clearExcessTransfer (uint currentvol, uint delta, address adr) internal returns (uint) {   // the receiver of energy triggers
    currentvol = currentvol + delta;
    EnergyTransferLog(msg.sender, adr, delta, now);
    return currentvol;
  }

  function clearExtraTransfer (uint currentvol, uint delta, address adr) internal returns (uint) {   // the receiver of energy triggers
    currentvol = currentvol - delta;
    EnergyTransferLog(adr,msg.sender, delta, now);
    return currentvol;
  }
}
