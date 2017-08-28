/**
 * Return the components' html code.
 * @param {String} formHTML
 * the initial html code. (or the prefix of the result code)
 * @param {Object} jobDescript
 * the descriptor object
 * @returns {Object} the components' html code
 */
function formMaker(formHTML, jobDescript) {
	jobDescript.forEach(function(element) {
		switch (element.type) {
			case DESCRIPTOR_TYPE.NUMBER:
				formHTML += formInputDiv('number', element);
				break;
			case DESCRIPTOR_TYPE.DECIMAL:
				formHTML += formInputDiv('decimal', element);
				break;
			case DESCRIPTOR_TYPE.STRING:
				formHTML += formInputDiv('string', element);
				break;
			case DESCRIPTOR_TYPE.PASSWORD:
				formHTML += formInputDiv('password', element);
				break;
			case DESCRIPTOR_TYPE.OPTION:
				formHTML += formInputDiv('option', element);
				break;
			case DESCRIPTOR_TYPE.URL:
				formHTML += formInputDiv('url', element);
				break;
			case DESCRIPTOR_TYPE.PATH:
				formHTML += formInputDiv('path', element);
				break;
			case DESCRIPTOR_TYPE.EMAIL:
				formHTML += formInputDiv('email', element);
				break;
			case DESCRIPTOR_TYPE.PARENTDIV:
				formHTML += formInputDiv('parentdiv',element);
				break;
			default: // other
				; // do nothing
		}
	});
	return formHTML;
}

/**
 * Give the component type and return the component's html code.
 * @param {String} type
 * The type of component which you want to create.
 * If the type is 'taskName', the 'element' parameter could not need.
 * @param {Object/String} element
 * The descriptor object. If the type is 'uneditableTaskName', it will be the value in text bar.
 * @returns {Object} the component's html code
 */
