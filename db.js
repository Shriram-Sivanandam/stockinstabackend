require('dotenv').config();

const mysql = require('mysql2/promise');

const mysqlPool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
});

mysqlPool.on('connection', function (connection) {
	console.log('DB Connection established');

	connection.on('errorrrrr', function (err) {
		console.error(new Date(), 'MySQL error', err.code);
	});
	connection.on('close', function (err) {
		console.error(new Date(), 'MySQL close', err);
	});
});

module.exports = mysqlPool;
