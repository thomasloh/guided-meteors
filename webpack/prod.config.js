// webpack.config.js

// modules
var webpack    = require('webpack');
var common     = require("./common");
var _          = require('lodash');

// webpack config
module.exports = {

  context: __dirname + '/../src',

  entry: [
    './client'
  ],

  output: {
    path               : __dirname + "/../dist",
    filename           : 'client.js',
    chunkFileName      : '[id].[chunk].[hash].js',
    namedChunkFilename : '[name].[hash].js',
    publicPath         : '/'
  },

  module: {
    loaders: _.union(common.loaders, [
      {
        test: /\.jsx$|\.js$/,
        loaders: ['babel?experimental'],
        exclude: /node_modules|vendor/
      }
    ])
  },

  resolve: common.resolve,

  target: 'web',

  plugins: _.union(common.plugins, [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),
    new require('appcache-webpack-plugin')
  ])

};
