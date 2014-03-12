/*
 * grunt-xquery-lint-runner
 * https://github.com/rlouapre/xray-runner
 *
 * Copyright (c) 2014 Richard Louapre
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('lodash');
var url = require('url');

function Runner(grunt, options) {
  this.options = options;
  this.grunt = grunt;
};

Runner.prototype.options = {};

Runner.prototype.grunt = {};

Runner.prototype.Rule = function(name, level, occurence) {
  this.name = name;
  this.level = level;
  this.occurence = occurence;
  this.sources = [];
  this.addSource = function(source) {
    this.sources.push(source);
  };
};

Runner.prototype.Lints = function() {
  this.lints = [];
  this.addLint = function(lint) {
    this.lints.push(lint);
  };
};

Runner.prototype.Lint =  function(src) {
  this.src = src;
  this.rules = [];
  this.setError = function(error) {
    this.error = error;
  };
  this.addRule = function(rule) {
    this.rules.push(rule);
  };
};

Runner.prototype.getUrl = function(urlBase, dir) {
  var tempUrl = url.parse(urlBase);
  tempUrl.pathname = 'lint';
  tempUrl.query = { 'dir': dir, 'format': 'json' };
  return url.format(tempUrl);
};

Runner.prototype.parse = function(lints, callback) {
  var _this = this;
  var results = {
    files: []
  }, errorCount = 0, warnCount = 0, successCount = 0;
  _.each(lints.lints.lint, function(lint) {
    if (lint.src === undefined) {
      _this.grunt.fail.fatal('Missing src attribute. Invalid format.');
      _this.grunt.log.debug(lint);
    }
    _this.grunt.verbose.debug(JSON.stringify(lint, null, 2));
    var _file = {
      src: lint.src,
      rules: []
    };
    // All good
    if (lint.error === undefined && lint.rule === undefined) {
      successCount++;
    }
    if (lint.error !== undefined) {
      errorCount++;
      _file.error = 'Lint error: ' + lint.error;
    }
    _.each(lint.rule, function(rule) {
      var _rule = {
        name: rule.name,
        level: rule.level,
        occurrences: parseInt(rule.occurrences)
      };
      if (rule.level === 'error') {
        errorCount++;
        _rule.message = 'Rule error: ' + rule.name;
      } else if (rule.level === 'warn') {
        warnCount++;
        _rule.message = 'Rule warning: ' + rule.name;
      }
      _rule.sources = rule.source;
      _file.rules.push(_rule);
    });
    results.files.push(_file);
  });
  results.errorCount = errorCount;
  results.warnCount = warnCount;
  results.successCount = successCount;
  callback(results);
};

Runner.prototype.lint = function(data, callback) {
  var _this = this;
  this.parse(data, function(results) {
    var report = {
      errorMessages: [],
      warningMessages: []
    };
    if (_this.options.verbose) {
      _this.grunt.verbose.writeln('results \n\n' + JSON.stringify(results, null, 2));
    }
    if (results.errorCount !== 0 || results.warnCount !== 0) {
      _.each(results.files, function(file) {
        if (file.error !== undefined) {
          report.errorMessages.push({file: file.src, message: file.error});
        }
        _.each(file.rules, function(rule) {
          if (rule.level === 'error') {
            report.warningMessages.push({file: file.src, message: rule.name, sources: rule.sources});
          }
          if (rule.level === 'warn') {
            report.warningMessages.push({file: file.src, message: rule.name, sources: rule.sources});
          }
        });
      });
    }
    report.errorCount = results.errorCount;
    report.warningCount = results.warnCount;
    report.successCount = results.successCount;
    callback(report);
  });
};          

module.exports = Runner;