function formInputDiv(type, element) {
	switch (type) {
		case 'taskName':
			return '<div class="taskName">' +
				'<div class="form-group" id="taskNameDiv">' +
				'<label class="col-lg-3 control-label">Task Name:</label>' +
				'<div class="col-lg-9">' +
				'<input type="text" class="form-control" id="taskName" name="taskName"/>' +
				'<ul id="taskNameMsg" text="" style="color:red;"> </ul>' +
				'</div>' +
				'</div>' +
				'</div>';
		case 'uneditableTaskName':
			return '<div class="taskName">' +
				'<div class="form-group" id="taskNameDiv">' +
				'<label class="col-lg-3 control-label">Task Name:</label>' +
				'<div class="col-lg-9">' +
				'<input type="text" class="form-control" id="taskName" name="taskName" value="' + element + 
				'" readonly/>' + '<ul id="taskNameMsg" text="" style="color:red;"> </ul>' +
				'</div>' +
				'</div>' +
				'</div>';
		case 'number':
			return '<div class="number">' +
				'<div class="form-group" id="' + element.name + 'Div">' +
				labelMaker(element) +
				'<div class="col-lg-9">' +
				'<input type="text" class="form-control" id="' + element.name + '" name="' + element.name + 
				'" onkeypress="return event.charCode >= 48 && event.charCode <= 57"/>' +
				'<ul id="' + element.name + 'Msg" text="" style="color:red;"> </ul>' +
				'</div>' +
				'</div>' +
				'</div>';
		case 'decimal':
			return '<div class="decimal">' +
				'<div class="form-group" id="' + element.name + 'Div">' +
				labelMaker(element) +
				'<div class="col-lg-9">' +
				'<input type="text" class="form-control" id="' + element.name + '" name="' + element.name + 
				'" onkeypress="return (event.charCode >= 48 && event.charCode <= 57) || (event.charCode == 46)"/>' +
				'<ul id="' + element.name + 'Msg" text="" style="color:red;"> </ul>' +
				'</div>' +
				'</div>' +
				'</div>';
		case 'string':
			if (element.longText)
				return '<div class="string'+ (element.required?' checknotempty ':'') +
					(element.inactive?' inactive':'') + (element.groupCheck?' groupCheck ':'') + (element.checkExclusive?' checkExclusive ':'') +
					'" '+  (element.groupCheck?' data-groupCheck="'+element.groupCheck+'"':'') + ' ' +
					(element.checkExclusive?' data-checkexclusive="'+element.checkExclusive+'"':'') +'>' +
					'<div class="form-group" id="' + element.name + 'Div">' +
					labelMaker(element) +
					'<div class="col-lg-9">' +
					'<textarea class="form-control" id="' + element.name + '" name="' + element.name + '"/>' +
					'<ul id="' + element.name + 'Msg" text="" style="color:red;"> </ul>' +
					'</div>' +
					'</div>' +
					'</div>';
			else
				return '<div class="string'+ (element.required?' checknotempty ':'') +
					(element.inactive?' inactive':'') + (element.groupCheck?' groupCheck ':'') + (element.checkExclusive?' checkExclusive ':'') +
					'"  '+  (element.groupCheck?' data-groupCheck="'+element.groupCheck+'"':'') + ' ' +
					(element.checkExclusive?' data-checkexclusive="'+element.checkExclusive+'"':'') +'>' +
					'<div class="form-group" id="' + element.name + 'Div">' +
					labelMaker(element) +
					'<div class="col-lg-9">' +
					'<input type="text" class="form-control" id="' + element.name + '" name="' + element.name + '" '+ (element.disabled?'disabled':'') +'/>' +
					'<ul id="' + element.name + 'Msg" text="" style="color:red;"> </ul>' +
					'</div>' +
					'</div>' +
					'</div>';
		case 'password':
			return '<div class="password">' +
				'<div class="form-group" id="' + element.name + 'Div">' +
				labelMaker(element) +
				'<div class="col-lg-9">' +
				'<input type="password" class="form-control" id="' + element.name + '" name="' + element.name + '"/>' +
				'<ul id="' + element.name + 'Msg" text="" style="color:red;"> </ul>' +
				'</div>' +
				'</div>' +
				'</div>';
		case 'option':
			if (element.multiple == true) { // multiple answer
				return '<div class="option">' +
					'<div class="form-group">' +
					labelMaker(element) +
					'<div class="col-lg-9">' +
					'<div class="row">' +
					checkboxMaker(element, 4) +
					'</div>' +
					'<ul id="' + element.name + 'Msg" text="" style="color:red;"> </ul>' +
					'</div>' +
					'</div>' +
					'</div>';
			} else { // single answer
				return '<div class="option '+ (element.childs? 'selectchild':'') +'">' +
					'<div class="form-group">' +
					labelMaker(element) +
					'<fieldset>' +
					'<div class="col-lg-'+
					(element.columnlLength? element.columnlLength:'4')+
					'">' +
					selectMaker(element) +
					'</div>' +
					'</fieldset>' +
					'</div>' +
					'</div>' +
					(element.childs? selectChildMaker(element):'');
			}
		case 'url':
			return '<div class="url">' +
				'<div class="form-group" id="' + element.name + 'Div">' +
				labelMaker(element) +
				'<div class="col-lg-9">' +
				'<input type="text" class="form-control" id="' + element.name + '" name="' + element.name + '"/>' +
				'<ul id="' + element.name + 'Msg" text="" style="color:red;"> </ul>' +
				'</div>' +
				'</div>' +
				'</div>';
		case 'path':
			return '<div class="path'+ (element.required?' checknotempty ':'') +'">' +
				'<div class="form-group" id="' + element.name + 'Div">' +
				labelMaker(element) +
				'<div class="col-lg-9">' +
				'<input type="text" class="form-control" id="' + element.name + '" name="' + element.name + '"/>' +
				'<ul id="' + element.name + 'Msg" text="" style="color:red;"> </ul>' +
				'</div>' +
				'</div>' +
				'</div>';
		case 'email':
			return '<div class="email">' +
				'<div class="form-group" id="' + element.name + 'Div">' +
				labelMaker(element) +
				'<div class="col-lg-9">' +
				'<input type="text" class="form-control" id="' + element.name + '" name="' + element.name + '"/>' +
				'<ul id="' + element.name + 'Msg" text="" style="color:red;"> </ul>' +
				'</div>' +
				'</div>' +
				'</div>';
		case 'parentdiv':
			var returnHTML = "";
			if(element.visibility){
				returnHTML += '<div id="'+ element.name +'">';
			}else{
				returnHTML += '<div id="'+ element.name +'" style="display:none">';
			}
			returnHTML = formMaker(returnHTML,element.childs);
			returnHTML += '</div>';
			return returnHTML;
	}
}

