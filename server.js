'use strict';

// Create an API server
const Restify = require('restify');
const server = Restify.createServer({
	name: 'VanillaMessenger' // optional
});

const PORT = process.env.PORT || 3000;

server.use(Restify.jsonp());
server.use(Restify.bodyParser());

// Tokens
const config = require('./config');

// FBeamer
const FBeamer = require('./FBeamer');
const f = new FBeamer(config);

// Register the webhooks
server.get('/', (req, res, next) => {
	f.registerHook(req,res);
	return next();
});

// Receiver all incoming messages
server.post('/', (req,res,next) => {
	f.incoming(req,res, msg => {
		//process individual messages
		f.txt(msg.sender, `Hey you just said "${msg.message.text}"`);
		f.img(msg.sender, "https://s.yimg.com/os/mit/media/m/weather/images/fallbacks/lead/cloudy_d-e618500.jpg");
	});
	return next();
});

// Subscribe
f.subscribe();

server.listen(PORT, () => console.log(`Vanilla running on port ${PORT}`));
