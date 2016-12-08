'use strict';

// Create an API server

const Restify = require('restify');
const server = Restify.createServer({
	name: 'VanillaMessenger'
});

const PORT = process.env.PORT || 8080;

// Tokens
const config = require('./config');

// FBeamer
const FBeamer = require('./FBeamer');
const f = new FBeamer(config);

// Test
server.get('/', (req, res, next) => {
	res.send("Hello");
	return next();
});

server.listen(PORT, () => console.log(`Vanilla running on port ${PORT}`));


