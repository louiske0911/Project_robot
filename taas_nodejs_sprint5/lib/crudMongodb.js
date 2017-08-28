/**
 * 2016/05/05(Kristen)
 * @fileoverview CRUD mongodb
 */
var mongoose = require('mongoose');
//var DashboardLayout = mongoose.model('DashboardLayout');
//var DashboardTab = mongoose.model('DashboardTab');

/**
 * @constructor
 */
function crudMongo() {
}


/**
 * new collection object
 * @param  {String} strModelName
 * @return {Object} mongoose
 */
var collectionMab =  function(strModelName){
	return  mongoose.model(strModelName);
};

/**
 * callback
 * @param  {String} value
 * @return {String} return param
 */
var callback = function(value){
	return value;
};

/**
 * CRUD :　update
 * @param  {Object} jsonCondition json object ex: {key1:value2,keyxx:valuexx}
 * @param  {Object} jsonUpData json object
 * @param  {String} strModel
 * @param  {Function} callback
 * @return {Function} callback
 */
crudMongo.update = function(jsonCondition, jsonUpData, strModel, callback ){
	/*console.log("update : ")
	console.log(jsonCondition)
	console.log(jsonUpData)
	console.log(strModel)*/
	collectionMab(strModel).collection.findAndModify(
	jsonCondition, // query
	[], {
		$set: jsonUpData
	}, 
	{}, // options
		function(err, object) {
		if (err) {
			//console.warn(err.message); // returns error if no matching object found
			 return callback(false);
		} else {
			//console.log("ok")
			//console.dir(object);
			 return callback(true);
			
		}
	});

};

/*
* @parm {key1:value2,keyxx:valuexx}
* @parm {key1:value2,keyxx:valuexx}
* @parm str
*/
/*
exec.updateByOne = function(jsonCondiOne, jsonUpData, strModel ){

	collectionMab(strModel).collection.findAndModify(
	jsonCondition, // query
	[], {
		$set: jsonUpData
	}, 
	{}, // options
		function(err, object) {
		if (err) {
			//console.warn(err.message); // returns error if no matching object found
			return false;
		} else {
			return true;
			//console.dir(object);
		}
	});

}*/

/**
 * CRUD :Read
 * @param  {Object} jsonCondiOne
 * @param  {String} strModel
 * @param  {Function} callback
 * @return {Function}
 */
crudMongo.findByOne = function(jsonCondiOne, strModel, callback){
	collectionMab(strModel).findOne(jsonCondiOne, function(err, jsonRes) {
		//console.log(err)
	    if(!err) {
	         if(jsonRes != null) {
	            return callback(jsonRes);
	        }else{
	        	return callback(false);
	        	//res.end(JSON.stringify(jsonRes));
	        }
	        

	    }
	});

};

/**
 * CRUD :Read by multiple condition
 * @param  {Object} jsonCondition
 * @param  {String} strModel
 * @param  {Function} callback
 * @return {Function}
 */
crudMongo.findByMulti = function(jsonCondition, strModel, callback ){
	collectionMab(strModel).
	find(jsonCondition).
	exec(function(err, jsonRes) {
		//console.log("--------jsonRes"+jsonRes)
		if(!err) {
		    if(jsonRes != null) {
		    	 return callback(jsonRes);
		        
		    }else{
		    	return callback(false);
				//res.end(JSON.stringify(jsonRes));
			}
		
		}
	});
	

};

/**
 * CRUD : Create / Insert
 * @param  {Object} jsonSaveData
 * @param  {String} strModel
 * @param  {Function} callback
 * @return {Function}
 */
crudMongo.save = function(jsonSaveData, strModel, callback){

	var collection = new collectionMab(strModel)(jsonSaveData);

	collection.save(function(err) {
		if (err) {
			return callback(false);
		} else {
			return callback(true);
		}
	});

};

/**
 * CRUD : Create / Insert After Checking record value
 * @param  {Object} jsonFindData
 * @param  {Object} jsonSaveData
 * @param  {String} strModel
 * @param  {Function} callback
 * @return {Function}
 */
crudMongo.saveAvoidRepeat = function(jsonFindData, jsonSaveData, strModel, callback){
	var model = collectionMab(strModel);
	model.
	find(jsonFindData).
	exec(function(err, jsonRes) {
		if(jsonRes == null || jsonRes == ""){
			new model(jsonSaveData).save(function(err) {
				if (err) {
					return callback(false);
				}else
					return callback(true);
			});
		}else{
			return callback(false);
		}
		
	});

};

/**
 * CRUD : Delete 
 * @param  {Object} jsonCondition
 * @param  {String} strModel
 * @param  {Function} callback
 * @return {Function}
 */
crudMongo.delete = function(jsonCondition, strModel, callback){

	collectionMab(strModel).find(jsonCondition, function(err, jsonRes) {
		    if(!err) {
		    		
		        if(!jsonRes) {
		        	console.log("no remove"+ jsonRes);
		        	return callback(true);
		        }else{
		        	console.log("ok remove"+ jsonRes);
		        	return callback(false);
		        }
		    }
		   // console.log("w"+ jsonRes)
		}).remove().exec();

};

exports.crudMongo = crudMongo;