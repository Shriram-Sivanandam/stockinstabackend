const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const router = express.Router();

router.use(cors());
router.use(express.json());
router.use(cookieParser());

const saltRounds = 10;

const db = require('../db');

router.get('/list', (req, res) => {
	db.query('SELECT * FROM users')
		.then((data) => {
			res.send(data[0]);
		})
		.catch((err) => {
			res.status(500).send('error');
		});
});

router.post('/registerUser', (req, res) => {
	console.log('insidee register user', req.body);
	const sql = 'INSERT INTO `users` (username, password) VALUES (?)';
	bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
		if (err) {
			return res.status(500).send('error in hashing password');
		}
		const values = [req.body.email, hash];
		db.query(sql, [values], (err, result) => {
			console.log('inside query', err, result);
			if (err) {
				return res.status(500).send('error in inserting user');
			}
			db.end();
			console.log('hello there');
			return res.status(200).send('Success');
		});
		return res.status(200).send('Success');
	});
});

module.exports = router;
