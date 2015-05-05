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
	
### SQL SELECT with JOIN
Returns JSON.

	db.get({
	    joiner : 'e'
        fields 	: 'e.*',
        table 	: 'events e, parties p',
        where 	: 'e.country="US" AND p.event_id=e.id',
        order 	: 'eid DESC'
    },function(evt){
        console.log(evt);
    });
    
## SQL LAST ID
Returns the Id of the last inserted row.

	db.getLastId({
		table: 'events'
	},function(evt){
         console.log(evt);
    });
    	
## SQL LAST ID
Returns the last inserted row object.

    db.getLastEntry({
        table: 'events'
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

	var rowsAffected=db.update({
		table 	: 'events',
		data 	:{
			name : 'xTiConf NY',
			country : 'PR'
		},
		where 	: 'id = 1'
	});
	
or
	
	var rowsAffected=db.update({
    		table 	: 'events',
    		data 	:{
    			name : 'xTiConf NY',
    			country : 'PR'
    		},
    		id: 1
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

	db.getImage({
		field: 'image',
		table: 'myimages',
		where: 'id=1'
	},function(img){
		win.backgroundImage=img;
	});

## GET ENTRY
Used when you only want to get a single value from a database record

	var userEmail=db.getEntry({
		table: 	'users',
		id: 	'5'
		field: 	'email'
	});
	
or

	db.getEntry({
		table: 	'users',
		id: 	'5'
		field: 	'email'
	},function(value){
		console.log(value);
	});
	
## COUNT ROWS
Returns the amount of rows returned by a give query

	var totalActiveUsers=db.countRows({
		table: 	'users',
		where:	'active=true'
	});
	
or

	db.countRows({
		table: 	'users',
		where:	'active=true'
	},function(value){
		console.log(value);
	});
	
or with join

	db.countRows({
	    joiner: 'u',
		table: 	'users u, images i',
		where:	'u.active=true AND u.id = i.image_id'
	},function(value){
		console.log(value);
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
	
## Contributors

* [Ricardo Alcocer](https://github.com/ricardoalcocer) - Creator and maintainer
* [Sebastian Klaus](https://github.com/caspahouzer)
* [Rick Blalock](https://github.com/rblalock)
	
# License
MIT - [http://alco.mit-license.org](http://alco.mit-license.org)