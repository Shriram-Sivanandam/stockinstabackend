const mysql = require('mysql2/promise');

const mysqlPool = mysql.createPool({
	host: 'localhost',
	user: 'root',
	password: '12345',
	database: 'user_db',
});

mysqlPool.on('connection', function (connection) {
	console.log('DB Connection established');

	connection.on('error', function (err) {
		console.error(new Date(), 'MySQL error', err.code);
	});
	connection.on('close', function (err) {
		console.error(new Date(), 'MySQL close', err);
	});
});

module.exports = mysqlPool;
