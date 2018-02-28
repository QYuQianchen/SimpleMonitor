// const csvFilePath = './house_0.csv'
const fs = require('fs');
const csv = require('csvtojson')

// var fileNo = 0;

parseHouse(0);
parseHouse(1);
parseHouse(2);


function parseHouse(fileNo) {

    var csvFilePath = "./house_" + fileNo + ".csv";
var jsonFileName = "house_" + fileNo + ".json"

var house= {
    "consumption" : [],
    "consumptionH" : []
  }

csv({
    colParser:{
        "user.name":function(item, head, resultRow, row , colIdx){
            resultRow[head]=item;
        }
    }
})
    .fromFile(csvFilePath)

    .on('json',(jsonObj) => {
        house["consumption"].push(parseInt(jsonObj["consumption"],10));
        house["consumptionH"].push([parseInt(jsonObj["consumptionH_M"],10),parseInt(jsonObj["consumptionH_H"],10)]);
    })

    .on('end_parsed',(jsonArrObj)=>{
        // fs.writeFile(jsonFileName, JSON.stringify(house, null, 4), function(err) {   //formatted
        fs.writeFile(jsonFileName, JSON.stringify(house,null), function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("JSON saved");
            }
        });
    })
}