var MultiNumberBettingV1 = artifacts.require("./MultiNumberBettingV1.sol")

contract('MultiNumberBettingV1', function(accounts) {
  it("should assert true", function() {
    var multi_number_betting_v1;
    return MultiNumberBettingV1.deployed().then(function(instance){
      multi_number_betting_v1 = instance;
      // Get the total guesses
      
      //console.log(result);
      //return multi_number_betting_v1.guess(1);
      return multi_number_betting_v1.totalGuesses.call();
    }).then(function(result){
      console.log("Total Guesses 1 =",result.toNumber());
      multi_number_betting_v1.guess(1);
      return multi_number_betting_v1.totalGuesses.call();
    }).then(function(result){
      console.log("Total Guesses 2 =",result.toNumber());
      assert.equal(result.toNumber(),1, "Guesses Not equal to 1");
      assert.isTrue(result.toNumber() == 1);
      return multi_number_betting_v1.getArray.call();
    }).then(function(result){
      console.log(result.valueOf());
    });
  });
});