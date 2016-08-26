'use strict'

var fs = require('fs')

var writeFileSync = function(path, content, continuationFn) {
	fs.writeFileSync(path, content);
	console.log(`File ${path} has been written`)

	if (typeof continuationFn === 'function') {
		continuationFn()
	}
}

module.exports = writeFileSync