const express = require('express');
const cors = require('cors');
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

const db = require('../db');

//Routes for posts
router.post('/addpost', (req, res) => {
	const { userid, caption } = req.body;
	if (!userid) {
		return res.status(400).json({ error: 'UserID required' });
	}
	const sql = 'INSERT INTO `posts` (userid, caption) VALUES (?, ?)';
	db.query(sql, [userid, caption])
		.then(() => {
			res.status(200).send('Success');
		})
		.catch((err) => {
			res.status(500).send('error inserting post', err);
		});
});

//Routes for comments
router.post('/addcomment', (req, res) => {
	const { entity_id, userid, content } = req.body;
	if (!entity_id || !userid || !content?.trim()) {
		return res.status(400).json({ error: 'PostID, UserID and content required' });
	}
	const sql = 'INSERT INTO `comments` (entity_id, userid, content) VALUES (?, ?, ?)';
	db.query(sql, [entity_id, userid, content])
		.then((result) => {
			return res.status(201).json({ message: 'Comment added successfully', comment_id: result.insertId });
		})
		.catch((err) => {
			return res.status(500).json({ message: 'error inserting comment', err });
		});
});

module.exports = router;
