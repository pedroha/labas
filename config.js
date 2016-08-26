let language = 'lt';
if (process.argv.length > 2) {
    language = process.argv[2]
}
let config = require(`./res/config-${language}.json`)

module.exports = config
