var _  = require('lodash');
var _s = require('underscore.string');

// Useful string functions
_.mixin(_s.exports());

// Customs...
_.mixin({
  ensureUnprefixed: function(string, prefix) {
    if (string === prefix) {
      return string;
    }
    var r = new RegExp('^' + prefix);
    return string.replace(r, '');
  },
  ensureUnsuffixed: function(string, suffix) {
    if (string === suffix) {
      return string;
    }
    var r = new RegExp(suffix + '$');
    return string.replace(r, '');
  },
  ensureSuffixed: function(string, suffix) {
    if (string === suffix) {
      return string;
    }
    if (_.endsWith(string, suffix)) {
      return string;
    } else {
      return string + suffix;
    }
  },
  ensurePrefixed: function(string, prefix) {
    if (string === prefix) {
      return string;
    }
    if (_.startsWith(string, prefix)) {
      return string;
    } else {
      return prefix + string;
    }
  },
  ensureTrimmedPrefix: function(string, prefix) {
    if (string === prefix) {
      return "";
    }
    return _.ltrim(string, new RegExp(prefix));
  }
});

module.exports = _;
