// webpack.config.js

// modules
var common = require("./common");
var webpack = require('webpack');
var _ = require('lodash');

// constants
var URL  = "http://localhost";
var PORT = 8962;

// Gather plugins
var plugins = _.union(common.plugins, [
  new webpack.HotModuleReplacementPlugin(),
]);

// webpack config
module.exports = {

  port: PORT,

  url: URL,

  context: __dirname + '/../src',

  entry: [
    "webpack-dev-server/client?" + URL + ":" + PORT,
    'webpack/hot/dev-server',
    './client'
  ],

  output: {
    path               : __dirname + "/../",
    filename           : 'client.js',
    chunkFileName      : '[id].[chunk].[hash].js',
    namedChunkFilename : '[name].[hash].js',
    publicPath         : URL + ":" + PORT + "/",
    pathInfo           : true
  },

  module: {
    loaders: _.union(common.loaders, [
      {
        test: /\.jsx$|\.js$/,
        loaders: ['react-hot', 'babel?experimental'],
        exclude: /node_modules|vendor/
      }
    ])
  },

  cache: true,

  // debug: true,

  // devtool: "#eval-source-map",

  resolve: common.resolve,

  target: 'web',

  plugins: plugins

};
