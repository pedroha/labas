// var cheerio = require('cheerio'),
//     $ = cheerio.load('<h2 class = "title">Hello world</h2>');

// $('h2.title').text('Hello there!');
// $('h2').addClass('welcome');

// $.html();
// // => <h2 class = "title welcome">Hello there!</h2>

// https://www.sitepoint.com/web-scraping-in-node-js/

var request = require("request");
var cheerio = require("cheerio");

request({
  uri: "http://www.sitepoint.com",
}, function(error, response, body) {
  var cnt = 0;
  var $ = cheerio.load(body);
  // var selector = 'section.article_header > a'; // not matching!
  var selector = 'h1.article_title > a';

  //$(".entry-title > a").each(function() {
  $(selector).each(function() {
    var link = $(this);
    var text = link.text();
    var href = link.attr("href");

    console.log(cnt, text + " -> " + href);
    cnt++;
  });
});

// https://scotch.io/tutorials/scraping-the-web-with-node-js
