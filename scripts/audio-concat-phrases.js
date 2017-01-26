const fs = require('fs')
const mkdirp = require('node-mkdirp')
const audiosprite = require('audiosprite')
const writeFile = require('./utils/write-file')
const beautify = require('json-beautify')

const config = require('./config')
let language = require(`${config.TRANSLATION_PATH}/${config.language}.json`)

const languageCode = config['code-dest']

const SOURCE_DIR = `${config.DOWNLOAD_PATH}/${languageCode}`
const DEST_DIR = `${config.WEB_PATH}/audio/${languageCode}`

mkdirp(DEST_DIR)

var concatAudioAndCompress = function(output, files, callback) { // AND ALSO COMPRESS TO A MUCH SMALLER AUDIO SAMPLE
    let opts = {
        log: 'debug',
        output: output,
        format: 'howler',
        export: 'mp3',    // m4a is waaaay larger than mp3 produced
        vbr: 9,           // As low as quality as we can get
        samplerate: 22050 // Really low quality from 44100
    };
    audiosprite(files, opts, callback)
};

var outputConfig = function(howlerConfig) {
    var output = JSON.stringify(howlerConfig, null, 2, 80)
    output = output.replace(/"urls"/g, '"src"') // howler.js V2.0 format

    fs.writeFileSync(`${DEST_DIR}/howler-config.json`, output)
    // console.log('-------------')
    // console.log(output)
    // console.log('-------------')
};


var howlerConfig = {}

language.forEach(function(chapter, i) {
    let audioCollection = []
    chapter.words.forEach(function(entry, j) {
        let filename = SOURCE_DIR + '/' + entry.a
        console.log(filename)
        audioCollection.push(filename)
    })

    let title = chapter.topic
    i = i + 1 // start from 1, easier to troubleshoot mismatches (with real chapters)
    let suffix = ((i<10)? '00': (i<100)? '0': '') + i
    let output = `${DEST_DIR}/phrases-${suffix}`

    concatAudioAndCompress(output, audioCollection, function(err, settings) {
        if (err) {
            return console.error(err)
        }

        howlerConfig[output] = {
            title,
            settings
        }

        var isLast = (Object.keys(howlerConfig).length == language.length)
        if (isLast) {
            console.log("At Last...")
            outputConfig(howlerConfig);
        }
    })
})
