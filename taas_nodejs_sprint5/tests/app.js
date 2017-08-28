require('mocha');
var assert = require('assert');
var conf = require('../lib/config');
const HOSTIP = conf.get('host_address');

suite('app', function() {

    test('visit /', function() {
        // test code goes here
        assert.ok(true);
    });

    //test http status code
    test("GET /",function(){
		it("return status code 200", function(done){
			request.get( HOSTIP ,function(err, response, body){
				expect(response.statusCode).toBe(200);
				done();

			})
		});
	})
});
