/**
* this is the main index.js file
* @class Index
*/

/**
* This is the doClick Method
* @method doClick
* 
*/
function doClick(e) {
    alert($.label.text);
}

var DBH=require('com.alcoapps.dbhelper');
var db=new DBH.dbhelper('/alco.sqlite','alco');
	
	var theJSON='[{"name":"Ricardo Alcocer","uid":"ralcocer","pwd":"mypass"},{"name":"Jack Bauer","uid":"jack","pwd":"thecat"}]';

	if(db.tableExists('myTable')){
		db.drop('myTable');
	}
	db.createFromJSON(theJSON,'myTable');		

	// get records into variable
	var myTable=db.get({
		fields 	: '*',
		table 	: 'events',
		where 	: 'country like "U%"',
		order 	: 'id DESC'
	});
	console.log(myTable);

	// add record
	var rowId=db.set({
		table: 'events',
		data : {
			country 	: 'Puerto Rico',
			name 		: 'TiConf PR'
		}
	});
	console.log('Inserted: ' + rowId);

	// get records with callback
	db.get({
		fields 	: '*',
		table 	: 'events',
		//where 	: 'country="US"',
		//order 	: 'id DESC'
	},function(evt){
		console.log(evt);
	});

	// edit record
	var rowsAffected=db.edit({
		table 	: 'events',
		data 	:{
			name : 'xTiConf NY',
			country : 'PR'
		},
		where 	: 'id = 1'
	});

	// delete record(s)
	var rowsAffected=db.delete({
		table 	: "events",
		where 	: 'name="xTiConf PR"'
	});

	db.close();

//var reporter=require('com.alcoapps.reportdeviceinfo');
//console.log(reporter.report());

$.index.open();
