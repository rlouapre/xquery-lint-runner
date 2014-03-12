/*global beforeEach:false, describe:false, it:false */
'use strict';

var expect = require('chai').expect;
var grunt = require('grunt');
var Runner = require('./../tasks/lib/runner');

describe('xquery_lint_runner', function () {
  var runner;
    beforeEach(function() {
      runner = new Runner(grunt, {});
    });

    it('should find 2 success, 0 warning, 0 error', function() {
        var lints = grunt.file.readJSON('test/fixtures/lints-successful.json');
        runner.parse(lints, function(results) {
          expect(results.successCount).to.equal(2);
          expect(results.warnCount).to.equal(0);
          expect(results.errorCount).to.equal(0);
          // grunt.log.ok(JSON.stringify(results, null, 2));
        });
    });

    it('should find 1 error and validate error message', function() {
        var lints = grunt.file.readJSON('test/fixtures/lints-1.json');
        runner.parse(lints, function(results) {
          expect(results.successCount).to.equal(1);
          expect(results.warnCount).to.equal(0);
          expect(results.errorCount).to.equal(1);
          expect(results.files[1].error).to.match(/^Lint error: /);
        });
    });

    it('should find 1 warning and validate rule warning message', function() {
        var lints = grunt.file.readJSON('test/fixtures/lints-2.json');
        runner.parse(lints, function(results) {
          expect(results.successCount).to.equal(0);
          expect(results.warnCount).to.equal(1);
          expect(results.errorCount).to.equal(0);
          expect(results.files[0].rules[0].message).to.match(/^Rule warning: /);
        });
    });

    it('should find 1 error and validate rule error message', function() {
        var lints = grunt.file.readJSON('test/fixtures/lints-3.json');
        runner.parse(lints, function(results) {
          expect(results.successCount).to.equal(0);
          expect(results.warnCount).to.equal(0);
          expect(results.errorCount).to.equal(1);
          expect(results.files[0].rules[0].message).to.match(/^Rule error: /);
        });
    });

    it('should find 0 success, 1 warning, 0 error', function() {
        var lints = grunt.file.readJSON('test/fixtures/lints-4.json');
        runner.lint(lints, function(results) {
          // grunt.log.ok('RESULTS\n\n' + JSON.stringify(results, null, 2));
          expect(results.successCount).to.equal(3);
          expect(results.warningCount).to.equal(0);
          expect(results.errorCount).to.equal(5);
          expect(results.errorMessages.length).to.equal(5);
        });
    });

    it('should find 0 success, 6 warning, 0 error and multiple rules', function() {
        var lints = grunt.file.readJSON('test/fixtures/lints-multiple-rules.json');
        runner.parse(lints, function(results) {
          expect(results.successCount).to.equal(0);
          expect(results.warnCount).to.equal(6);
          expect(results.errorCount).to.equal(0);
          // grunt.log.ok(JSON.stringify(results, null, 2));
          expect(results.files[0].rules.length).to.equal(1);
          // grunt.log.ok(JSON.stringify(results.files[0].rules[0], null, 2));
          expect(results.files[0].rules[0].occurrences).to.equal(1);
          expect(results.files[0].rules[0].sources.length).to.equal(1);
          expect(results.files[1].rules.length).to.equal(5);
          expect(results.files[1].rules[0].occurrences).to.equal(3);
          expect(results.files[1].rules[0].sources.length).to.equal(3);
          // expect(results.files[1].error).to.match(/^Lint error: /);
        });
    });
});
