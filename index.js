const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = require('./db');
const employeeController = require('./controllers/employee.controller');
const usersController = require('./controllers/users.controller');

const PORT = 3000;

app.use('/employees', employeeController);

app.use('/users', usersController);

db.query('SELECT 1')
	.then((data) => {
		console.log('connected to db', data);
		app.listen(PORT, () => console.log(`server running on port ${PORT}`));
	})
	.catch((err) => console.log('error', err));
