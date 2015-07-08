/* jshint node: true */
'use strict';

var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');
var path = require('path');
var jshintTrees = require('broccoli-jshint');
var fs = require('fs');
var _ = require('lodash');

JasmineHinter.prototype = Object.create(jshintTrees.prototype);
JasmineHinter.prototype.constructor = JasmineHinter;
function JasmineHinter (inputTree, options) {
  if (!(this instanceof JasmineHinter)) return new JasmineHinter(inputTree, options);

  jshintTrees.call(this, inputTree, options);
  this.jshintErrors = {};
}

JasmineHinter.prototype.processErrors = function(relativePath, jshintErrors) {
  if(jshintErrors.length == 0) {return;}

  if(this.jshintErrors.hasOwnProperty(relativePath)) {
    this.jshintErrors[relativePath] = this.jshintErrors[relativePath].concat(jshintErrors);
  } else {
    this.jshintErrors[relativePath] = jshintErrors;
  }
};

JasmineHinter.prototype.write = function (readTree, destDir) {
  var self = this;
  return jshintTrees.prototype.write.call(this, readTree, destDir).finally(function() {
    var itStrings = _.map(self.jshintErrors, function(errors, relativePath) {
      var expectations = 'expect(true).toBeTruthy()';

      if(errors.length != 0) {
        expectations = _.map(errors, function(error) {
          if(error === null) { return; }

          return 'expect(\"'+ relativePath + '@' + error.line + ':' + error.character + ' ' + error.reason + '\").toBeUndefined();';
        }).join('\n');
      }


      return 'it(\'passes for ' + relativePath + '\', function() {' + expectations + '});'
    });

    var specString = 'describe(\'jshint\', function() {' +
      itStrings.join('\n') +
    '});';

    var jshintSpecPath = path.join(destDir, 'jshint-spec.js');
    fs.writeFileSync(jshintSpecPath, specString);
  })
};

module.exports = {
  name: 'ember-cli-jasmine',

  overrideTestCommandFilter: function() {
    var TestCommand = this.project.require('ember-cli/lib/commands/test');

    TestCommand.prototype.buildTestPageQueryString = function(options) {
      var queryString = '';

      if (options.filter) {
        queryString = "grep=" + options.filter;

        if (options.invert) {
          queryString += '&invert=1';
        }
      }

      return queryString;
    };
  },

  init: function() {
    this.overrideTestCommandFilter();
  },

  included: function(app) {
    this._super.included(app);
    this.jshintrc = app.options.jshintrc;

    if(app.tests) {
      app.import('./vendor/ember-test-helpers-tests.amd.js', {type: 'test'});

      var jasmineDir = app.bowerDirectory + '/jasmine/lib/jasmine-core';
      app.import(jasmineDir + '/jasmine.css', {type: 'test'});
      app.import(jasmineDir + '/jasmine.js', {type: 'test'});
      app.import(jasmineDir + '/jasmine-html.js', {type: 'test'});

      app.import('./vendor/jasmine/lib/jasmine-core' + '/boot.js', {type: 'test'});
    }
  },

  contentFor: function(type) {
    if (type === 'test-body') {
      return this.testBodyTemplate();
    }
  },

  testBodyTemplate: function() {
    return fs.readFileSync(path.join(__dirname, 'templates', 'test-body.html'));
  },

  postprocessTree: function(type, tree) {
    if(type != 'all') {
      return tree;
    }

    var inputPath = __dirname + '/vendor/ember-cli-jasmine';
    var testLoaderPath = this.app.options.outputPaths.testSupport.js.testLoader;
    var destPath = path.dirname(testLoaderPath);
    var testLoader = new Funnel(inputPath, {
      files: ['test-loader.js'],
      destDir: destPath
    });

    var tree = mergeTrees([tree, testLoader], {
      overwrite: true,
      description: 'jasmine test loader'
    });

    return tree;
  },

  lintTree: function(type, tree) {
    return JasmineHinter(tree, {
      jshintrcPath: this.jshintrc[type],
      description: 'JSHint ' + type + '- Jasmine',
      disableTestGenerator: true
    });
  }
};
