console.log( 'Image bot functionality initializing...' );

//Require .env NPM package
require('dotenv').config();

// Require twit NPM package.
var Twit = require('twit');

var exec = require('child_process').exec;
var fs = require('fs');

// Request for downloading files
var request = require('request');

// // Pass object to twit package.
const T = new Twit( {
	consumer_key: process.env.CONSUMER_KEY,
	consumer_secret: process.env.CONSUMER_SECRET,
	access_token: process.env.ACCESS_TOKEN,
	access_token_secret: process.env.ACCESS_TOKEN_SECRET
} );

// Get the twitter user stream (for responses to bot).
const stream = T.stream('user');

// tweetIt();

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

		function uploaded( err, data, response ) {

			const id = data.media_id_string;
			const tweet = {
				status: '#TotallyWorks',
				media_ids: [id]
			}
			T.post('statuses/update', tweet, tweeted);
		} // end uploaded

		function tweeted( err, data, response ) {
			if (err) {
				console.log( "Something went wwrong!" );
			} else {
				console.log( "It worked!" );
			}
		} // end tweeted
	} // end processing()
} // end tweetIt

// Create an event when someone tweets bot.
stream.on( 'tweet', convoTest );

function convoTest( tweet ) {

	// What's the deal with this tweet?
	const reply_to = tweet.in_reply_to_screen_name;
	const name = tweet.user.screen_name;
	const txt = tweet.text;
	const media = tweet.entities.media;
	const id = tweet.id_str;

	// console.log(reply_to);
	// console.log(name);
	// console.log(txt);
	// console.log(id);

	// You talking to me?
	if ( reply_to === 'NiceNiceBot' ) {

		// What happens if there's no <img>?
		if ( media === undefined ) {
			const reply = '@' + name + ' I need an image to do something!';
			T.post( 'statuses/update', {
				status: reply,
				in_reply_to_status_id: id
			}, tweeted );

		// But if there is an image, get it.
		} else if ( media.length > 0 ) {
			const img = media[0].media_url;
			downloadMedia( img, 'media' );
		}
	} // endif

	// Snag the media.
	function downloadMedia( url, filename ) {
		console.log( 'I\'m going to try to download the file for you, okay?' );

		console.log( 'Trying to download url: ' + url + ' to ' + filename );

		// Make OAUTH request.
		// request.head( url, downloaded );

		function downloadComplete() {

		} // downloadComplete
	} // end downloadMedia

	// TODO: What to do once the <img> is downloaded
	// TODO: Put in processing folder
	// TODO: Do something to it w/ Processing
	// TODO: Reupload back to twitter
	// TODO: Send back to user / post?

} // end convoTest

function tweeted( err, success ) {
	if ( err !== undefined ) {
		console.log( err ) ;
	} else {
		console.log( 'Tweeted: ' + success.text );
	}
}
