/**
 * @fileoverview TaaS configuration utility
 */

var convict = require('convict');

var cfgSchema = {
    env: {
        doc: 'The application environment',
        format: String,
        default: 'default',
        env: 'TAAS_ENV'
    },
    unit_test: {
        doc: 'The unit test mode',
        format: Boolean,
        default: false,
        env: 'TAAS_UNIT_TEST'
    },
    main_db: {
        doc: 'Main database',
        format: String,
        default: 'mongodb://mongodb/TaaS',
        env: 'TAAS_MAIN_DB'
    },
    system_timezone: {
        doc: 'Default timezone used in TaaS UI',
        format: String,
        default: 'Asia/Taipei',
        env: 'TAAS_SYSTEM_TIMEZONE'
    },
    jenkins_master: {
        doc: 'Jenkins master host url',
        format: 'url',
        default: 'http://localhost:8080',
        env: 'TAAS_JENKINS_MASTER'
    },
    jenkins_timeout: {
        doc: 'Jenkins timeout length',
        format: Number,
        default: 3000,
        env: 'TAAS_JENKINS_TIMEOUT'
    },
    archive_file_server: {
        doc: 'Archive file server host url',
        format: 'url',
        default: 'http://localhost:8500',
        env: 'TAAS_ARCHIVE_FILE_SERVER'
    },
    archive_file_listing_server: {
        doc: 'Archive file listing server host url',
        format: 'url',
        default: 'http://localhost:8501',
        env: 'TAAS_ARCHIVE_FILE_LISTING_SERVER'
    },
    host_address: {
        doc: 'Host address',
        format: 'url',
        default: 'http://localhost:8082',
        env: 'TAAS_HOST_ADDRESS'
    },
    resource_management_server:{
        doc: 'resource management server url',
        format: 'url',
        default: 'http://localhost:3000',
        env: 'TAAS_RESOURCE_MANAGEMENT_NODE'
    }
};

var conf = convict(cfgSchema);
var env = conf.get('env');
conf.loadFile(__dirname + '/../config/' + env + '.json');
conf.validate({strict: true});

console.log('TaaS configuration');
console.log('==================');
for (var cfgKey in cfgSchema) {
    console.log(cfgKey + ': ' + conf.get(cfgKey));
}

module.exports = conf;
