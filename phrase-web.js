'use strict';

const hogan = require("hogan.js");
const mkdirp = require('node-mkdirp')
const writeFile = require('./utils/write-file')
const config = require('./config')

config.loadEntries()

var convertAudios = function(language, convertToFullUrl) {
    const audioBaseUrl = 'audio'

    var transformAudioEntry = function(transform) {
        language.map(function(topic) {
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

let templates = {}

templates['page'] = 
`
<!DOCTYPE html>
<html>
<head>
    <title>Labas!</title>
    <meta charset="utf-8" />
    <meta name="description" content="{{head.content}}">
    <link rel="stylesheet" type="text/css" href="css/app.css">
</head>
<body>
<!-- Based on resources from: Goethe-Verlag and www.50languages.com -->
    <h2>Phrases in {{languageCapitalized}}</h2>

    <ul class='phrases'>
    {{{ phrases }}}
    </ul>
    <script src="js/jquery.js"></script>
    <script src="js/howler.min.js"></script>
    <script>
        var language = '{{language}}';
    </script>
    <script src="js/sounds-config.js"></script>
    <script src="js/media-player.js"></script>
    <script src="js/lesson-player.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
`

templates['topic'] = 
`
    <li data-chapter="{{chapter}}">
        <h3>{{topic}}</h3>
        <ul>
        {{#words}}
            {{>entry}}
        {{/words}}
        </ul>
    </li>
`

templates['entry'] = 
`<li data-audio="{{audio}}">
    <dl>
    {{#readable}}
        <dt>{{language}} ## {{readable}}</dt>
    {{/readable}}
    {{^readable}}
        <dt>{{language}}</dt>
    {{/readable}}
        <dd>{{translation}}</dd>
    </dl>
</li>
`
// <audio>
//     <source src="{{audio}}" type="audio/mpeg" />
// </audio>

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1)
}

let buildWebPage = function(config, wordEntries) {
    let topicTpl = hogan.compile(templates['topic'])
    let i = 1

    let topics = wordEntries.map(function(topic) {
        let suffix = ((i<10)? '00': (i<100)? '0': '') + i
        i++
        topic.chapter = 'phrases-' + suffix
        return topicTpl.render(topic, {entry: templates['entry']})
    })

    let pageTpl = hogan.compile(templates['page'])
    let rendered = pageTpl.render({
        head: {
            content: 'Goethe-Verlag and www.50languages.com'
        }, // meta stuff, like 'title' and so on
        phrases: topics.join(''),
        language: config.language,
        languageCapitalized: config.language.capitalize()
    }).trim()
    // console.log(rendered)

    mkdirp('web', function(err) {
      if (err) console.error(err)
      else console.log('pow!')
    })
    const htmlFilename = `${config.language}.html`
    writeFile(`web/${htmlFilename}`, rendered)
}

let wordEntries = config.entries;
// language = language.splice(0, 5)
// console.log(JSON.stringify(language))

convertAudios(wordEntries)
buildWebPage(config, wordEntries)
