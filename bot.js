//Require .env NPM package
require('dotenv').config();

// Require twit NPM package.
const Twit = require( 'twit' );

// Require axios NPM package.
const axios = require( 'axios' );

// Pass object to twit package.
const T = new Twit( {
	consumer_key: process.env.CONSUMER_KEY,
	consumer_secret: process.env.CONSUMER_SECRET,
	access_token: process.env.ACCESS_TOKEN,
	access_token_secret: process.env.ACCESS_TOKEN_SECRET
} );

// Variable for key.
const key = process.env.KEY;

// Variable for Artist ID.
const artist = '431';

// How many ms in an hour?
const hour = 3600000;

// Variable for setting time interval.
const tweetInterval = hour * 8; // for actual bot timing
// const tweetInterval = 10000; // for testing bot timing

// Config file for discography info.
const albums = require( './discog' );

// Get the twitter user stream (for responses to Spacebot).
const stream = T.stream('user');

// Return random number.
function randomNum( length ) {
	return Math.floor( Math.random() * length );
}

// Calculate a random index for album list.
function randomAlbum() {

	// Assign variable to number of total albums.
	const length = albums.length;

	// Return random number from how many albums available.
	const random = randomNum( length );

	// Get randomly chosen album & assign variable to ID.
	const albumID = albums[random].id;

	// console.log(`My album number is ${albumID}`);

	getAlbumInfo( albumID );
}

function getAlbumInfo( albumID ) {

	// Make a request.
	axios.get(`https://api.musixmatch.com/ws/1.1/album.tracks.get?format=json&callback=callback&album_id=${albumID}&f_has_lyrics=true&apikey=${key}`)
		.then(function (response) {

			// List of tracks within album.
			const trackList = response.data.message.body.track_list;

			// console.log('calling track list');

			randomTrack( trackList );
		})
		.catch(function (error) {
			console.log(error, "Trouble with getting track list");
		});
}

// Calculate a random index for track list.
function randomTrack( trackList ) {

	// Assign variable to number of tracks in particular album.
	const length = trackList.length;

	// Return random number from how many tracks available.
	const random = randomNum( length );

	// Get randomly chosen track & assign variable to ID.
	const trackID = trackList[random].track.track_id;

	// console.log(`My track number is ${trackID}`);

	getLyrics( trackID );
}

// Get the actual lyrics using the trackID.
function getLyrics( trackID ) {

	// Make a request.
	axios.get(`https://api.musixmatch.com/ws/1.1/track.lyrics.get?format=json&callback=callback&track_id=${trackID}&apikey=${key}`)
		.then(function (response) {

			// Assign variable to lyrics request to make less unwieldy.
			const lyricRequest = response.data.message.body.lyrics.lyrics_body;

			// If it returns lyrics, keep going - if not, go back to the drawing board.
			if ( lyricRequest !== '' ) {
				let snippet = lyricRequest;
				formatLyrics( snippet );
			} else {
				randomAlbum();
			}
		})
		.catch(function (error) {
			console.log(error, "Trouble with getting lyrics");
		});
}

function formatLyrics( snippet ) {

	// If snippet is undefined, go back to the drawing board.
	if ( snippet === undefined ) {
		randomAlbum();
	} else {
		// Split at line breaks.
		snippet = snippet.split( '\n' );
	}

	// Assign variable to filtered snippet after removing blank lines from data.
	let filteredLyrics = snippet.filter( (line) => line !== '' );

	// Figures out index where ellipsis begins.
	const findEllipsis = filteredLyrics.indexOf( '...' );

	// Chops eveything ellipsis & beyond.
	filteredLyrics.length = findEllipsis;

	// See how many lines.
	// console.log("the length is " + filteredLyrics.length);

	selectLines( filteredLyrics );
}

function selectLines( lyrics ) {

	// Set empty array for the final lyric output.
	let finalLyric = [];

	// Choose random line.
	const firstLine = randomNum( lyrics.length );
	const secondLine = firstLine + 1;

	// If lyrics' length is 1 or less, start over.
	if ( lyrics.length <= 1 ) {
		console.log( "There weren't enough lyrics." );
		randomAlbum();
	} // If the selected line is the very last line, run again.
	else if ( firstLine === ( lyrics.length - 1 ) ) {
		selectLines( lyrics );
	} else {
		finalLyric.push(lyrics[firstLine], lyrics[secondLine]);
		finalLyric = finalLyric.join('\n');

		// Call the function that tweets the final lyric.
		saySomething( finalLyric );
	}

}

// Tweet the final lyrics!
function saySomething( finalLyric ) {

	const tweet = {
		status: `"${finalLyric}"`
	}

	T.post('statuses/update', tweet, tweeted);

	// console.log(finalLyric); // for testing

	function tweeted(err, data, response) {
		if (err) {
			console.log( 'Uh oh, something askew.' );
		} else {
			console.log( 'Woo, it worked!' );
		}
	}
}

// 1.) Set how often Spacebot tweets a lyric by kicking off searching for a random album.
setInterval( randomAlbum, tweetInterval );

// 2.) Tweet out a lyric initially when initialized.
randomAlbum();

// Create an event when someone tweets Spacebot.
stream.on('tweet', tweetEvent);

function tweetEvent( babeReminder ) {

	// Create boolean for seeing if it's a reply.
	let isReply = false;

	// Did they @ me?
	const replyTo = babeReminder.in_reply_to_screen_name;

	// Reset boolean to true if they were talking to little ol' Spacebot.
	if ( replyTo === 'HalloSpacebot' ) {
		isReply = true;
	}

	// Content of tweet.
	const content = babeReminder.text.toLowerCase();

	// Who is talking to me?
	const name = babeReminder.user.screen_name;

	// Set response as empty string.
	let response = '';

	// Were they talking to Spacebot? If so, then...
	if ( isReply ) {
		if (content.includes( 'you remind me of the babe' ) ) {
			response = 'What babe?';
		} else if (content.includes( 'what babe' ) ) {
			response = 'The babe with the power.';
		} else if (content.includes( 'the babe with the power' ) ) {
			response = 'What power?';
		} else if (content.includes( 'what power' ) ) {
			response = 'Power of voodoo.';
		} else if (content.includes( 'power of voodoo' ) ) {
			response = 'Who do?';
		} else if (content.includes( 'who do' ) ) {
			response = 'You do.';
		} else if (content.includes( 'you do' ) ) {
			response = 'Do what?';
		} else if (content.includes( 'do what' ) ) {
			response = 'Remind me of the babe.';
		}

		// If it isn't an empty string...respond accordingly.
		if ( response !== '' ) {
			// console.log(response);
			responseTweet('@' + name + ' ' + response);
		}
	}
}

// Tweet it out, loud + proud.
function responseTweet( txt ) {

	// Content of response tweet.
	const tweet = {
		status: txt
	}

	T.post('statuses/update', tweet, tweeted);

	function tweeted(err, data, response) {
		if (err) {
			console.log( 'Oops.' );
		} else {
			console.log( 'Response completed.' );
		}
	}
}
