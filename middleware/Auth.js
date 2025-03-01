const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
	const token = req.headers['authorization']?.split(' ')[1];
	if (!token) return res.status(401).send('Access Denied');
	try {
		const decode = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decode;
		next();
	} catch (err) {
		res.status(400).send('Invalid Token');
	}
};

module.exports = verifyToken;
