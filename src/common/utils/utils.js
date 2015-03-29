var _  = require('lodash');
var _s = require('underscore.string');

// Useful string functions
_.mixin(_s.exports());

// Customs...
_.mixin({

  keyMirror: function(obj, prefix) {
    var ret = {};
    var key;
    prefix = prefix ? prefix + "." : "";
    for (key in obj) {
      if (!obj.hasOwnProperty(key)) {
        continue;
      }
      if (_.isFunction(obj[key])) {
        ret[key] = obj[key];
      } else if (_.isObject(obj[key])) {
        ret[key] = _.keyMirror(obj[key], prefix + key);
      } else {
        ret[key] = prefix + key;
      }
    }
    return ret;
  },

  noop: function() {

  },

  ensureUnprefixed: function(string, prefix) {
    var r = new RegExp('^' + prefix);
    return string.replace(r, '');
  },

  ensureUnsuffixed: function(string, suffix) {
    var r = new RegExp(suffix + '$');
    return string.replace(r, '');
  },

  ensurePrefixed: function(string, prefix) {
    if (string === prefix) {
      return string;
    }

    string = string.replace(new RegExp('^' + prefix), '');

    return path.join(prefix, string);
  },

  ensureSuffixed: function(string, suffix) {

    if (_.endsWith(string, suffix)) {
      return string;
    } else {
      return string + suffix;
    }
  },

  ensureTrimmedPrefix: function(string, prefix) {
    return _.ltrim(string, new RegExp(prefix));
  },

  ensureTrimmedSuffix: function(string, prefix) {
    return _.rtrim(string, new RegExp(prefix));
  }

});

module.exports = _;
