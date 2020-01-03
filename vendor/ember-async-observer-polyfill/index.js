/* globals Ember */
/* eslint-disable ember/new-module-imports */

import { assert } from '@ember/debug';

(() => {
  let originalObserver = Ember.observer;

  Ember.observer = function(...observerArgs) {
    let funcOrDef = observerArgs.pop();

    assert(
      'observer must be provided a function or an observer definition',
      typeof funcOrDef === 'function' || (typeof funcOrDef === 'object' && funcOrDef !== null)
    );

    let isRFC494API = typeof funcOrDef === 'object' && funcOrDef !== null;
    assert(
      'observer called without sync',
      isRFC494API !== true || typeof funcOrDef.sync === 'boolean'
    );

    if (isRFC494API) {
      let { dependentKeys, fn, sync } = funcOrDef;

      return originalObserver.apply(Ember, [
        ...dependentKeys,
        function(...args) {
          if (sync) {
            fn.apply(this, args);
          } else {
            // using Ember.run.backburner.schedule instead of Ember.run.schedule specifically to ensure
            // that the autorun assertion (only present in Ember < 3.4) does not get fired for async
            // observers
            Ember.run.backburner.schedule('actions', this, fn, ...args);
          }
        },
      ]);
    } else {
      return originalObserver.apply(Ember, arguments);
    }
  };
})();
