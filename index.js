'use strict';

const VersionChecker = require('ember-cli-version-checker');

module.exports = {
  name: require('./package').name,

  init() {
    this._super.init && this._super.init.apply(this, arguments);

    let checker = new VersionChecker(this.project);
    let emberVersion = checker.forEmber();

    this.shouldPolyfill = emberVersion.lt('3.13.0-alpha.1');
  },

  included() {
    this._super.included.apply(this, arguments);

    if (!this.shouldPolyfill) {
      return;
    }

    // grab the original _findHost, before ember-engines can muck with it
    let proto = Object.getPrototypeOf(this);
    let host = proto._findHost.call(this);

    // using `app.import` here because we need to ensure this ends up in the
    // top level vendor.js (not engine-vendor.js as would happen with
    // this.import inside an engine)
    host.import('vendor/ember-async-observer-polyfill/index.js');
  },

  treeForVendor(rawVendorTree) {
    if (!this.shouldPolyfill) {
      return;
    }

    let babelAddon = this.addons.find(addon => addon.name === 'ember-cli-babel');

    let transpiledVendorTree = babelAddon.transpileTree(rawVendorTree, {
      babel: this.options.babel,

      'ember-cli-babel': {
        compileModules: false,
      },
    });

    return transpiledVendorTree;
  },
};
