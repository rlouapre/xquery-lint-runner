/*
 * grunt-xquery-lint-runner
 * https://github.com/rlouapre/xquery-lint-runner
 *
 * Copyright (c) 2014 Richard Louapre
 * Licensed under the MIT license.
 */

'use strict';


module.exports = function(grunt) {

  grunt.registerMultiTask('xquery_lint_runner', 'Grunt plugin for XQuery Lint', function() {
    var verbose = (grunt.option('verbose') !== undefined) ? grunt.option('verbose') : false;
    var async = require('async');
    var _ = require('lodash');
    var request = require('request');
    var Runner = require('./lib/runner');

    // Validate task settings    
    var settings = this.data.settings;
    if (settings === undefined) {
      grunt.fail.fatal('Invalid configuration [settings] should be:\n' + 
        JSON.stringify({settings:{url:'http://localhost:9000',dir:'app/src'}}, null, 2));
    }

    if (verbose) {
      grunt.verbose.writeln('settings \n\n' + JSON.stringify(settings, null, 2));
    }

    if (Runner === undefined) {
      grunt.fail.fatal('Runner is undefined');
    }

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      verbose: verbose
    });
    var runner = new Runner(grunt, options);
    if (runner === undefined) {
      grunt.fail.fatal('runner is undefined');
    }

    settings.path = [settings.path];

    var done = this.async();

    var errorMessage = '';
    var warningMessage = '';
    var successCount = 0;
    var warningCount = 0;
    var errorCount = 0;

    function processPath(dir, callback) {
      var url = runner.getUrl(settings.url, dir);
      if (verbose) {
        grunt.verbose.writeln('url [' + url + ']');
      }
      var req = request.get(url, function(err, response, body) {
        if (response.statusCode === 200) {
          body = JSON.parse(body);
          if (verbose) {
            grunt.verbose.writeln('body \n\n' + JSON.stringify(body, null, 2));
          }
          runner.parse(body, function(results) {
            if (verbose) {
              grunt.verbose.writeln('results \n\n' + JSON.stringify(results, null, 2));
            }
            if (results.errorCount !== 0) {
              errorMessage += 'Error count [' + results.errorCount + ']\n';
              _.each(results.files, function(file) {
                if (file.error !== undefined) {
                  errorMessage += 'File ['+file.src+']\n';
                  errorMessage += 'Message ['+file.error+']\n';
                }
              });
            }
            if (results.errorCount !== 0 || results.warnCount !== 0) {
              warningMessage += 'Warning count [' + results.warnCount + ']\n';
              _.each(results.files, function(file) {
                warningMessage += 'File ['+file.src+']\n';
                _.each(file.rules, function(rule) {
                  if (rule.level === 'error') {
                    errorMessage += 'Rule ['+rule.name+']\n';
                    _.each(rule.sources, function(source){
                      errorMessage += 'Source ['+source+']\n';
                    });
                  }
                  if (rule.level === 'warn') {
                    warningMessage += 'Rule ['+rule.name+']\n';
                    _.each(rule.sources, function(source){
                      warningMessage += 'Source ['+source+']\n';
                    });
                  }
                });
              });
            }
            errorCount += results.errorCount;
            warningCount += results.warnCount;
            successCount += results.successCount;
          });
        } else {
          if (verbose) {
            grunt.verbose.writeln('Request failed \n\n' + JSON.stringify(response.body, null, 2));
          }
          grunt.fail.fatal('Request failed code status [' + response.statusCode + '] for url: ' + url);
        }
        callback();
      });
    }

    async.eachSeries(
      settings.path, 
      processPath,
      function(err) {
        if (verbose) {
          grunt.verbose.writeln('DONE');
        }
        if (warningMessage !== '') {
          grunt.fail.warn(warningMessage);
        }
        if (errorMessage !== '') {
          grunt.fail.fatal(errorMessage);
        }
        grunt.log.writeln('Total success [' + successCount + '] - warning [' + warningCount + '] - error [' + errorCount + ']');
        grunt.log.ok();
        done();
      }
    );

  });

};
