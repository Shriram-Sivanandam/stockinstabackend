const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const fs = require('fs');
const BASE_URL = process.env.BASE_URL;

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
	const { userid, caption } = req.body;
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

router.get('/getposts', (req, res) => {
	const { userid, currentUserid } = req.query;
	if (!userid) {
		return res.status(400).json({ error: 'UserID required' });
	}
	const sql = `
		SELECT 
			p.entity_id, 
			p.userid, 
			p.caption, 
			REPLACE(p.image_path, '\\\\', '/') AS image_path,
			p.created_at, 
			u.username, 
			REPLACE(u.dp_path, '\\\\', '/') AS dp_path,
			COALESCE(like_counts.likes, 0) AS likes,
			CASE WHEN ul.userid IS NOT NULL THEN true ELSE false END AS isLiked,
			CASE WHEN ul.userid IS NOT NULL THEN true ELSE false END AS isSaved
		FROM user_db.posts p
		JOIN user_db.users u ON p.userid = u.id
		LEFT JOIN (
			SELECT entity_id, COUNT(*) AS likes
			FROM user_db.likes
			GROUP BY entity_id
		) like_counts ON like_counts.entity_id = p.entity_id
		LEFT JOIN user_db.likes ul ON ul.entity_id = p.entity_id AND ul.userid = (?)
		WHERE p.userid = (?)
		ORDER BY p.created_at DESC;
	`;
	db.query(sql, [currentUserid, userid])
		.then((data) => {
			const posts = data[0];
			posts.forEach((post) => {
				post.image_path = BASE_URL + '/' + post.image_path;
				//post.dp_path = BASE_URL + '/' + post.dp_path;
			});
			res.status(200).json({ posts: posts });
		})
		.catch((err) => {
			res.status(500).json({ error: 'error in fetching posts', err });
		});
});

router.get('/getFeed', (req, res) => {
	const { userid } = req.query;
	if (!userid) {
		return res.status(400).json({ error: 'UserID required' });
	}
	const sql = `
		SELECT 
			p.entity_id, 
			p.userid, 
			p.caption, 
			REPLACE(p.image_path, '\\\\', '/') AS image_path,
			p.created_at, 
			u.username, 
			REPLACE(u.dp_path, '\\\\', '/') AS dp_path,
			COALESCE(like_counts.likes, 0) AS likes,
			CASE WHEN ul.userid IS NOT NULL THEN true ELSE false END AS isLiked,
			CASE WHEN ul.userid IS NOT NULL THEN true ELSE false END AS isSaved
		FROM user_db.posts p
		JOIN user_db.users u ON p.userid = u.id
		LEFT JOIN (
			SELECT entity_id, COUNT(*) AS likes
			FROM user_db.likes
			GROUP BY entity_id
		) like_counts ON like_counts.entity_id = p.entity_id
		LEFT JOIN user_db.likes ul ON ul.entity_id = p.entity_id AND ul.userid = (?)
		WHERE p.userid in (
			SELECT followingid 
			FROM user_db.follows
			WHERE followerid = (?))
		ORDER BY p.created_at DESC;
	`;
	db.query(sql, [userid, userid])
		.then((data) => {
			const posts = data[0];
			posts.forEach((post) => {
				post.image_path = BASE_URL + '/' + post.image_path;
				//post.dp_path = BASE_URL + '/' + post.dp_path;
			});
			res.status(200).json({ posts: posts });
		})
		.catch((err) => {
			res.status(500).json({ error: 'error in fetching posts', err });
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
        SELECT c.comment_id, c.entity_id, c.userid, c.comment, c.created_at, u.username, u.dp_path
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

// Routes for likes

router.post('/addlike', (req, res) => {
	const { entity_id, userid } = req.body;
	if (!entity_id || !userid) {
		return res.status(400).json({ error: 'PostID and UserID required' });
	}
	const sql = 'INSERT INTO `likes` (entity_id, userid) VALUES (?, ?)';
	db.query(sql, [entity_id, userid])
		.then(() => {
			return res.status(200).json({ message: 'Like added successfully' });
		})
		.catch((err) => {
			return res.status(500).json({ message: 'error inserting like', err });
		});
});

router.post('/removelike', (req, res) => {
	const { entity_id, userid } = req.body;
	if (!entity_id || !userid) {
		return res.status(400).json({ error: 'PostID and UserID required' });
	}
	const sql = 'DELETE FROM `likes` WHERE entity_id = ? AND userid = ?';
	db.query(sql, [entity_id, userid])
		.then((result) => {
			if (result.affectedRows === 0) {
				return res.status(404).json({ message: 'Like not found or already deleted' });
			}

			return res.status(200).json({ message: 'Like deleted successfully' });
		})
		.catch((err) => {
			return res.status(500).json({ message: 'error deleting like', err });
		});
});

module.exports = router;
