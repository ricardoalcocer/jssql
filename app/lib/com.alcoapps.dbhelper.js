/**
 * ## JavaScript wrapper around Ti.Database API
 *
 * DBHelper provides a Javascript-friendly interface to your local SQLite databases.  If you're not
 * familiar with SQL Syntax, or simply want to keep your code as clean as possible (why wouldn't you?),
 * this library will provide you with a clean interface to your SQLite databases.
 *
 * @class dbhelper
 */

/**
 * Creates an instance of the database class pointing to your local SQLite database
 * @constructor
 * @param {String} dbpath Path to database to use
 * @param {String} dbname Name to give to your database
 * @param {Bool} remoteBackup Should the database on iOS be stored in iCloud
 */
function dbhelper(dbpath, dbname, remoteBackup) {

    this.dbname = dbname;
    this.db = Ti.Database.install(dbpath, dbname);
    if (Ti.Platform.getOsname() !== 'android' && (remoteBackup === true || remoteBackup === false)) {
        this.db.file.setRemoteBackup(remoteBackup);
    }
}

/**
 * Execute an SQL Statement against the database.
 * @method exec
 * @param {String} sql SQL statement to run
 */
dbhelper.prototype.exec = function (sql) {

    this.db = Ti.Database.open(this.dbname);
    this.db.execute('BEGIN');

    var result = this.getData(sql);

    this.db.execute('COMMIT');
    this.db.close();
    return result;
};

dbhelper.prototype.getData = function () {
    var result = null;
    var results =
        [];

    this.db = Ti.Database.open(this.dbname);

    try {
        var resultSet = Function.apply.call(this.db.execute, this.db, arguments);
    } catch (err) {
        console.log('There was a database error');
        console.log(err);
        return;
    }
    if (resultSet) {
        while (resultSet.isValidRow()) {
            result = {};

            var fieldCount = resultSet.fieldCount;
            for (var i = 0; i < fieldCount; i++) {
                result[resultSet.fieldName(i)] = resultSet.field(i);
            }
            results.push(result);
            resultSet.next();
        }
        resultSet.close();
    }

    return results;
};

/**
 Performs a SQL SELECT
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
dbhelper.prototype.get = function (obj, callback) {
    var fields = obj.fields || '*';
    if (obj.joiner) {
        fields = obj.fields || obj.joiner + '.*';
    }

    var sql = "SELECT " + fields + " FROM " + obj.table;

    if (obj.where) {
        sql += ' WHERE ' + obj.where
    }
    if (obj.group) {
        sql += ' GROUP BY ' + obj.group
    }
    if (obj.order) {
        sql += ' ORDER BY ' + obj.order
    }
    if (obj.limit) {
        sql += ' LIMIT ' + obj.limit
    }
    if (obj.whereIn) {
        var value = '';
        if (obj.whereIn instanceof Array) {
            if (obj.whereIn.length > 0) {
                value = '(\'' + obj.whereIn.join('\', \'') + '\')';
            }
        }
        sql += ' in ' + value;
    }

    if (callback) {
        callback(this.getData(sql));
        this.db.close();
        return;
    }

    var result = this.getData(sql);
    this.db.close();
    return result;
};

/**
 Performs a SQL SELECT for a single entry
 *
 db.get({
		field: 'id',
		table: 'users',
 },function(data){
	 	console.log(data);
	})
 *
 @method get
 @param {Object} obj Object with the properties: field and table
 @param {Function} callback Callback function to execute when the SELECT has completed.
 @return {Object} JSON object
 */
dbhelper.prototype.getEntry = function (obj, callback) {

    var sql = 'SELECT * FROM ' + obj.table + ' WHERE id=' + obj.id + ' LIMIT 1';
    if (obj.field) {
        sql = 'SELECT * FROM ' + obj.table + ' WHERE ' + obj.field + '="' + obj.id + '" LIMIT 1';
    }
    if (obj.where) {
        sql = 'SELECT * FROM ' + obj.table + ' WHERE ' + obj.where + ' LIMIT 1';
    }
    var result = this.getData(sql);
    this.db.close();

    if (callback) {
        callback(result[0]);
    } else {
        return result[0];
    }
};

