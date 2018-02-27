const path = require('path');
const fs = require('fs');
const readFile = require('util').promisify(fs.readFile);

var objs = [];

var inputs = {
    "house" : [

    ],
    "pv" : [

    ],
}

function addElement() {
    var addPromise = [];
    for (let i = 0; i < 2; i++) {
        _dir = "./house_" + i + "_sample.json"
        addPromise.push(readFile(_dir)
            // .then(e => console.log(e.toString()))
            .then(e => {
                objs[i] = JSON.parse(e);
                inputs["house"].push(objs[i]);
                // console.log(inputs["house"]);
            })
            .catch(e => console.log('FOOBAR ' + e)));
    }
    return Promise.all(addPromise);
}

addElement().then(function() {
    console.log(inputs["house"]);
})


