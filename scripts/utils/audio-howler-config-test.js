const howlerConfig = require('../../web/audio/DE/howler-config.json')

let output = JSON.stringify(howlerConfig)

let cleanOutput = output.replace(/\.\/res/g, 'web/audio') // fix relative folder for audio (starting from relative to web/)

console.dir(cleanOutput)

// TODO: modify Howler.js to support option: relativePath to read resources! (Maybe already there!)

