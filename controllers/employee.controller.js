const express = require('express');
const router = express.Router();

const db = require('../db');

router.get('/list', (req, res) => {
	db.query('SELECT * FROM employees')
		.then((data) => {
			res.send(data[0]);
		})
		.catch((err) => {
			res.status(500).send('error');
		});
});

module.exports = router;
