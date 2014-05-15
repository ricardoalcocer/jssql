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

dbhelper.prototype.set=function(obj){
	/**
	* Performs an SQL INSERT
	* @method set
	* @param {obj} object Object with the properties: table and data, which is a dictionary of field_name=value
	*/
	var keys=Object.keys(obj.data);
	var vals='';
	keys.forEach(function(item){
		switch(typeof obj.data[item]){
			case "string":
				vals+='"' + obj.data[item] + '"' + ','
				break;
			case "number":
				vals+=obj.data[item] + ','
				break;
		}
	})
	vals=vals.substr(0,vals.length-1);
	
	var sql = "INSERT INTO " + obj.table + " (" + keys.toString() + ") VALUES (" + vals + ")" ;
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
	
	//console.log(sql);
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
	var sets='';
	keys.forEach(function(item){
		switch(typeof obj.data[item]){
			case "string":
				sets += item + ' = "' + obj.data[item] + '",';
				break;
			case "number":
				sets += item + ' = ' + obj.data[item] + ',';
				break;
		}
	})
	sets=sets.substr(0,sets.length-1);
	sql+=sets + ' WHERE ' + obj.where;
	console.log(sql);
	this.db.execute(sql);
	return this.db.rowsAffected;
}

dbhelper.prototype.close=function(dbname){
	/**
	* Closes the database
	* @method close
	*/
	this.db.close();
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