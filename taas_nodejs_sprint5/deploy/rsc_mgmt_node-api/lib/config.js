var convict = require('convict');


var cfgSchema = {
	env: {
        doc: 'The application environment',
        format: String,
        default: 'default',
        env: 'RESOURCE_ENV'
    },
    nova:{
    	doc: 'nova rest api url',
    	format: 'url',
    	default: 'http://10.206.13.64:8774/v2/',
    	env: 'NOVA_API_URL'
    },
    heat:{
    	doc: 'heat rest api url',
    	format: 'url',
    	default: 'http://10.206.13.67:8004/v1/',
    	env: 'HEAT_API_URL'
    },
    keystone:{
    	doc: 'keystone rest api url',
    	format: 'url',
    	default: 'http://10.206.13.58:5000/v3/',
    	env: 'KEYSTONE_API_URL'
    },
    glance:{
        doc: 'glance rest api url',
        format: 'url',
        default: 'http://10.206.13.61:9292/v2/',
        env: 'GLANCE_API_URL'
    },
    username:{
    	doc: 'login with username',
    	format: String,
    	default: 'admin',
    	env: 'AUTH_USERNAME'    	
    },
    password:{
    	doc: 'login with password',
    	format: String,
    	default: 'openstack',
    	env: 'AUTH_PASSWORD'
    },
    tenant_id:{
    	doc: 'tenant id of openstack',
    	format: String,
    	default:'ff35019f1d764464a72d40cb11d05cc1',
    	env: 'TENANT_ID'
    },
    network_private:{
        doc: 'network private id of openstack',
        format: String,
        default:'05b9d8d3-9d83-4fe2-9975-1a8c6f882e6f',
        env: 'NETWORK_PRIVATE'
    },
    network_public:{
        doc: 'network public id of openstack',
        format: String,
        default:'ba672e22-f079-4840-9fdc-51f46eb0e494',
        env: 'NETWORK_PUBLIC'
    },
    image:{
        doc: 'image id of openstack',
        format: String,
        default:'64d37828-6237-4563-8f96-c5e636d524f9',
        env: 'IMAGE'
    },
    key_name:{
        doc: 'key nameof openstack',
        format: String,
        default:'sit_taas_heat',
        env: 'KEY_NAME'
    }
}

var conf = convict(cfgSchema);
var env = conf.get('env');
conf.loadFile(__dirname + '/../' + env + '.json');

module.exports = conf;