var fs = require('fs');
// var config = require('./location.json');


// console.log('magnitude')
// for (var i = 0; i < config['data'].length; i++) {
//     data = config['data'][i];
//     console.log(data['magnitude'])
// }

// console.log('Lat')
// for (var i = 0; i < config['data'].length; i++) {
//     data = config['data'][i];
//     console.log(data['Lat'])
// }

// console.log('Lng')
// for (var i = 0; i < config['data'].length; i++) {
//     data = config['data'][i];
//     console.log(data['Lng'])
// }

fs.readFile('./output.txt', function(err, data) {
    if (err) throw err;
    data = data.toString().split('\n')
        // data = data.replace("\n", "123")
    data = data[0].replace('{', ' ').replace('}', ' ').replace('Lat:', ' '), replace('Lng:', ' ')
    console.log(data);
});