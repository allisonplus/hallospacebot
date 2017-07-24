console.log( 'Image bot functionality initializing...' );

//Require .env NPM package
require( 'dotenv' ).config();

// Require twit NPM package.
var Twit = require( 'twit' );

var exec = require( 'child_process' ).exec;
var fs = require( 'fs' );

// Request for downloading files
var request = require( 'request' );

// // Pass object to twit package.
const T = new Twit( {
	consumer_key: process.env.CONSUMER_KEY,
	consumer_secret: process.env.CONSUMER_SECRET,
	access_token: process.env.ACCESS_TOKEN,
	access_token_secret: process.env.ACCESS_TOKEN_SECRET
} );

// Get the twitter user stream (for responses to bot).
const stream = T.stream( 'user' );

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
	} // end processing
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

	// You talking to me?
	if ( reply_to === 'NiceNiceBot' ) {

		// What if there's no <img>?
		if ( media === undefined ) {
			const reply = '@' + name + ' I need an image to do something!';
			T.post( 'statuses/update', {
				status: reply,
				in_reply_to_status_id: id
			}, tweeted );

		// & if there is an <img>? GET IT.
		} else if ( media.length > 0 ) {
			const img = media[0].media_url;
			downloadMedia( img, 'upload' );
		}
	} // endif

	// Snag the media.
	function downloadMedia( url, filename ) {

		console.log( 'Trying to download url: ' + url + ' to ' + filename );

		// Make HTTP request.
		request.head( url, downloadComplete );

		function downloadComplete( error, response, body ) {

			console.log('downloadComplete function started...');

			// Get the type of file.
			const type = response.headers['content-type'];

			// Create file name you'll be saving it as.
			const i = type.indexOf('/');
			const ext = type.substring(i + 1, type.length);
			filename = `${filename}.${ext}`;

			// Save it to disk as that file + put in proper folder.
			request( url ).pipe( fs.createWriteStream('assets/' + filename ) ).on( 'close', fileSaved );

			function fileSaved() {

				console.log('fileSaved function started...');

				// Processing via command line.
				var cmd = 'processing-java --sketch=`pwd`/assets/ --run ' + filename;
				exec( cmd, processing );

				function processing( error, sendout ) {

					console.log('processing function started...');

					// Read .pde file.
					var b64content = fs.readFileSync( 'assets/output.jpeg', {
						encoding: 'base64'
					} )

					// Upload media.
					T.post( 'media/upload', {
						media_data: b64content
					}, uploaded );

					function uploaded( err, data, response ) {

						console.log('uploaded function started...');

						// Reference the media + post tweet w/ media attached.
						var mediaIdStr = data.media_id_string;
						var params = {
							status: '@' + name + ' #WhatWillActuallyAppear',
							in_reply_to_status_id: id,
							media_ids: [mediaIdStr]
						}

						// Post tweet.
					 	T.post( 'statuses/update', params, tweeted );
					}; // end uploaded
				} // end processing
			} // end fileSaved
		} // end downloadComplete
	} // end downloadMedia
} // end convoTest

function tweeted( error, success ) {
	if ( error !== undefined ) {
		console.log( error );
	} else {
		console.log( 'Tweeted: ' + success.text );
	}
}
