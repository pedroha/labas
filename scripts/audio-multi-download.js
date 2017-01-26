const downloadAudios = require('./audio-download').downloadAudios
const config = require('./config')

var languageData
try {
	languageData = require(`${config.TRANSLATION_PATH}/${config.language}.json`)
	console.log(languageData);
}
catch (e) {
	console.log('--- RUN FIRST ---')
	console.log('node phrase-scraper <language code>')
	console.log('-----------')
	return
}

// Downloading audio resources is so fast that the server might time out (too many requests at once)
// We could request a little more slowly (throttle it)
// Or we can re-try the failed requests (sometimes, we get corrupted files that are usually very short, like few bytes)
// I like speed, so I'd rather retry (usually after three retrials, I get all the audio resources)

const numMaxTrials = 5

for (let i = 0; i < numMaxTrials; i++) {
	var stats = downloadAudios(languageData)
	console.log(stats.previouslyDownloadedFileCount, stats.totalFileCount)

	if (stats.previouslyDownloadedFileCount === stats.totalFileCount) {
		console.log(`We have downloaded all files by iteration ${i}`)
		break
	}
	else {
		console.log(`We have downloaded ${stats.previouslyDownloadedFileCount} out of ${stats.totalFileCount}`)
	}
}
