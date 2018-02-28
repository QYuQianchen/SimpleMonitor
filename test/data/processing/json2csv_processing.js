// const fs = require('fs');
// const csv = require('csvtojson')
// const readFile = require('util').promisify(fs.readFile);

// const Json2csvParser = require('json2csv').Parser;
// const fields = ['ConsumptionE', 'ConsumptionH', 'Wallet'];
// const opts = { fields };
 

// function readJson() {
//         _dir = "../output/record_10.json"
//         return readFile(_dir)
//             // .then(e => console.log(e.toString()))
//             .then(e => {
//                 var myData = JSON.parse(e);
//             })
//             .catch(e => console.log('FOOBAR ' + e));
// }

// readJson();

// try {
//   const parser = new Json2csvParser(opts);
//   const csv = parser.parse(myData);
//   console.log(csv);
// } catch (err) {
//   console.error(err);
// }