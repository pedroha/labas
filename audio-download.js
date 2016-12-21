const fs = require('fs')
const mkdirp = require('node-mkdirp')
const request = require('request')
const config = require('./config')

let previouslyDownloadedFileCount = 0;

// const beautify = require('json-beautify')
// var json = beautify(language, null, 2, 120)
// console.log(json)

// http://www.book2.nl/book2/LT/SOUND/
// http://www.book2.nl/book2/LT/SOUND/1115.mp3

var TEST = false;

var downloadFile = function(url, path) {
    console.log('downloading... ' + url)

    if (TEST) {
        return        
    }

    var stream = fs.createWriteStream(path)
    request
        .get(url)
        .on('error', function(err) {
            console.log(err)
        })
        .pipe(stream)
}

var getFileName = function(url) {
    var name = null
    var idx = url.lastIndexOf('/')
    if (idx > 0) {
        name = url.substring(idx+1)
    }
    return name
}

var isMp3 = function(name) {
    return (name && name.substring(name.length-4) === '.mp3')
}

var downloadAudioResource = function(url, folder) {
    var name = getFileName(url)

    if (isMp3(name)) {
        var path = folder + '/' + name

        fs.access(path, fs.R_OK, (err) => {
            if (err) { // We don't have it yet, so let's get it!
                downloadFile(url, path)
            }
            else {
                // Sometimes, we get: { [Error: socket hang up] code: 'ECONNRESET' }
                var stats = fs.statSync(path)
                if (stats["size"] < 10) { // Retry download
                    console.log('File size is 0: ' + name)
                    downloadFile(url, path)
                }
                else {
                    console.log('We already have this audio file: ' + name)
                    previouslyDownloadedFileCount++;
                }
            }
        })
    }
}

var iterateForEntry = function(topicList, processEntry) {
    let cnt = 0;
    for (let i = 0; i < topicList.length; i++) {
        let topic = topicList[i];
        for (let j = 0; j < topic.words.length; j++) {
            let entry = topic.words[j];
            processEntry(entry, 10 * cnt);
            cnt++;
        }
    }    
}

var downloadAudios = function(languageDatabase) {
    let langCodeFolder = `${config['code-dest']}`
    let destFolder = `./download/${langCodeFolder}`
    let totalFileCount = 0

    mkdirp(destFolder)

    let processEntry = (function(langCodeFolder) {
        return function(entry, waitTime) {
            setTimeout(function() {
                let url = `http://www.book2.nl/book2/${config['code-dest']}/SOUND/${entry.a}`
                downloadAudioResource(url, destFolder)
                totalFileCount++                
            }, waitTime)
        }
    })(langCodeFolder)

    previouslyDownloadedFileCount = 0
    iterateForEntry(languageDatabase, processEntry)

    console.log(`Already downloaded ${previouslyDownloadedFileCount} from a total of ${totalFileCount}`)

    return {
        previouslyDownloadedFileCount: previouslyDownloadedFileCount,
        totalFileCount: totalFileCount
    }
}

module.exports = {
    downloadAudios: downloadAudios
}
