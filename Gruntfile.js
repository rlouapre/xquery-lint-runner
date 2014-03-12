/*
 * grunt-xquery-lint-runner
 * https://github.com/rlouapre/xquery-lint-runner
 *
 * Copyright (c) 2014 Richard Louapre
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js'
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
    },

    // Configuration to be run (and then tested).
    xquery_lint_runner: {
      test_default: {
        settings: {
          url: 'http://localhost:9015',
          path: ['app/lib/test/plugins']
          // path: ['app/lib/test']
        }
      },
      test_1: {
        settings: {
          url: 'http://localhost:9015',
          path: ['_framework/lib/xquery-lint/test']
        }
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mocha-test');

  // plugin's task(s), then test the result.
  grunt.registerTask('integration-test', ['clean', 'xquery_lint_runner', 'mochaTest']);

  grunt.registerTask('test', ['clean', 'mochaTest']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
