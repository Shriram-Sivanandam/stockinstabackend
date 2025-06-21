const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(
	cors({
		origin: 'http://localhost:3000',
		methods: ['GET', 'POST'],
		credentials: true,
	})
);
app.use(express.json());

const db = require('./db');
const usersController = require('./controllers/users.controller');
const exploreController = require('./controllers/explore.controller');
const postsController = require('./controllers/posts.controller');

const PORT = 3000;

app.use('/users', usersController);

app.use('/explore', exploreController);

app.use('/posts', postsController);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

db.query('SELECT 1')
	.then((data) => {
		console.log('connected to db', data);
		app.listen(PORT, () => console.log(`server running on port ${PORT}`));
	})
	.catch((err) => console.log('error', err));


// const { sendOTPEmail } = require('./utilities/emailSender');

// const main = async () => {
//   const recipientEmail = 'ssshriram4@gmail.com';
//   const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP

//   console.log(`Attempting to send OTP ${otp} to ${recipientEmail}`);

//   const result = await sendOTPEmail(recipientEmail, otp);
// };

// main();
