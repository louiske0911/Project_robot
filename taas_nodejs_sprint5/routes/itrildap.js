/**
 * This is a module for itri's LDAP authentication.
 *
 * Author : Urostigma
 *
 * Cratedate : 2016/1/6
 */

var LDAP = require('ldapjs');
var opts = {
	attributes: [] //All attributes
};

/*
 * Parameters
 * 	account
 *		user ID
 * 	password
 *		user's password
 * 	callback(err, data)
 *		If authenticate success, "err" value will be a null value. 
 *		Otherwise, "err" value will be as same as the bind function's "err" value 
 *		which is in ldapjs module.
 */
var fLdapAuth = function(account, password, callback) {
	var client = LDAP.createClient({
		url: 'ldap://140.96.254.102:389' //ITRI's LDAP IP address
	});
	client.bind('CN=' + account + ',CN=USERS,DC=ITRI,DC=DS', password, function(err) {
		if (err) {
			client.unbind();
			callback(err, null);
		} else {
			client.search('CN=' + account + ',CN=USERS,DC=ITRI,DC=DS', opts, function(err, res) {
				if (err) {
					console.log('search error');
					client.unbind();
					callback(err, null);
				}
				res.on('searchEntry', function(entry) {
					client.unbind();
					callback(null, entry.object);
				});
			});
		}
	});
}

module.exports.fLdapAuth = fLdapAuth;