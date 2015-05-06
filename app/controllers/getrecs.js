var args = arguments[0] || {};
var console = require('stuff');

console.writeToConsole($.console,'Show all records in the \'events\' table');	

function liveAction(){
	// load the library
	var DBH=require('com.alcoapps.dbhelper');

	// get an instance of this database
	var db=new DBH.dbhelper('/alco.sqlite','alco');

	console.writeToConsole($.console,'::::::: START');	

	// get records into variable
	var myTable=db.get({
		fields 	: '*',
		table 	: 'events',
		order 	: 'id DESC'
	});

	console.writeToConsole($.console,JSON.stringify(myTable,null,4));	

	console.writeToConsole($.console,'::::::: END');	
}