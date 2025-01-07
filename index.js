const express = require('express');
const app = express();

const db = require('./db');
const employeeController = require('./controllers/employee.controller');

const PORT = 3000;

app.use('/employees', employeeController);

db.query('SELECT 1')
	.then((data) => {
		console.log('connected to db', data);
		app.listen(PORT, () => console.log(`server running on port ${PORT}`));
	})
	.catch((err) => console.log('error', err));
