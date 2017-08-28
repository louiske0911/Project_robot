$(document).ready(function() {
	$("div.url").find("input").focusin(clearMsg);
	$("div.url").find("input").focusout(checkIsUrl);

	$("div.path").find("input").focusin(clearMsg);
	$("div.path").find("input").focusout(checkIsPath);

	$("div.email").find("input").focusin(clearMsg);
	$("div.email").find("input").focusout(checkIsEmail);

	$("div.checknotempty").find("input").focusin(clearMsg);
	$("div.checknotempty").find("input").focusout(checkIsNotEmpty);

	$("div.groupCheck").focusin(clearGroupMsg);
	$("div.checkExclusive").on('input keydown', setExclusiveOrNot);
	$("div.groupCheck").focusout(checkGroupNotEmpty);
});

/*
 * check all the fields is well inputted 
 * @returns {bool} If all the fields is well inputted, it will return true. If not, it will return false.
 */
function boolCheckAll(){
	var success = true;
	$("div.url").find("input").each(function(index,input){
		if(!checkIsUrl(input))
			success = false;
	});
	$("div.email").find("input").each(function(index,input){
		if(!checkIsEmail(input))
			success = false;
	});
	$("div.path").find("input").each(function(index,input){
		if(!checkIsPath(input))
			success = false;
	});
	$("div.checknotempty:not('.inactive')").find("input").each(function(index,input){
		if(!checkIsNotEmpty(input))
			success = false;
	});
	if(!groupCheck()){
		success = false;
	}
	return success;
}

function clearMsg(){
	$(this).siblings("ul").text('');
}

function clearGroupMsg(){
	$("div.string.groupCheck").each(function(index, string){
		if($(string).data("groupcheck") == $(this).data('groupcheck')){
			$(string).find("input").siblings("ul").text('');
		}
	});
}

function checkIsNotEmpty(input){
	var value = $(input).val();
	if(value == ''){
		$(input).siblings("ul").text('This can not be empty.');
		return false;
	}
	return true;
}

function checkIsPath(input){
	var value = $(input).val();
	if (value != '' && !isPath(value)){
		$(input).siblings("ul").text('This is not a path.');
		return false;
	}
	return true;
}

function checkIsUrl(input){
	var value = $(input).val();
	if (value != '' && !isURL(value)){
		$(input).siblings("ul").text('This is not an URL.');
		return false;
	}
	return true;
}

function checkIsEmail(input){
	var value = $(input).val();
	if (value != '' && !isEmail(value)){
		$(input).siblings("ul").text('This is not an email address.');
		return false;
	}
	return true;
}
/*
 * It checks there is at least one nonempty field in each group.
 */
function groupCheck(){
	var groupCollection = {}; // { group_id => [dom objects of member fields] }
	var pending = $("div.string.groupCheck:not('.inactive')");

	// set up groupCollection
	pending.each(function(index, string){
		var groupID = $(string).data('groupcheck');
		if(groupCollection.hasOwnProperty(groupID)){
			groupCollection[groupID].push($(string).find("input"));
		}else{
			groupCollection[groupID] = [$(string).find("input")];
		}
	});

	// check each group is well inputted
	var allpass = true;
	for(var groupID in groupCollection){
		if(groupCollection.hasOwnProperty(groupID)){
			var empty = true;
			// check group member fields
			for(var i in groupCollection[groupID]){
				if(groupCollection[groupID][i][0].value != ""){
					empty = false;
					break;
				}
			}
			if(empty){
				allpass = false;
			}
			// reset warning messages
			for(var i in groupCollection[groupID]){
				if(empty){
					groupCollection[groupID][i].siblings("ul").text('You have to choose one to fill in.');
				}else{
					groupCollection[groupID][i].siblings("ul").text('');
				}
			}
		}
	}
	return allpass;
}
/*
 * check a dom object if its group is well inputted or not 
 */
function checkGroupNotEmpty(){
	var groupID = $(this).data('groupcheck');
	var empty = true;
	$("div.string.groupCheck").each(function(index, string){
		if($(string).data('groupcheck') == groupID && $(string).find("input")[0].value != ""){
			empty = false;
		}
	});
	if(empty){
		$("div.string.groupCheck").each(function(index, string){
			if($(string).data('groupcheck') == groupID){
				$(string).find("input").siblings("ul").text('You have to choose one to fill in.');
			}
		});
	}
}
/*
 * If the field user is typing something in is empty, enabled all the dom objects with the same exclusive id.
 * If it isn't empty, disabled all the dom objects with the same exclusive id except the filled one.
 */
