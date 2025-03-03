const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const router = express.Router();

router.use(
	cors({
		origin: 'http://localhost:3000',
		methods: ['GET', 'POST'],
		credentials: true,
	})
);
router.use(express.json());
router.use(cookieParser());

const saltRounds = 10;

const db = require('../db');

router.post('/registerUser', (req, res) => {
	const sql = 'INSERT INTO `users` (username, password) VALUES (?)';
	bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
		if (err) {
			return res.status(500).send('error in hashing password');
		}
		const values = [req.body.email, hash];
		db.query(sql, [values])
			.then((data) => {
				return res.status(200).send('Success');
			})
			.catch((err) => {
				return res.status(500).send('error in inserting user');
			});
	});
});

router.post('/login', (req, res) => {
	const sql = 'SELECT * FROM users WHERE username = ?';

	db.query(sql, [req.body.email])
		.then((result) => {
			if (result.length > 0) {
				bcrypt.compare(req.body.password, result[0][0].password, (berr, isMatch) => {
					if (berr) return res.status(500).send('error in comparing password');
					if (isMatch) {
						const token = jwt.sign({ email: req.body.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
						res.cookie('token', token, { httpOnly: true });
						return res.status(200).send('login successful');
					} else {
						return res.status(401).send('Incorrect password');
					}
				});
			} else {
				return res.status(404).send('user not found');
			}
		})
		.catch((err) => {
			return res.status(500).send('error in fetching user');
		});
});

module.exports = router;
