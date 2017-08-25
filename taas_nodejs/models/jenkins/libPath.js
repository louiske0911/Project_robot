/**
 * @fileoverview Slave lib path info
 */
var fs = require('fs');
var path = require('path');

var slave_lib_path_txt = fs.readFileSync(path.join(__dirname, '../../deploy/slave_lib_path.json'), 'utf8');
var slave_lib_path = JSON.parse(slave_lib_path_txt);

module.exports.deployment_lib = slave_lib_path.deployment_lib;
module.exports.selenium_lib = slave_lib_path.selenium_lib;
module.exports.test_lib = slave_lib_path.test_lib;
module.exports.test_mgmt_lib = slave_lib_path.test_mgmt_lib;
