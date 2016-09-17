let inputCode = 'lt';
if (process.argv.length > 2) {
    inputCode = process.argv[2]
}

code = inputCode.toUpperCase()

let foundEntry = null
let languageConfig = require('./config.json')

for (var i = 0; i < languageConfig.length; i++) {
	let entry = languageConfig[i]
	if (entry.code === code) {
		foundEntry = entry
		break
	}
}

if (!foundEntry) {
	console.log("----------------------------------")
	console.log("Cannot recognize code: " + inputCode)
	console.log("----------------------------------")
	console.log("Valid codes: ")

	for (var i = 0; i < languageConfig.length; i++) {
		let entry = languageConfig[i]
		console.log(`${entry.code.toLowerCase()} - ${entry.altEnglish}`)
	}
	console.log("----------------------------------")
	console.log("Cannot recognize code: " + inputCode)
	console.log("----------------------------------")
	process.exit()
}

var expandEntries = function(language) {
    return language.map(function(chapter) {
        let expandedTopic = {
            topic: chapter.topic,
            words: chapter.words.map(function expand(entry) {
                let expanded = {}
                expanded.audio = entry.a,
                expanded.language = entry.l
                if (entry.r) {
                    expanded.readable = entry.r
                }
                expanded.translation = entry.t
                return expanded
            })
        }
        return expandedTopic
    })    
}

let config = null

if (foundEntry) {
	/*
	From:
	  {
	    "altEnglish": "Lithuanian",
	    "language": "lietuvių",
	    "code": "LT",
	    "img": "lithuania.png",
	    "link": "http://www.goethe-verlag.com/book2/LT/"
	  },

	to:
	{
		"language": "lithuanian",
		"code-src": "EM",
		"code-dest" : "LT"
	}
	*/
	config = {
		"language": foundEntry.altEnglish.toLowerCase(),
		"code-src": "EM",
		"code-dest": foundEntry.code
	}

	config.loadEntries = function() {
		let entries = require(`./res/${config.language}.json`)
		config.entries = expandEntries(entries)		
	}

	config.convertAudioUrls = function(audioBaseUrl, convertToFullUrl) {
		let wordEntries = config.entries

	    var transformAudioEntry = function(transform) {
	        wordEntries.map(function(topic) {
	            topic.words.map(transform)
	        })
	    }

	    var fullAudioUrlTransform = function(entry) {
	        entry.audio = audioBaseUrl + '/' + entry.audio
	    }

	    var audioIdTransform = function(entry) {
	        var idx = entry.audio.indexOf('.')
	        entry.audio = entry.audio.substr(0, idx)
	    }
	    var transform = convertToFullUrl? fullAudioUrlTransform : audioIdTransform
	    transformAudioEntry(transform)
	}
}

module.exports = config

