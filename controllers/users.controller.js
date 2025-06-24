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
	const sql = 'INSERT INTO users (emailid, password, username) VALUES (?)';
	console.log(req.body);
	bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
		if (err) {
			return res.status(500).send('error in hashing password');
		}
		const values = [req.body.email, hash, req.body.username];
		db.query(sql, [values])
			.then((data) => {
				const token = jwt.sign({ email: req.body.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
				res.cookie('token', token, { httpOnly: true });
				console.log('helloooo', data[0].insertId);
				return res.status(200).json({ id: data[0].insertId });
				//return res.status(200).send('Success');
			})
			.catch((err) => {
				return res.status(500).send('error in inserting user');
			});
	});
});

router.post('/sendOTP', (req, res) => {
	const { email } = req.body;
	if (!email) {
		return res.status(400).json({ error: 'Email is mandatory.' });
	}

	const otp = Math.floor(100000 + Math.random() * 900000).toString();
	const expires_at = new Date(Date.now() + 10 * 60 * 1000);
	const sql = 'INSERT INTO otp_verifications (identifier, otp, expires_at) VALUES (?, ?, ?)';

	const values = [email, otp, expires_at];
	db.query(sql, values)
		.then((data) => {
			return res.status(200).send({ message: 'OTP creation successful' });
		})
		.catch((err) => {
			return res.status(500).send({ error: 'error occured in inserting OTP' + err });
		});
});

router.post('/verifyOTP', (req, res) => {
	const { email, otp } = req.body;

	if (!email || !otp) {
		return res.status(400).json({ error: 'Email and OTP are mandatory.' });
	}

	const sql =
		'SELECT * FROM otp_verifications WHERE identifier = ? AND otp = ? AND verified = 0 AND expires_at > NOW()';

	db.query(sql, [email, otp]).then((result) => {
		if (result.length > 0) {
			const updatesql = 'UPDATE otp_verifications SET verified = 1 WHERE identifier = ? and otp = ?';
			db.query(updatesql, [email, otp])
				.then(() => {
					return res.status(200).json({ message: 'OTP verified successfully.' });
				})
				.catch((err) => {
					return res.status(500).json({ error: 'Error updating OTP verification status.' });
				});
		} else {
			return res.status(400).json({ error: 'Invalid or expired OTP.' });
		}
	});
});

router.post('/login', (req, res) => {
	const sql = 'SELECT * FROM users WHERE emailid = ?';

	db.query(sql, [req.body.email])
		.then((result) => {
			if (result.length > 0) {
				bcrypt.compare(req.body.password, result[0][0].password, (berr, isMatch) => {
					if (berr) return res.status(500).send('error in comparing password');
					if (isMatch) {
						const token = jwt.sign({ email: req.body.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
						res.cookie('token', token, { httpOnly: true });
						return res.status(200).json({ id: result[0][0].id });
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

router.get('/searchUser', (req, res) => {
	const searchParam = '%' + req.query.searchParam + '%';
	if (!searchParam || typeof searchParam !== 'string') {
		return res.status(400).json({ error: 'Missing or invalid searchParam.' });
	}
	const sql = `SELECT username, dp_path, id 
		 FROM users 
		 WHERE (LOWER(username) LIKE LOWER(?) OR LOWER(emailid) LIKE LOWER(?)) 
		 AND COALESCE(username,'') <> ''
		 ORDER BY
		 CASE
			WHEN LOWER(username) = LOWER(?) THEN 1
			WHEN LOWER(username) LIKE LOWER(?) THEN 2
			WHEN LOWER(emailid) = LOWER(?) THEN 3
			WHEN LOWER(emailid) LIKE LOWER(?) THEN 4
			ELSE 5
		 END
		 LIMIT 10;`;
	db.query(sql, [searchParam, searchParam, searchParam, searchParam, searchParam, searchParam])
		.then((data) => {
			const users = data[0];
			res.status(200).send(users);
		})
		.catch((err) => {
			res.status(500).send('error in fetching users', err);
		});
});

router.post('/follow', (req, res) => {
	const { followerid, followingid } = req.body;
	if (!followerid || !followingid) {
		return res.status(400).json({ error: 'FollowerID and FollowingID required' });
	}
	if (followerid === followingid) {
		return res.status(400).json({
			error: 'A user cannot follow themselves.',
		});
	}
	const sql = 'INSERT IGNORE INTO `follows` (followerid, followingid) VALUES (?, ?)';
	db.query(sql, [followerid, followingid])
		.then(() => {
			res.status(200).json({ message: 'Unfollow successful.' });
		})
		.catch((err) => {
			res.status(500).send('error inserting follow', err);
		});
});

router.post('/unfollow', (req, res) => {
	const { followerid, followingid } = req.body;
	if (!followerid || !followingid) {
		return res.status(400).json({ error: 'FollowerID and FollowingID required' });
	}
	const sql = 'DELETE FROM `follows` WHERE followerid = ? AND followingid = ?';
	db.query(sql, [followerid, followingid])
		.then(() => {
			res.status(200).json({ message: 'Unfollow successful.' });
		})
		.catch((err) => {
			res.status(500).send('error deleting follow', err);
		});
});

router.get('/getProfile', (req, res) => {
	const { userid, currentUserid } = req.query;
	if (!userid) {
		return res.status(400).json({ error: 'UserID required' });
	}
	const sql = `
		SELECT 
			u.username, 
			u.dp_path,
			(SELECT COUNT(*) FROM follows WHERE followingid = u.id) AS followers,
			(SELECT COUNT(*) FROM follows WHERE followerid = u.id) AS following,
			(SELECT COUNT(*) FROM posts WHERE userid = u.id) AS posts,
			EXISTS (
				SELECT 1
				FROM follows f 
				WHERE f.followerid = ? AND f.followingid = u.id
			) AS isFollowing
		FROM users u
		WHERE u.id = ?;
	`;
	db.query(sql, [currentUserid, userid])
		.then((data) => {
			const user = data[0][0];
			if (!user) {
				return res.status(404).json({ error: 'User not found' });
			}
			//user.dp_path = process.env.BASE_URL + '/' + user.dp_path;
			user.isFollowing = Boolean(user.isFollowing);
			user.isMe = String(currentUserid) === String(userid);
			res.status(200).json(user);
		})
		.catch((err) => {
			res.status(500).json({ error: 'error in fetching profile' });
		});
});

module.exports = router;
