console.log("This is a bot");

// Require twit package.
var Twit = require( 'twit' );

// Require axios package.
var axios = require( 'axios' );

// Config file with account-specific secret keys.
var config = require( './config' );

// Pass object to twit package.
var T = new Twit(config);

// Variable for key.
const key = config.key;

// Variable for Artist ID.
const artist = '431';

// Config file for discography info.
const albums = require( './discog' );

// Calculate a random index for album list.
function randomAlbum() {

	// Assign variable to number of total albums.
	const length = albums.length;

	// Return random number from how many albums available.
	const random = Math.floor( Math.random() * length );

	// Get randomly chosen album & assign variable to ID.
	const albumID = albums[random].id;

	console.log(`My album number is ${albumID}`);

	getAlbumInfo( albumID );
}

function getAlbumInfo( albumID ) {

	// Make a request.
	axios.get(`https://api.musixmatch.com/ws/1.1/album.tracks.get?format=json&callback=callback&album_id=${albumID}&f_has_lyrics=true&apikey=${key}`)
		.then(function (response) {

			// List of tracks within album.
			const trackList = response.data.message.body.track_list;

			console.log('calling track list');

			randomTrack( trackList );
		})
		.catch(function (error) {
			console.log(error);
		});
}

// Calculate a random index for track list.
function randomTrack( trackList ) {

	// Assign variable to number of tracks in particular album.
	const length = trackList.length;

	// Return random number from how many tracks available.
	const random = Math.floor( Math.random() * length );

	// Get randomly chosen track & assign variable to ID.
	const trackID = trackList[random].track.track_id;

	console.log(`My track number is ${trackID}`);

	getLyrics( trackID );
}

// Get the actual lyrics using the trackID.
function getLyrics( trackID ) {

	// Make a request.
	axios.get(`https://api.musixmatch.com/ws/1.1/track.lyrics.get?format=json&callback=callback&track_id=${trackID}&apikey=${key}`)
		.then(function (response) {

			// Assign variable to lyrics request to make less unwieldy.
			const lyricRequest = response.data.message.body.lyrics.lyrics_body;

			// If there are no lyrics as data, rerun process to get new random album, etc.
			let snippet = lyricRequest !== "" ? lyricRequest : randomAlbum();

			formatLyrics( snippet );
		})
		.catch(function (error) {
			console.log(error);
		});
}

function formatLyrics( snippet ) {

	// Set empty array for the final lyric output.
	let finalLyric = [];

	// Split at line breaks.
	snippet = snippet.split( '\n' );

	// Assign variable to filtered snippet after removing blank lines from data.
	let filteredLyrics = snippet.filter( (line) => line !== '' );

	// Figures out index where ellipsis begins.
	const findEllipsis = filteredLyrics.indexOf( '...' );

	// Chops eveything ellipsis & beyond.
	filteredLyrics.length = findEllipsis;

	// See how many lines.
	console.log("the length is " + filteredLyrics.length);

	// Choose random line.
	const firstLine = Math.floor( Math.random() * filteredLyrics.length );
	const secondLine = firstLine + 1;

	if ( firstLine === filteredLyrics.length ) {
		firstLine--;
	} else {
		firstLine;
	}

	finalLyric.push(filteredLyrics[firstLine], filteredLyrics[secondLine]);
	finalLyric = finalLyric.join('\n');
	console.log(finalLyric);
}

randomAlbum();

// **
// saySomething();
// setInterval(saySomething, 1000*20);

// // If you want to tweet something...
// function saySomething() {

// 	var tweet = {
// 		status: 'Hallo Spacebot'
// 	}

// 	T.post('statuses/update', tweet, tweeted);

// 	function tweeted(err, data, response) {
// 		if (err) {
// 			console.log( 'Something went wrong!' );
// 		} else {
// 			console.log( 'It worked!' );
// 		}
// 	}
// }

// Parameters
// var params = {
// 	q: 'bowie',
// 	count: 2
// }

// // Get request.
// T.get('search/tweets', params, gotData);

// function gotData(err, data, response) {
// 	var tweets = data.statuses;
// 	for (var i = 0; i < tweets.length; i++) {
// 		console.log(tweets[i].text);
// 	}
// }
