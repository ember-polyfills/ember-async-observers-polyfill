ember-async-observer-polyfill
==============================================================================

Implement's [emberjs/rfcs#494](https://github.com/emberjs/rfcs/blob/master/text/0494-async-observers.md) for older Ember versions.


Compatibility
------------------------------------------------------------------------------

* Completely inert when running Ember 3.13 or higher
* Supports Ember.js 2.12, 2.16, 2.18, 3.4, 3.8, 3.12
* Ember CLI v2.13 or above
* Node.js v8 or above


Installation
------------------------------------------------------------------------------

```
ember install ember-async-observer-polyfill
```


Usage
------------------------------------------------------------------------------

The best usage guide is the RFC itself [emberjs/rfcs#494](https://github.com/emberjs/rfcs/blob/master/text/0494-async-observers.md)
but here are a few examples of "before"/"after" to whet your appetite:

**Before**:

```js
const Person = EmberObject.extend({
  firstName: null,
  lastName: null,

  fullName: computed('firstName', 'lastName', function() {
    return `${this.firstName} ${this.lastName}`;
  }),


  fullNameChanged: observer('fullName', function() {
    // do something :)
  }),
});
```

**After**:

```js
const Person = EmberObject.extend({
  firstName: null,
  lastName: null,

  fullName: computed('firstName', 'lastName', function() {
    return `${this.firstName} ${this.lastName}`;
  }),


  fullNameChanged: observer({
    sync: false,
    dependentKeys: ['fullName'],
    fn() {
      // do something :)
    }
  }),
});
```

Limitations
------------------------------------------------------------------------------

There are no known limitations, all features described in the RFC are polyfilled.

Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
