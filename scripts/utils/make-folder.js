'use strict'

let fs = require('fs')

let createFolder = function(path) {
  fs.mkdir(path, function(err) {
    if (err) {
      console.error(err);
    }
    console.log("Directory created successfully!");
  })
}

let makeFolder = function(path, continueFn) {
  // Create /audio if it doesn't exist already
  fs.readdir(path, function(err, files) {
    if (err) {
      createFolder(path)
    }
    // files.forEach(function(file){
    //   console.log( file );
    // });
    if (typeof continueFn === 'function') {
      continueFn()
    }
  })  
}

module.exports = makeFolder