/**
 * Returns an image from a Blob field
 * @method getImage
 @param {Object} obj Object with the properties: field, table and where
 @param {Function} callback Callback function to execute when the SELECT has completed.
 @return {Image} Image object
 */
dbhelper.prototype.getImage = function (obj, callback) {

    var sql = "SELECT " + obj.field + " FROM " + obj.table;
    var rs = this.getData(sql);
    var img = rs.fieldByName(obj.field)
    this.db.close();
    if (callback) {
        callback(img);
    } else {
        return img;
    }
};

/**
 * Performs a SQL INSERT
 * @method set
 * @param {obj} object Object with the properties: table and data, which is a dictionary of field_name=value
 */
dbhelper.prototype.set = function (obj) {

    var keys = Object.keys(obj.data);
    var vals = [];
    keys.forEach(function (item) {
        switch (typeof obj.data[item]) {
            case "string":
                vals.push('"' + obj.data[item] + '"');
                break;
            case "number":
                vals.push(obj.data[item]);
                break;
        }
    })

    var sql = "INSERT INTO " + obj.table + " (" + keys.toString() + ") VALUES (" + vals.toString() + ")";

    this.getData(sql);
    var lastId = this.db.getLastInsertRowId();
    this.db.close();
    return lastId;
};

dbhelper.prototype.getLastId = function (obj, callback) {
    var sql = "SELECT id FROM " + obj.table + " ORDER BY id DESC";
    var result = this.getData(sql);
    this.db.close();

    if (!result[0]) {
        return null;
    }

    if (callback) {
        callback(result[0].id);
    } else {
        return result[0].id;
    }
};

dbhelper.prototype.getLastEntry = function (obj, callback) {
    var sql = "SELECT * FROM " + obj.table + " ORDER BY id DESC";
    var result = this.getData(sql);
    this.db.close();

    if (!result[0]) {
        return null;
    }

    if (callback) {
        callback(result[0]);
    } else {
        return result[0];
    }
};

/**
 * Performs a SQL INSERT OR REPLACE
 * @method set
 * @param {obj} object Object with the properties: table and data, which is a dictionary of field_name=value
 */
dbhelper.prototype.insertOrReplace = function (obj) {

    var keys = Object.keys(obj.data);
    var values = [];
    keys.forEach(function (item) {
        switch (typeof obj.data[item]) {
            case "string":
                values.push('"' + obj.data[item] + '"');
                break;
            case "number":
                values.push(obj.data[item]);
                break;
        }
    })

    var sql = "INSERT OR REPLACE INTO " + obj.table + " (" + keys.toString() + ") VALUES (" + values.toString() + ")";

    this.getData(sql);
    var lastId = this.db.getLastInsertRowId();
    this.db.close();
    return lastId;
};

/**
 * Performs a SQL DELETE
 * @method delete
 * @param {Object} obj Object with the properties: table and where
 * @return {Bool} Deleted with success
 */
dbhelper.prototype.delete = function (obj) {

    if (obj.where) {
        var sql = "DELETE FROM " + obj.table + " WHERE " + obj.where;
    } else {
        var sql = "DELETE FROM " + obj.table;
    }

    this.getData(sql);
    var rows = this.db.rowsAffected;
    this.db.close();
    return rows;
};

/**
 * Performs a SQL COUNT
 *
 * Uses the field "id"
 * @param obj
 * @returns {Number}
 */
dbhelper.prototype.countRows = function (obj, callback) {

    var sql = 'SELECT COUNT(id) as counter FROM ' + obj.table;
    if (obj.joiner) {
        sql = 'SELECT COUNT(' + obj.joiner + '.id) as counter FROM ' + obj.table;
    }
    if (obj.where) {
        sql += ' WHERE ' + obj.where;
    }

    var result = this.getData(sql);
    this.db.close();

    if (callback) {
        callback(result[0].counter);
    } else {
        return result[0].counter;
    }
};

