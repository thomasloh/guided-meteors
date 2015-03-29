'use strict';

// Modules
var express = require('express');
var sharify = require('sharify');
var React   = require('react/addons');
var fs      = require('fs');
var Promise = require('bluebird');
var clc     = require('cli-color');
var path    = require('path');

// Global utils
global._ = require('./util');

// Template settings
_.templateSettings = {
  evaluate : /\{\[([\s\S]+?)\]\}/g,
  interpolate : /\{\{([\s\S]+?)\}\}/g
};

// Constants
var DEVELOPMENT = 'dev';
var PRODUCTION  = 'prod';

// App settings
var __root        = '/';
var __env         = process.env['NODE_ENV'] || DEVELOPMENT
var __port        = process.env.PORT || 8960;
var __index       = fs.readFileSync(__dirname + '/src/main.html');
var __startupData = function(req, res) {
  return {};
};

/////////////////
// DEVELOPMENT //
/////////////////

if (__env === DEVELOPMENT) {

  var webpack          = require('webpack');
  var WebpackDevServer = require('webpack-dev-server');
  var config           = require('./webpack/dev.config');

  var webpackDevServer = new WebpackDevServer(webpack(config), {
    publicPath  : config.url + ":" + config.port + "/",
    contentBase : config.url + ":" + __port + "/",
    hot         : true,
    stats       : {
      colors: true
    }
  });

  webpackDevServer.listen(config.port, function(err, result) {
    if (err) {
      console.log(err);
    }
  });

  console.log(clc.blackBright('Webpack development web server started on port: ') + clc.green(config.port));

}

////////////////
// PRODUCTION //
////////////////

// Creates an express app
var server = express();

// Grab express middlewares
var logger         = require('morgan');
var methodOverride = require('method-override');
var bodyParser     = require('body-parser');
var errorHandler   = require('errorhandler');
var compression    = require('compression');
var cookieParser   = require('cookie-parser')
var serveStatic    = require('serve-static')

// Pre-use common options
if (__env === DEVELOPMENT) {
  server.use(logger('dev'));
  server.use(errorHandler());
}
sharify.data.root = __root  ? _.ensureSuffixed(__root, '/') : __root;
sharify.data.env  = __env;

// Common express options
server.use(compression());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(cookieParser());
server.use(sharify);

// Serve favicon
server.use(__root + "/favicon.ico", serveStatic(__dirname + '/src/assets/images/favicon.ico'));
server.use(__root + "/assets/images/favicon.ico", serveStatic(__dirname + '/src/assets/images/favicon.ico'));

if (__env === PRODUCTION) {
  server.use(__root, serveStatic(__dirname + '/dist'));
}

server.disable("x-powered-by");

// Routing
server.get('/*', function(req, res, next) {

  // Redirect if not prefixed with root
  if (!_.startsWith(req.path, __root)) {
    return res.redirect(__root + _.ensureUnprefixed(req.path, __root + '/'));
  }

  // Additional sharify data
  if (_.isFunction(__startupData)) {
    _.extend(res.locals.sharify.data, __startupData(req, res));
  }

  // Prepare scripts
  var scripts = ['common.js', 'client.js'];

  // In development mode
  if (__env === DEVELOPMENT) {
    scripts = scripts.map(function(s) {
      return config.output.publicPath + s;
    });
  } else {
    scripts = scripts.map(function(s) {
      return __root + "/" + s;
    });
  }

  // Static web app
  var html = _.template(__index)(_.extend({}, res.locals, {
    scripts: scripts,
    isProduction: __env === PRODUCTION
  }));

  // Send off
  res.send(html);

});

// Start the web server
server.listen(__port, function() {
  console.log(clc.blackBright('Web server started on port: ') + clc.green(__port));
});
