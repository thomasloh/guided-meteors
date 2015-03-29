'use strict';
var scaffolder = require('./grunt/config/scaffolder/main');

module.exports = function (grunt) {

  grunt.registerTask('scaffold', 'Scaffolds a component', scaffolder.component);

};

