var MultiNumberBettingV2 = artifacts.require("./MultiNumberBettingV2.sol")

contract('MultiNumberBettingV2', function(accounts) {
  it("should assert true", function() {
    var multi_number_betting_v2;
    return MultiNumberBettingV2.deployed().then(function(instance){
      multi_number_betting_v2 = instance;

      //multi_number_betting_v1.guess(2,"Anna");
      return multi_number_betting_v2.totalGuesses.call();
    }).then(function(result){
      console.log("Total Guesses 1 =",result.toNumber());
      multi_number_betting_v2.guess(2,"Anna");
      return multi_number_betting_v2.getLastWinner.call();
    }).then(function(result){
      console.log("The Last Winner is: ",result);
      assert.equal(result,"Anna", "Winner NOT equal to Anna");
      //assert.isTrue(result.toNumber() == 1);
      //return multi_number_betting_v2.getArray.call();
      multi_number_betting_v2.guess(1,"Bob");
      return multi_number_betting_v2.getLastWinner.call();
    }).then(function(result){
      console.log(result);
      assert.isTrue((result)!="Bob");
    });
  });
});