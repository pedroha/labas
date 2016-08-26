// FAVORITE!!! http://maxogden.com/scraping-with-node.html

// Probably a good one!
// https://www.digitalocean.com/community/tutorials/how-to-use-node-js-request-and-cheerio-to-set-up-simple-web-scraping

var fs = require('fs')
var $ = require('cheerio')
var request = require('request')
var pictureTube = require('picture-tube')

var downloadFile = function(url) {
  	console.log('downloading...' + url)
  	
	var idx = url.lastIndexOf('/')
	if (idx > 0) {
		var resourceName = url.substring(idx+1)
		
		console.log('downloading... ' + resourceName)
		var stream = fs.createWriteStream('images/' + resourceName)
		request
			.get(url)
			.on('error', function(err) {
				console.log(err)
			})
			.pipe(stream)
	}
}

var DOMAIN = 'http://substack.net';

function gotHTML(err, resp, html) {
  if (err) return console.error(err)
  var parsedHTML = $.load(html)
  // get all img tags and loop over them
  var imageURLs = []
  parsedHTML('a').map(function(i, link) {
    var href = $(link).attr('href')
    if (!href.match('.png')) return
    imageURLs.push(DOMAIN + href)
  });

  var randomIndex = Math.floor(Math.random() * imageURLs.length)
  var randomImage = imageURLs[randomIndex]
  console.log('Displaying... ' + randomImage)
  request(randomImage).pipe(pictureTube()).pipe(process.stdout)	

  // imageURLs.forEach(function(url) {
  // 	downloadFile(url);
  // })
}

var domain = 'http://substack.net/images/'
request(domain, gotHTML)