function labelMaker(element) {
	return '<label class="col-lg-3 control-label" title="' + element.displayHint + '">' + (element.required?'<span style="color: red;">* </span>':'') + (element.groupCheck?'<span style="color: red;font-size:12px;position:relative;top:-5px;left:-2px">&#9662; </span>':'') + element.displayName + ':</label>';
}

function checkboxMaker(element, column_width) {
	var checkboxHTML = '';
	element.options.forEach(function(opt) {
		checkboxHTML += '<div class="col-lg-'+column_width.toString()+'">' +
			'<div class="checkbox">' +
			'<label>' +
			'<input type="checkbox" id="' + opt.name + '" name="' + opt.name + '" class="' + element.name + '" value="' + opt.value + '">' + opt.displayName +
			'</label>' +
			'</div>' +
			'</div>';
	});
	return checkboxHTML;
}

function selectMaker(element) {
	var selectHTML = '<select class="form-control" name="' + element.name + '" id ="' + element.name + '" >';
	element.options.forEach(function(opt) {
		selectHTML += '<option name="' + element.name + '" value="' + opt.value + '">' + opt.displayName + '</option>';
	});
	selectHTML += '</select>';
	return selectHTML;
}
function selectChildMaker(element){
	var childHTML = '<div id="'+element.name+'Childs">';
	for(var i in element.childs){
		childHTML += '<div style="display:none">';
		element.childs[i].forEach(function(e){
			e.inactive = true;
			e.disabled = true;
		});
		console.log(element.childs[i]);
		childHTML = formMaker(childHTML, element.childs[i]);
		childHTML += "</div>";
	}
	childHTML += "</div>"
	return childHTML;
}
function selectChildSetting(){
	$.each($(".option.selectchild").find("select"), function(index, option){
		$(option).change(selectChildChanged);
		console.log(option);
		selectChildChanged.call(option);
	});
}
function selectChildChanged(){
	var option = this;
	var selectedIndex = this.selectedIndex;
	var id = this.id;
	var childid = id + 'Childs';
	var childs = $("#"+childid).children();
	$.each(childs, function(index, child){
		if(index != selectedIndex && $(child).hasClass("active")){
			$(child).removeClass("active");
			$(child).css("display", "none");
			$.each($(child).children(), function(index, string){
				$(string).addClass("inactive");
				$(string).find("input").attr('disabled','disabled');
			});
		}
	});
	var selectedChild = childs[selectedIndex];
	if(!$(selectedChild).hasClass("active")){
		$(selectedChild).addClass("active");
		$(selectedChild).css("display", "block");
		$.each($(selectedChild).children(), function(index, string){
			$(string).removeClass("inactive");
			$(string).find("input").removeAttr('disabled');
			$(string).find("ul").html("");
		});
	}
}
function setSelectChildsValue(testscript){
	console.log(testscript);
	$.each($(".option.selectchild").find("select"), function(index, option){
		var childid = option.id + 'Childs';
		console.log(option.selectedIndex);
		var selectedIndex = option.selectedIndex;
		var currentChilds = $($("#" + childid).children()[selectedIndex]).children();
		$.each(currentChilds, function(index, child){
			$(child).find("input").val(testscript[$(child).find("input")[0].id]);
		});
	});
}
