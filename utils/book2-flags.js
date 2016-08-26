const fs = require('fs')
const $ = require('cheerio')
const beautify = require("json-beautify")

let html = fs.readFileSync('../res/html/flags.html')
let parsedHTML = $.load(html)

let sel = 'tr'
let entries = []

parsedHTML(sel).each(function(i, row) {
	let $img = $(this).find('img')

	let src = $img.attr('src')
	src = src.substr(src.lastIndexOf('/')+1)

	let altEnglish = $img.attr('alt')

	let columns = $(this).children() 
	let code = $(columns[1]).text()

	let $lastColumn = $(columns[2])

	let link = $lastColumn.find('a').attr('href')
	let language = $lastColumn.text()

	// console.log(code, altEnglish, src, language, link)

	let entry = {
		altEnglish,
		language,
		code,
		img: src,
		link
	}
	entries.push(entry)
});

var json = beautify(entries, null, 2, 120)
console.log(json)
