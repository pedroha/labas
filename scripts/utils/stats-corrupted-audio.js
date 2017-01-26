var fs = require('fs')

var path = './utils/1998.mp3'
var stats = fs.statSync(path)
console.log(JSON.stringify(stats))
