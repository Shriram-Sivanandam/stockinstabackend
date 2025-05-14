require('dotenv').config();

const mysql = require('mysql2/promise');

const mysqlPool = mysql.createPool({
	host: 'aws-stockinsta.cxuikmck8hz8.eu-north-1.rds.amazonaws.com',
	user: 'admin',
	password: process.env.DB_PASSWORD,
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
