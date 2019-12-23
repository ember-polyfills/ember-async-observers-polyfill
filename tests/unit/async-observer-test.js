/* eslint-disable ember/no-observers */

import { settled } from '@ember/test-helpers';
import EmberObject, { computed, observer } from '@ember/object';
import QUnit, { module, test } from 'qunit';

module('ember-async-observer-polyfill', function() {
  module('observer', function() {
    let buildObserver;

    function buildPerson(options) {
      let Person = EmberObject.extend({
        firstName: null,
        lastName: null,

        fullName: computed('firstName', 'lastName', function() {
          return `${this.firstName} ${this.lastName}`;
        }),

        fullNameChanged: buildObserver(),
      });

      return Person.create(options);
    }

    test('runs sync with legacy API', function(assert) {
      buildObserver = () =>
        observer('fullName', function() {
          assert.step(`fired for: ${this.fullName}`);
        });

      let person = buildPerson({ firstName: 'max', lastName: 'jackson' });
      person.get('fullName'); // consume observed property

      assert.verifySteps([], 'precond - observer not fired');
      person.set('firstName', 'james');
      assert.verifySteps(['fired for: james jackson'], 'observer after upstream property updated');

      assert.strictEqual(person.fullName, 'james jackson');
    });

    test('errors without sync specified in emberjs/rfcs#494 API', function(assert) {
      assert.throws(() => {
        observer({
          dependentKeys: ['fullName'],
          fn() {
            QUnit.config.current.assert.step(`fired for: ${this.fullName}`);
          },
        });
      }, /observer called without sync/);
    });

    test('runs sync with emberjs/rfcs#494 API', function(assert) {
      buildObserver = () =>
        observer({
          sync: true,
          dependentKeys: ['fullName'],
          fn() {
            QUnit.config.current.assert.step(`fired for: ${this.fullName}`);
          },
        });

      let person = buildPerson({ firstName: 'max', lastName: 'jackson' });
      person.get('fullName'); // consume observed property

      assert.verifySteps([], 'precond - observer not fired');
      person.set('firstName', 'james');
      assert.verifySteps(['fired for: james jackson'], 'observer after upstream property updated');

      assert.strictEqual(person.fullName, 'james jackson');
    });

    test('runs async with emberjs/rfcs#494 API', async function(assert) {
      buildObserver = () =>
        observer({
          sync: false,
          dependentKeys: ['fullName'],
          fn(...args) {
            assert.deepEqual(args, [this, 'fullName'], 'arguments are correct');
            assert.step(`fired for: ${this.fullName}`);
          },
        });

      let person = buildPerson({ firstName: 'max', lastName: 'jackson' });
      person.get('fullName'); // consume observed property

      assert.verifySteps([], 'precond - observer not fired');
      person.set('firstName', 'james');
      assert.verifySteps([], 'precond - observer not fired');

      await settled();

      assert.verifySteps(['fired for: james jackson'], 'observer after upstream property updated');

      assert.strictEqual(person.fullName, 'james jackson');
    });
  });
});
