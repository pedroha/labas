const fs = require('fs')
const request = require('request')
const $ = require('cheerio')
const mkdirp = require('node-mkdirp')
const beautify = require("json-beautify");

const downloadAudioFolder = 'web/audio'
const downloadAudio = true;
const outputHint = false;
const compressed = true;
