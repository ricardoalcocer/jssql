var args = arguments[0] || {};
var console = require('stuff');

function liveAction(){
	// load the library
	var DBH=require('com.alcoapps.dbhelper');

	// get an instance of this database
	var db=new DBH.dbhelper('/alco.sqlite','alco');

	console.writeToConsole($.console,'::::::: START');	
	console.writeToConsole($.console,'JSON to use:');

	// set JSON for new table
	var theJSON='[{"name":"Ricardo Alcocer","uid":"ralcocer","pwd":"mypass"},{"name":"Jack Bauer","uid":"jack","pwd":"thecat"}]';
	
	console.writeToConsole($.console,JSON.stringify(JSON.parse(theJSON), null, 4));

	// check if this table exists
	if(db.tableExists('myTable')){
		console.writeToConsole($.console,'Table already exists so let\'s drop ');
	
		// if it does, drop it
		db.drop('myTable');
	}

	// create a new table based on this JSON string
	db.createFromJSON(theJSON,'myTable');			


	console.writeToConsole($.console,'Created new table named \'mytable\' ');
	console.writeToConsole($.console,'::::::: END');	
}
