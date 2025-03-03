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

router.post('/addinstrument', (req, res) => {
	const sql = 'INSERT INTO `explore` (userid, instrument, pageno) VALUES (?)';
	const values = [req.body.userid, req.body.instrument, req.body.pageno];
	db.query(sql, [values])
		.then((data) => {
			res.status(200).send('Success');
		})
		.catch((err) => {
			res.status(500).send('error inserting instrument');
		});
});

router.post('/removeinstrument', (req, res) => {
	const sql = 'DELETE FROM explore WHERE userid = ? AND instrument = ? AND pageno = ?';
	db.query(sql, [req.body.userid, req.body.instrument, req.body.pageno])
		.then((data) => {
			res.status(200).send('Success');
		})
		.catch((err) => {
			res.status(500).send(err);
		});
});

router.get('/getinstruments', (req, res) => {
	const sql = 'SELECT * FROM `explore` WHERE userid = ? AND pageno = ?';
	db.query(sql, [req.query.userid, req.query.pageno])
		.then((data) => {
			console.log(data);
			res.send(data[0]);
		})
		.catch((err) => {
			res.status(500).send('error');
		});
});

module.exports = router;
