# JSSQL

With this library you'll be able to use SQLite databases in your Titanium apps using a JavaScript interface.  I personally feel comfortable with SQL Syntax, but prefer to use this library because makes the code more readable.


This is not a replacement for [Alloy Models](http://docs.appcelerator.com/titanium/3.0/#!/guide/Alloy_Models).

If you're looking for a full-blown ORM for Titanium you might want to check out [Joli.js](https://github.com/xavierlacot).

# Usage

	// require the module
	var DBH=require('com.alcoapps.dbhelper');

	// create an instance with your local db
	var db=new DBH.dbhelper('/alco.sqlite','alco');
	
## SQL SELECT
Returns a JSON object with the full result set.

### Option 1
Returns JSON.

	var myTable=db.get({
		fields 	: '*',
		table 	: 'events',
		where 	: 'country like "U%"',
		order 	: 'id DESC'
	});
	
### Option 2
Send a callback function .

	db.get({
		fields 	: '*',
		table 	: 'events',
		where 	: 'country="US"',
		order 	: 'id DESC'
	},function(evt){
		console.log(evt);
	});
	
## SQL INSERT
Returns the Id of the last inserted row.

	var rowId=db.set({
		table: 'events',
		data : {
			country 	: 'Puerto Rico',
			name 		: 'TiConf PR'
		}
	});
	
## SQL UPDATE
Returns the amount of rows affected by the edit.

	var rowsAffected=db.edit({
		table 	: 'events',
		data 	:{
			name : 'xTiConf NY',
			country : 'PR'
		},
		where 	: 'id = 1'
	});
	
## SQL DELETE
Returns the amount of rows affected by the delete.

	var rowsAffected=db.delete({
		table 	: "events",
		where 	: 'name="xTiConf PR"'
	});

## EXEC
Takes an SQL String and returns a JSON object with the result set

	var myTable=db.exec('SELECT * FROM events where id > 5');
	
## GET IMAGE FROM BLOB
Returns an image from a Blob column.  In this example, assuming you have a column named 'images' inside a table named 'myimages', grab the image with ID=1

	var img=db.getImage({
		field: 'image',
		table: 'myimages',
		where: 'id=1'
	});
	win.backgroundImage=img;

or

	var img=db.getImage({
		field: 'image',
		table: 'myimages',
		where: 'id=1'
	},function(img){
		win.backgroundImage=img;
	});


## CREATE FROM JSON
Takes a flat JSON string and creates a table.  Good for times when you get data from a Web Service and then need to search or manipulate the data in any way.

	db.createFromJSON(jsonString,'mytable');

## DROP
Deletes a table

	db.drop('myTable');

## TABLE EXISTS
Checks if a given table exists.

	var exists=db.tableExists('myTable');

## CLOSE
Closes the database connection

	db.close();
	
	
# License
MIT - [http://alco.mit-license.org](http://alco.mit-license.org)