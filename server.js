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

// Vanilla
const matcher = require('./matcher');
const weather = require('./weather');
const {currentWeather, forecastWeather} = require('./parser');


// Register the webhooks
server.get('/', (req, res, next) => {
	f.registerHook(req, res);
	return next();
});

// Receiver all incoming messages
server.post('/', (req, res, next) => {
	f.incoming(req, res, msg => {
		//process individual messages
		// f.txt(msg.sender, `Hey you just said "${msg.message.text}"`);
		// f.img(msg.sender, "https://s.yimg.com/os/mit/media/m/weather/images/fallbacks/lead/cloudy_d-e618500.jpg");
		if (msg.message.text) {
			// If a text is received
			matcher(msg.message.text, data => {
				switch (data.intent) {
					case 'Hello':
						f.txt(msg.sender, `${data.entities.greeting} to you too`);
						break;
					case 'CurrentWeather':
						weather(data.entities.city, 'current')
							.then(response => {
								let parseResult = currentWeather(response);
								f.txt(msg.sender, parseResult);
							})
							.catch(error => {
								console.log("There seems to be a problem connection to the weather service");
								f.txt(msg.sender, "Hmm.. something is off with the server, please check back later, sorry about that!");
							});
						break;
					case 'WeatherForecast':
						weather(data.entities.city)
							.then(response => {
								let parseResult = forecastWeather(response, data.entities);
								f.txt(msg.sender, parseResult)
							})
							.catch(error => {
								console.log("There seems to be a problem connection to the weather service");
								f.txt(msg.sender, "Hmm.. something is off with the server, please check back later, sorry about that!");
							});
						break;
					default: {
						f.txt(msg.sender, "Sorry, I dont know what you mean");
					}
				}
			})
		}
	});
	return next();
});

// Subscribe
f.subscribe();

server.listen(PORT, () => console.log(`Vanilla running on port ${PORT}`));
