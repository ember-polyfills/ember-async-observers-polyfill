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

    if (typeof funcOrDef === 'object' && funcOrDef !== null && funcOrDef.sync === false) {
      let { dependentKeys, fn } = funcOrDef;

      return originalObserver.apply(Ember, [
        ...dependentKeys,
        function(...args) {
          Ember.run.schedule('actions', this, fn, ...args);
        },
      ]);
    } else {
      return originalObserver.apply(Ember, arguments);
    }
  };
})();
