const express = require('express');
const app = express();
const cors = require('cors');
const monk = require('monk');
const Filter = require('bad-words');
const rateLimit = require('express-rate-limit');

app.use(cors());
app.use(express.json());


// Establish connection to MongoDB
const db = monk(process.env.MONGO_URI ||"localhost/meower");
const mews = db.get("mews");
const filter = new Filter();


app.get('/', (req, res) => {
	res.json({
		message: "Meower"
	});
});

// Send a GET request to the server
app.get('/mews', (req, res) => {
	mews
		.find()
		.then(mews => {
			res.json(mews);
		});
});

// Send a POST request to the server and insert (if valid) into the database
app.post('/mews', (req, res) => {
	if(isValidMew(req.body)) {
		const mew = {
			name: filter.clean(req.body.name.toString()),
			content: filter.clean(req.body.content.toString()),
			created: new Date()
		};
		
		mews
			.insert(mew)
			.then(createdMew => {
				res.json(createdMew);
			});
	}
	else {
		res.status(422);
		res.json( {
			message: "Name and Content are required fields!"
		});
	}
});

// Listen on port 5000 for the server requests
app.listen(5000, () => {
	console.log('listening on port 5000');
});

// Check if the name and content in the form are valid
function isValidMew(mew) {
	return mew.name && mew.name.toString().trim() !== "" &&
		mew.content && mew.content.toString().trim() !== "";
}

// Allow only 100 request per 15 minutes per IP address
const limiter = rateLimit({
	windowMs: 100 * 1000,
	max: 1
}); 

app.use(limiter);




