'use strict'

const fs = require('fs')
const request = require('request')
const $ = require('cheerio')
const mkdirp = require('node-mkdirp')
const beautify = require('json-beautify')
const config = require('./config')

// console.log("phrase.scraper.config", config)

// var str = `${config['code-src']}`
// console.log(str)

// str =`${config['code-src']}${config['code-dest']}002.HTM`
// console.log(str)

const processFirstTopicOnly = false; // DEBUGGING

const downloadAudioFolder = 'web/audio'
const downloadAudio = false
const outputHint = false
const compressed = true

const CHAPTER_NUM = 100
var database = []
let processedTopicCount = 0

const LANGUAGE_PREFIX = `${config['code-src']}${config['code-dest']}`
const BOOK_BASE_URL = `http://www.goethe-verlag.com/book2/EM/${LANGUAGE_PREFIX}/`


var downloadFile = function(url, path) { // only used for downloading audio files
    console.log('downloading... ' + url)

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

var downloadAudioResource = function(url, folder) {
  var name = getFileName(url)
  if (name) {
    var isAudioFile = (name && name.substring(name.length-4) === '.mp3')
    if (isAudioFile) {
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
          }
        }
      })
    }
  }
}

var checkFinalCount = function() {
  if (processedTopicCount !== CHAPTER_NUM) {
    console.log('It looks like we are missing some topics!')

    let chapters = new Set()

    for (let i = 0; i < database.length; i++) {
      let chapter = database[i]
      console.log(chapter.topic)

      let tokens = chapter.topic.split(' ')
      chapters.add(parseInt(tokens[0]))
    }

    for (let i = 0; i < CHAPTER_NUM; i++) {
      if (!chapters.has(i+1)) { // chapters start at 1 to 100
        console.log('Missing chapter: ' + i)
      }
    }
  }
  else {
    console.log("Final count matches!!! Congrats! Let's breathe")
  }
}

var outputDatabase = function() {
  var sorted = database.sort(function(right, left) {
    var a = parseInt(right.topic)
    var b = parseInt(left.topic)
    return a - b
  })
  // var json = JSON.stringify(sorted)
  var json = beautify(sorted, null, 2, 120)
  console.log(json)

  const databaseFilename = `${config.language}.json`
  fs.writeFileSync('res/' + databaseFilename, json)
}

var makeEntry = function(compressed, readable, translation, language, src) {
  let entry

  if (compressed) {
    if (readable) {
      entry = {
        t: translation,
        l: language,
        r: readable,
        a: getFileName(src)
      }
    }
    else {
      entry = {
        t: translation,
        l: language,
        a: getFileName(src)
      }
    }
  }
  else {
    if (readable) {
      entry = {
        translation,
        language,
        readable,
        audio: getFileName(src)
      }
    }
    else {
      entry = {
        translation,
        language,
        audio: getFileName(src)
      }    
    }
  }

  if (outputHint) {
    entry.hint = hint
  }
  console.log(translation, language, src)

  return entry
}

var collectEntry = function(src, $audio) {
  let columns = $audio.parent().parent().siblings()
  let translation = $(columns[0]).text().trim()
  let languageNodes = $($(columns[1]).children()[0]).children()
  let language = ''
  let readable = ''
  let hint = ''

  if (languageNodes && languageNodes.length > 1) {
    hint = $(languageNodes[0]).text().trim()

    language = $(languageNodes[1]).text().trim()

    if (/\r\n\r\n/.test(language)) {
      let pieces = language.split('\r\n\r\n')
      language = pieces[0]
      readable = pieces[1]
    }
  }
  else {
    language = $(columns[0]).text().trim()

    // Hack for the English language, on the other side of the table!
    let $tableRow = $(columns[0]).closest('tr')
    let index = $tableRow.index()
    let $firstInRow = $($tableRow.closest('div.row').children()[0])
    let spans = $firstInRow.find('span')
    translation = $(spans[index]).text().trim()
  }

  return makeEntry(compressed, readable, translation, language, src)
}

var updateDatabase = function(topic, words) {
  database.push({
    topic,
    words
  })
  processedTopicCount++

  if (processedTopicCount === CHAPTER_NUM) {
    outputDatabase()
  }
}

var parseTopicPage = function(html, topic) {
  console.log('getTopicPage: ' + topic)

  let parsedHTML = $.load(html)
  let words = []

  let sel = 'audio > source'
  parsedHTML(sel).each(function(i, audio) {
    let $audio = $(audio)
    let src = $audio.attr('src')
    console.log('adding... ' + src)

    if (downloadAudio) {
      downloadAudioResource(src, downloadAudioFolder)
    }
    let entry = collectEntry(src, $audio)
    words.push(entry)
  })
  updateDatabase(topic, words)
}

var getTopicPage = function(topic) {
  return function(err, resp, html) {
    if (err) return console.error(err)

    parseTopicPage(html, topic)
  }
}

var findTopic = function(topic) {
  for (let i = 0; i < database.length; i++) {
    var entry = database[i]
    if (entry.topic === topic) {
      return true
    }
  }
  return false
}

var processTopic = function(relativeUrl, topic) {
  var url = BOOK_BASE_URL + relativeUrl
  console.log(url)

  if (!findTopic(topic)) {
    request(url, getTopicPage(topic))
  }
}

var getIndex = function(err, resp, html) {
  if (err) return console.error(err)
  var parsedHTML = $.load(html)
  var topicLinks = []
  var topics = []
  // var sel = 'div.Styl39 > a'
  // var sel = 'div.col-md-4 > a'
  var sel = 'div.col-md-4 > div > a'

  parsedHTML(sel).each(function(i, link) {
    var href = $(link).attr('href')
    var topic = $(link).text().trim()
    console.log('adding... ' + topic + ' : ' + href)
    topicLinks.push(href)
    topics.push(topic)
  })

  // var cnt = 0;
  // topicLinks.forEach(function(url) {
  //   var isLast = (cnt === topics.length-1)
  //   processTopic(url, topics[cnt], isLast)
  //   cnt++;
  // })
  if (processFirstTopicOnly) {
    processTopic(topicLinks[0], topics[0], true)
  }
  else {
    for (let i = 0; i < topicLinks.length; i++) {
      processTopic(topicLinks[i], topics[i])
    }
  }
}

var main = true;

if (typeof main !== 'undefined') {
  mkdirp(downloadAudioFolder, function(err) {
    if (err) console.error(err)
    else console.log('pow!')
  })

  var page = LANGUAGE_PREFIX + '002.HTM'
  var bookIndexUrl = BOOK_BASE_URL + page
  request(bookIndexUrl, getIndex)

  setTimeout(checkFinalCount, 5000) // 5 seconds seems to work fine
}

// fs.readFile('./res/html/ENLT002.HTM', function (err, data) {
//   if (err) throw err
//   console.log(data)
//   getIndex(null, null, data)
// })

// For testing topic page

// var html = fs.readFileSync('./res/html/ENLT003.HTM', 'utf8')
// parseTopicPage(html, '1 Family')
