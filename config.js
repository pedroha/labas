let code = 'lt';
if (process.argv.length > 2) {
    code = process.argv[2]
}

code = code.toUpperCase()

let foundEntry = null
let allLanguages = require('./res/book2-languages')

for (var i = 0; i < allLanguages.length; i++) {
	let entry = allLanguages[i]
	if (entry.code === code) {
		foundEntry = entry
		break
	}
}

if (!foundEntry) {
	console.log("Cannot recognize code " + code)
	console.log("Valid codes: ")

	for (var i = 0; i < allLanguages.length; i++) {
		let entry = allLanguages[i]
		console.log(`${entry.code.toLowerCase()} - ${entry.altEnglish}`)
	}
	process.exit()
}

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
	config = {
		"language": foundEntry.altEnglish.toLowerCase(),
		"code-src": "EM",
		"code-dest": foundEntry.code
	}
	// see if we find the file to load first! then load the file (require: static dependency, not applicable for dynamic!)

	config.loadEntries = function() {
		// TODO: load ONLY if the file exists! (so, make this optional)
		let entries = require(`./res/${config.language}.json`)
		config.entries = expandEntries(entries)		
	}
}

module.exports = config



