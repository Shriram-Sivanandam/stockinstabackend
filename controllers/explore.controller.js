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

//Routes for instruments in each explore page for particular user
router.post('/addinstrument', (req, res) => {
	const sql = 'INSERT INTO `explore` (userid, instrument, pageno) VALUES (?)';
	const values = [req.body.userid, req.body.instrument, req.body.pageno];
	db.query(sql, [values])
		.then(() => {
			res.status(200).send('Success');
		})
		.catch((err) => {
			res.status(500).send('error inserting instrument', err);
		});
});

router.post('/removeinstrument', (req, res) => {
	const sql = 'DELETE FROM explore WHERE userid = ? AND instrument = ? AND pageno = ?';
	db.query(sql, [req.body.userid, req.body.instrument, req.body.pageno])
		.then(() => {
			res.status(200).send('Success');
		})
		.catch((err) => {
			res.status(500).send('error in deleting instruments', err);
		});
});

router.get('/getinstruments', (req, res) => {
	const sql = 'SELECT instrument FROM `explore` WHERE userid = ? AND pageno = ?';
	db.query(sql, [req.query.userid, req.query.pageno])
		.then((data) => {
			const instruments = data[0].map((instrument) => instrument.instrument);
			res.status(200).send(instruments);
		})
		.catch((err) => {
			res.status(500).send('error in fetching instruments', err);
		});
});

//Routes for explore page names for particular user
router.post('/addExplorePage', (req, res) => {
	const sql = 'INSERT INTO `explorepages` (userid, pagename) VALUES (?)';
	const values = [req.body.userid, req.body.pagename];
	db.query(sql, [values])
		.then(() => {
			res.status(200).send('Success');
		})
		.catch((err) => {
			res.status(500).send('error inserting explore page', err);
		});
});

router.post('/removeExplorePage', (req, res) => {
	const sql = 'DELETE FROM explorepages WHERE userid = ? AND rowid = ?';
	db.query(sql, [req.body.userid, req.body.rowid])
		.then(() => {
			res.status(200).send('Success');
		})
		.catch((err) => {
			res.status(500).send('error in delete explore page', err);
		});
});

router.get('/getExplorePages', (req, res) => {
	const sql = 'SELECT rowid, pagename FROM `explorepages` WHERE userid = ? ORDER BY rowid';
	db.query(sql, [req.query.userid])
		.then((data) => {
			res.status(200).send(data[0]);
		})
		.catch((err) => {
			res.status(500).send('error in fetching explore pages', err);
		});
});

module.exports = router;
