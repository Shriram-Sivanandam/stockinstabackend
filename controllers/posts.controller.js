const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const fs = require('fs');

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

const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, 'uploads/'),
	filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

//Routes for posts
router.post('/addpost', upload.single('image'), (req, res) => {
	console.log('asdfasd', req.file);

	const { userid, caption } = req.body;
	console.log('body', userid, caption);
	const filePath = req.file.path;
	if (!userid) {
		return res.status(400).json({ error: 'UserID required' });
	}
	const sql = 'INSERT INTO `posts` (userid, caption, image_path) VALUES (?, ?, ?)';
	db.query(sql, [userid, caption, filePath])
		.then(() => {
			res.status(200).send('Success');
		})
		.catch((err) => {
			res.status(500).send('error inserting post', err);
		});
});

//Routes for comments
router.post('/addcomment', (req, res) => {
	const { entity_id, userid, comment } = req.body;
	if (!entity_id || !userid || !comment?.trim()) {
		return res.status(400).json({ error: 'PostID, UserID and comment required' });
	}
	const sql = 'INSERT INTO `comments` (entity_id, userid, comment) VALUES (?, ?, ?)';
	db.query(sql, [entity_id, userid, comment])
		.then((result) => {
			return res.status(201).json({ message: 'Comment added successfully', comment_id: result.insertId });
		})
		.catch((err) => {
			return res.status(500).json({ message: 'error inserting comment', err });
		});
});

router.post('/removecomment', (req, res) => {
	const { comment_id } = req.body;
	if (!comment_id || isNaN(comment_id)) {
		return res.status(400).json({ error: 'CommentID required' });
	}
	const sql = 'DELETE FROM `comments` WHERE comment_id = ?';
	db.query(sql, [comment_id])
		.then((result) => {
			if (result.affectedRows === 0) {
				return res.status(404).json({ message: 'Comment not found or already deleted' });
			}

			return res.status(200).json({ message: 'Comment deleted successfully' });
		})
		.catch((err) => {
			return res.status(500).json({ message: 'error deleting comment', err });
		});
});

router.get('/getcomments', (req, res) => {
	const { entity_id } = req.query;
	if (!entity_id || isNaN(entity_id)) {
		return res.status(400).json({ error: 'PostID required' });
	}
	const sql = `
        SELECT c.comment_id, c.entity_id, c.userid, c.comment, c.created_at, u.username
        FROM comments c
        JOIN users u ON c.userid = u.id
        WHERE c.entity_id = ?
        ORDER BY c.created_at DESC
    `;
	db.query(sql, [entity_id])
		.then((data) => {
			const comments = data[0];
			res.status(200).json({ comments: comments });
		})
		.catch((err) => {
			res.status(500).json({ error: 'error in fetching comments', err });
		});
});

module.exports = router;
