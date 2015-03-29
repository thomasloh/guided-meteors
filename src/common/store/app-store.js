// Store (app)

// Libs
var Promise       = require('bluebird');
var _             = require('common.utils');
var assert        = require('assert');
var actions       = require('common.actions');
var Reflux        = require('reflux');

module.exports = Reflux.createStore({

  listenables: actions.app

});
