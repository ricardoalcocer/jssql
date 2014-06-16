/**
* ## JavaScript wrapper around Ti.Database API
*
* DBHelper provides a Javascript-friendly interface to your local SQLite databases.  If you're not 
* familiar with SQL Syntax, or simply want to keep your code as clean as possible (why wouldn't you?), 
* this library will provide you with a clean interface to your SQLite databases.
*
* @class dbhelper
*/
function dbhelper(dbpath,dbname){
	/**
	* Creates an instance of the database class pointing to your local SQLite database
	* @constructor
	* @param {String} path Path to database to use
	* @param {String} name Name to give to your database
	*/
	this.db = Ti.Database.install(dbpath,dbname);
}

dbhelper.prototype.exec=function(sql){
	/**
	* Execute an SQL Statement against the database. 
	* @method exec
	* @param {String} sql SQL statement to run
	*/
	var rows 	= this.db.execute(sql);
	return rows2json(this.db.execute(sql));
}

dbhelper.prototype.get=function(obj,callback){
	/**
	Performs an SQL SELECT
	*
	db.get({
		fields: 'id',
		table: 'users',
		where: 'email="some@email.com"',
	 	order: 'id ASC'
	},function(data){
	 	console.log(data);
	})
	*
	@method get
	@param {Object} obj Object with the properties: fields, table, where and order
	@param {Function} callback Callback function to execute when the SELECT has completed.  
	@return {Object} JSON object
	*/
	var sql 	= "SELECT " + obj.fields + " FROM " + obj.table;
	if (obj.where){
		sql += ' WHERE ' + obj.where
	}
	if (obj.order){
		sql += ' ORDER BY ' + obj.order
	}
	if (callback){
		callback(rows2json(this.db.execute(sql)));
	}else{
		return rows2json(this.db.execute(sql));
	}
}

dbhelper.prototype.getImage=function(obj,callback){
	/**
	* Returns an image from a Blob field
	* @method getImage
	@param {Object} obj Object with the properties: field, table and where
	@param {Function} callback Callback function to execute when the SELECT has completed.  
	@return {Image} Image object
	*/
	var sql 	= "SELECT " + obj.field + " FROM " + obj.table;
	var rs=this.db.execute(sql);
	var img=rs.fieldByName(obj.field)
	rs.close();
	if (callback){
		callback(img);
	}else{
		return img;
	}
}

dbhelper.prototype.set=function(obj){
	/**
	* Performs an SQL INSERT
	* @method set
	* @param {obj} object Object with the properties: table and data, which is a dictionary of field_name=value
	*/
	var keys=Object.keys(obj.data);
	var vals=[];
	keys.forEach(function(item){
		switch(typeof obj.data[item]){
			case "string":
				vals.push('"' + obj.data[item] + '"');
				break;
			case "number":
				vals.push(obj.data[item]);
				break;
		}
	})
	
	var sql = "INSERT INTO " + obj.table + " (" + keys.toString() + ") VALUES (" + vals.toString() + ")" ;
	try{
		this.db.execute(sql);
		return this.db.lastInsertRowId;
	}catch(e){
		console.log('err');
	}
}

dbhelper.prototype.delete=function(obj){
	/**
	* Performs an SQL DELETE
	* @method delete
	* @param {Object} obj Object with the properties: table and where
	* @return {Number} Amount of affected rows 
	*/
	if (obj.where){
		var sql 	= "DELETE FROM " + obj.table + " WHERE " + obj.where;	
	}else{
		var sql 	= "DELETE FROM " + obj.table;
	}
	
	this.db.execute(sql);
	return this.db.rowsAffected;
}

dbhelper.prototype.edit=function(obj){
	/**
	* Performs an SQL UPDATE
	* @method edit
	* @param {Object} obj Object with the properties: table, where and data, which is a dictionary of field_name=value
	* @return {Number} Amount of affected rows 
	*/
	var sql="UPDATE " + obj.table + " SET ";
	var keys=Object.keys(obj.data);
	var sets=[];
	keys.forEach(function(item){
		switch(typeof obj.data[item]){
			case "string":
				sets.push(item + ' = "' + obj.data[item] + '"');
				break;
			case "number":
				sets.push(item + ' = ' + obj.data[item]);
				break;
		}
	})
	sql+=sets.toString() + ' WHERE ' + obj.where;
	console.log(sql);
	this.db.execute(sql);
	return this.db.rowsAffected;
}

dbhelper.prototype.createFromJSON=function(json,tableName){
	/**
	* Takes a flat JSON string and a table name and creates a table
	* @method createFromJSON
	* @param {String} json
	* @param {String} tableName
	*/
	var _that=this;
	var fields='';
	var fieldsPure='';
	var obj=JSON.parse(json);
	var fields=[];
	var fieldsPure=[];

	var columns=Object.keys(obj[0]); // get column names
	columns.forEach(function(e){
		fields.push(e + ' TEXT');
		fieldsPure.push(e); // I'm also creating a string w/o the data-type to be used by the insert
	})
	this.db.execute('create table ' + tableName + '(' + fields.toString() + ')');

	var sql='';
	var values=[];
	obj.forEach(function(row){
		values=[];
		columns.forEach(function(cols){
			values.push('"' + row[cols] + '"');
		})
		sql = "INSERT INTO " + tableName + " (" + fieldsPure + ") VALUES (" + values.toString() + ")" ;
		_that.db.execute(sql);
	})
}

dbhelper.prototype.close=function(dbname){
	/**
	* Closes the database
	* @method close
	*/
	this.db.close();
}

dbhelper.prototype.drop=function(tablename){
	/**
	* Closes the database
	* @method close
	*/
	this.db.execute('DROP TABLE ' + tablename);
}

dbhelper.prototype.tableExists=function(tablename){
	/**
	* Checks if the given table exists in the current database
	* @method tableExists
	* @param {String} tablename
	* @return {Boolean} True or False
	*/
	var out,rs;
	rs=this.db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='" + tablename + "'");
	
	if(rs.rowCount===1){
		rs.close();
		return true
	}else{
		rs.close();
		return false
	}
}

function rows2json(rows){
	/**
	* Converts an SQLite recordset into a JSON object
	* @method rows2json
	* @param {obj} SQLiteRecordset
	* @return {obj} JSON representation of recordset
	*/
	var data 	= [];
	var fieldCount=rows.getFieldCount();

	while (rows.isValidRow()){
		var rec={};
		
		for (i=0;i<fieldCount;i++){
			rec[rows.fieldName(i)]=rows.field(i);
		}
		data.push(rec);
	    rows.next();
	};
	rows.close();
	return JSON.stringify(data);
}

exports.dbhelper=dbhelper;