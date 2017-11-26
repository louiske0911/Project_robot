var fs = require('fs');
var config = require('./location.json');


console.log('magnitude')
for (var i = 0; i < config['data'].length; i++) {
    data = config['data'][i];
    console.log(data['magnitude'])
}

console.log('Lat')
for (var i = 0; i < config['data'].length; i++) {
    data = config['data'][i];
    console.log(data['Lat'])
}

console.log('Lng')
for (var i = 0; i < config['data'].length; i++) {
    data = config['data'][i];
    console.log(data['Lng'])
}