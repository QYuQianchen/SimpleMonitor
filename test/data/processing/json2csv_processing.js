// CLI mode

// json2csv -i record_10.json -f house --no-header -o record_10_house.csv
// json2csv -i record_10.json unwind:[house, house.ConsumptionE, house.ConsumptionH, house.Wallet] --no-header -o record_10_house_detail.csv

const fs = require('fs');
var json2csv = require('json2csv');
const Json2csvParser = json2csv.Parser;
const Json2csvTransform = json2csv.Transform;
const readFile = require('util').promisify(fs.readFile);

var csv = require('csv-parser');

const looping = ['ConsumptionE','ConsumptionH', 'Wallet'];

var fields = null;
var unwind = null;

// const fields = ['ConsumptionE','ConsumptionH', 'Wallet']; // ,'ConsumptionH', 'Wallet'
// const unwind = ['ConsumptionE','ConsumptionH', 'Wallet'];
// const flatten = false;
// const opts = { fields, unwind, flatten};

// const fields = [{
//   label: 'house.ConsumptionE',
//   value: 'consumptionE'
// },{
//   label: 'house.ConsumptionH',
//   value: 'consumptionH'
// }];

var myData = null;

function readJson(_dir) {
  return readFile(_dir)
      .then(e => {
          myData = JSON.parse(e);
      })
      .catch(e => console.log('FOOBAR ' + e));
}

function parsing(datasource, option) {
  try {
    const parser = new Json2csvParser(option);  //{ fields, unwind: ['items', 'items.items'] } 
    const csv = parser.parse(datasource);
    return csv;
  
  } catch (err) {
    console.error(err);
  }
}

// // const output = fs.createWriteStream(outputPath, { encoding: 'utf8' });

// readJson("./record_10.json").then(function(){

//   var csvArray = [];
//   var dataArray = [];

//   console.log(myData.house[0]);

//   looping.forEach(element => {
//     fields = [element];
//     unwind = [element];
//     var opts = { fields, unwind };
//     // console.log(opts);
//     var result = parsing(myData.house[0], opts);
//     csvArray.push(result);
//     fs.writeFileSync('./record_10.csv', result);
//     console.log(result);

//     fs.createReadStream('./record_10.csv')
//       .pipe(csv())
//       .on('data', function (data) {
//         data.result[0] = result;
//         dataArray.push(data);
//       })
//       .on('end', function(){
//         const parser_new = new Json2csvParser({fields: Object.keys(dataArray[0])});
//         var result_new = parser_new.parse({ data: dataArray});
//         
//       });
//   });
//   // console.log(csvArray);
// });

readJson("./record_10.json").then(function(){

  console.log(myData.house[0]);

  var json_result = {};
  json_result["house0"] = [];

  for (let i = 0; i < myData.house[0].ConsumptionE.length; i++) {
    tempObj = new Object()
    for (var key in myData.house[0]) {
      if (Array.isArray(myData.house[0][key][i])) {
        tempObj[key] = {}
        for (var subkey in myData.house[0][key][i]) {
          tempObj[key][subkey] = myData.house[0][key][i][subkey];
        }
      } else {
        tempObj[key] = myData.house[0][key][i];
      }
    }
    json_result["house0"].push(tempObj)
  }
  console.log(json_result)

  try {
    const flatten = true;
    const parser = new Json2csvParser({flatten});  //{ fields, unwind: ['items', 'items.items'] } 
    const csv = parser.parse(json_result["house0"]);
    console.log(csv);
    return csv;
  
  } catch (err) {
    console.error(err);
  }
  
}).then(function(csv) {
  fs.writeFileSync('./record_10.csv', csv);
});