/**
 * Performs a SQL UPDATE
 * @method update
 * @param {Object} obj Object with the properties: table, where and data, which is a dictionary of field_name=value
 * @return {Number} Amount of affected rows
 */
dbhelper.prototype.update = function (obj) {

    var sql = "UPDATE " + obj.table + " SET ";
    var keys = Object.keys(obj.data);
    var sets = [];
    keys.forEach(function (item) {
        switch (typeof obj.data[item]) {
            case "string":
                sets.push(item + ' = "' + obj.data[item] + '"');
                break;
            case "number":
                sets.push(item + ' = ' + obj.data[item]);
                break;
        }
    });

    /**
     * if ID given and "where" not, take ID to reference on ID field
     */
    if (obj.id && !obj.where) {
        obj.where = 'id=' + obj.id;
    }

    sql += sets.toString() + ' WHERE ' + obj.where;

    this.getData(sql);
    var rows = this.db.rowsAffected;
    this.db.close();
    return rows;
};

/**
 * Performs a SQL UPDATE
 *
 * Capsules the update function
 *
 * @method edit
 * @param {Object} obj Object with the properties: table, where and data, which is a dictionary of field_name=value
 * @return {Number} Amount of affected rows
 */
dbhelper.prototype.edit = function (obj) {
    return this.update(obj);
};

/**
 * Takes a flat JSON string and a table name and creates a table
 * @method createFromJSON
 * @param {String} json
 * @param {String} tableName
 */
dbhelper.prototype.createFromJSON = function (json, tableName) {

    var _that = this;
    var obj = JSON.parse(json);
    var fields = [];
    var fieldsPure = [];

    var columns = Object.keys(obj[0]); // get column names
    columns.forEach(function (e) {
        fields.push(e + ' TEXT');
        fieldsPure.push(e); // I'm also creating a string w/o the data-type to be used by the insert
    })
    this.getData('create table ' + tableName + '(' + fields.toString() + ')');

    var sql = '';
    var values = [];
    obj.forEach(function (row) {
        values = [];
        columns.forEach(function (cols) {
            values.push('"' + row[cols] + '"');
        })
        sql = "INSERT INTO " + tableName + " (" + fieldsPure + ") VALUES (" + values.toString() + ")";
        _that.db.execute(sql);
    })
};

/**
 * Drops the database
 * @method drop
 */
dbhelper.prototype.drop = function (tablename) {
    this.getData('DROP TABLE ' + tablename);
    this.db.close()
};

/**
 * Checks if the given table exists in the current database
 * @method tableExists
 * @param {String} tablename
 * @return {Boolean} True or False
 */
dbhelper.prototype.tableExists = function (tablename) {

    var rs = this.getData("SELECT name FROM sqlite_master WHERE type='table' AND name='" + tablename + "'");
    this.db.close();

    if (rs.length > 0) {
        return true;
    }
    return false;
};

/**
 * Alter a table if the field doesn't exist
 * @param tblName
 * @param newFieldName
 * @param colSpec
 */
dbhelper.prototype.addColumn = function (tblName, newFieldName, colSpec) {
    var fieldExists = false;
    var resultSet = this.db.execute('PRAGMA TABLE_INFO(' + tblName + ')');
    while (resultSet.isValidRow()) {
        if (resultSet.field(1) == newFieldName) {
            fieldExists = true;
        }
        resultSet.next();
    } // end while
    if (!fieldExists) {
        // field does not exist, so add it
        this.db.execute('ALTER TABLE ' + tblName + ' ADD COLUMN ' + newFieldName + ' ' + colSpec);
    }
    this.db.close();
};

exports.dbhelper = dbhelper;
