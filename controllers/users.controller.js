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
	console.log('insidee register user');
	const sql = 'INSERT INTO users (username, password) VALUES (?,?)';
	bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
		if (err) {
			res.status(500).send('error in hashing password');
		}
		const values = [req.body.username, hash];
		db.query(sql, [values], (err, result) => {
			if (err) {
				res.status(500).send('error in registering user');
			}
			return res.status(200).send('Success');
		});
	});
});

module.exports = router;
