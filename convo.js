console.log('The image bot is starting');

//Require .env NPM package
require('dotenv').config();

// Require twit NPM package.
var Twit = require('twit');

var exec = require('child_process').exec;
var fs = require('fs');

// // Pass object to twit package.
const T = new Twit( {
	consumer_key: process.env.CONSUMER_KEY,
	consumer_secret: process.env.CONSUMER_SECRET,
	access_token: process.env.ACCESS_TOKEN,
	access_token_secret: process.env.ACCESS_TOKEN_SECRET
} );

tweetIt();

function tweetIt() {
	const command = 'processing-java --sketch=`pwd`/assets --run';
	exec(command, processing);

	function processing() {
		const filename = 'assets/output.png';
		const params = {
			encoding: 'base64'
		}

		var base64 = fs.readFileSync(filename, params);

		T.post('media/upload', { media_data: base64 }, uploaded);

		function uploaded(err, data, response) {

			const id = data.media_id_string;
			const tweet = {
				status: '#TotallyWorks',
				media_ids: [id]
			}
			T.post('statuses/update', tweet, tweeted);
		} // end uploaded

		function tweeted(err, data, response) {
			if (err) {
				console.log( "Something went wwrong!" );
			} else {
				console.log( "It worked!" );
			}
		} // end tweeted
	} // end processing()
}
