const fs = require('fs');
const json2csv = require('json2csv');
const readFile = require('util').promisify(fs.readFile);

const Json2csvParser = json2csv.Parser;
const fields = ['ConsumptionE']; // ,'ConsumptionH', 'Wallet'
const unwind = ['ConsumptionE'];
// const fields = [{
//   label: 'house.ConsumptionE',
//   value: 'consumptionE'
// },{
//   label: 'house.ConsumptionH',
//   value: 'consumptionH'
// }];
const opts = { fields, unwind };

var myData = null;
 

function readJson(_dir) {
  // _dir = "../output/record_10.json"
  return readFile(_dir)
      // .then(e => console.log(e.toString()))
      .then(e => {
          myData = JSON.parse(e);
      })
      .catch(e => console.log('FOOBAR ' + e));
}

readJson("./record_10.json").then(function(){

  try {
    const parser = new Json2csvParser(opts);  //{ fields, unwind: ['items', 'items.items'] } 
    const csv = parser.parse(myData.house[0]);
    console.log(csv);

  } catch (err) {
    console.error(err);
  }

})



// json2csv -i record_10.json -f house --no-header -o record_10_house.csv
// json2csv -i record_10.json unwind:[house, house.ConsumptionE, house.ConsumptionH, house.Wallet] --no-header -o record_10_house_detail.csv