function setExclusiveOrNot(){
	var currentdiv = this;
	var checkExclusiveID = $(this).data('checkexclusive');
	var empty = $(this).find("input")[0].value == "";
	$("div.checkExclusive").each(function(index, div){
		if($(div).hasClass('checkExclusive') && $(div).data('checkexclusive') == checkExclusiveID && div != currentdiv){
			if(empty){
				$(div).find("input").prop('disabled', false);
			}else{
				$(div).find("input").prop('disabled', true);
			}
		}
	});
}
/*
 * Disable all the dom objects with the same exclusive id if there is any one filled except the one filled.
 * This function is designed for edit phase, it will be called after loading data from database. 
 */
function setInitialDisabledOrNot(){
	var groupCollection = {};
	var pending = $("div.checkExclusive");
	pending.each(function(index, div){
		if(groupCollection.hasOwnProperty($(div).data('checkexclusive'))){
			groupCollection[$(div).data('checkexclusive')].push($(div));
		}else{
			groupCollection[$(div).data('checkexclusive')] = [$(div)];
		}
	});
	for(var group in groupCollection){
		var empty = true;
		var notemptydiv = null;
		if(groupCollection.hasOwnProperty(group)){
			for(var i in groupCollection[group]){
				if(groupCollection[group][i].find("input")[0].value != ""){
					empty = false;
					notemptydiv = groupCollection[group][i];
				}
			}
		}
		if(!empty){
			for(var i in groupCollection[group]){
				if(groupCollection[group][i] != notemptydiv){
					groupCollection[group][i].find("input").prop('disabled', true);
				}
			}
		}
	}
}

function isURL(str_url) {
	//URL pattern based on rfc1738 and rfc3986
	var rg_pctEncoded = "%[0-9a-fA-F]{2}";
	var rg_protocol = "(http|https):\\/\\/";

	var rg_userinfo = "([a-zA-Z0-9$\\-_.+!*'(),;:&=]|" + rg_pctEncoded + ")+" + "@";

	var rg_decOctet = "(25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])"; // 0-255
	var rg_ipv4address = "(" + rg_decOctet + "(\\." + rg_decOctet + "){3}" + ")";
	var rg_hostname = "([a-zA-Z0-9\\-\\u00C0-\\u017F]+\\.)+([a-zA-Z]{2,})";
	var rg_port = "[0-9]+";

	var rg_hostport = "(" + rg_ipv4address + "|localhost|" + rg_hostname + ")(:" + rg_port + ")?";

	// chars sets
	// safe           = "$" | "-" | "_" | "." | "+"
	// extra          = "!" | "*" | "'" | "(" | ")" | ","
	// hsegment       = *[ alpha | digit | safe | extra | ";" | ":" | "@" | "&" | "=" | escape ]
	var rg_pchar = "a-zA-Z0-9$\\-_.+!*'(),;:@&=";
	var rg_segment = "([" + rg_pchar + "]|" + rg_pctEncoded + ")*";

	var rg_path = rg_segment + "(\\/" + rg_segment + ")*";
	var rg_query = "\\?" + "([" + rg_pchar + "/?]|" + rg_pctEncoded + ")*";
	var rg_fragment = "\\#" + "([" + rg_pchar + "/?]|" + rg_pctEncoded + ")*";

	var rgHttpUrl = new RegExp(
		"^" + rg_protocol + "(" + rg_userinfo + ")?" + rg_hostport + "(\\/" + "(" + rg_path + ")?" + "(" + rg_query + ")?" + "(" + rg_fragment + ")?" + ")?" + "$"
	);

	// export public function
	if (rgHttpUrl.test(str_url)) {
		return true;
	} else {
		return false;
	}
}

function isPath(str_path) {
	return true;
}

function isEmail(str_email) {
	reg = /^[^\s]+@[^\s]+\.[^\s]{2,3}$/;
	if (reg.test(str_email)) {
		return true;
	} else {
		return false;
	}
}
