import {
  getContext,
  TestModule,
  TestModuleForModel,
  TestModuleForComponent,
  setResolver
} from 'ember-test-helpers';

import Ember from 'ember';

function injector(ModuleConstructor, moduleName, options) {
  var module = new ModuleConstructor(moduleName, options);

  beforeEach(function(done) {
    var self = this;
    return module.setup().then(function() {
      var context = getContext();
      var keys = Ember.keys(context);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        self[key] = context[key];
      }
      done();
    });
  });

  afterEach(function(done) {
    module.teardown().then(() => done());
  });
}
function injectHelpers(moduleName, options) {
  injector(TestModule, moduleName, options);
}

function injectModelHelpers(moduleName, options) {
  injector(TestModuleForModel, moduleName, options);
}

function injectComponentHelpers(componentName, options) {
  injector(TestModuleForComponent, componentName, options);
}

export {
  setResolver,
  injectHelpers,
  injectModelHelpers,
  injectComponentHelpers,
}
