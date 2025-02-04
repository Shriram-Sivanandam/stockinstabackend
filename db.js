const mysql = require('mysql2/promise');

const mysqlPool = mysql.createPool({
	host: 'localhost',
	user: 'root',
	password: '12345',
	database: 'user_db',
});

module.exports = mysqlPool;
