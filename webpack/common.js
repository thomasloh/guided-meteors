// modules
var webpack = require('webpack');
var path = require('path');

// generate app require module shim
var _ = require('lodash');
var glob = require('glob');
var files = glob.sync("src/**/*.+(jsx|js)");
var alias = _.zipObject(
  // module name
  files.map(function(f) {
    f =    _.chain(f.split('/'))
            .map(function(c) {
              return c.replace(/\.jsx|\.js/, '');
            })
            .reject(function(c) {
              return c === 'src';
            })
            .uniq(function(p, i, a){
              if (a.length - i <= 2) {
                return p;
              }
              return Math.random() * 1000;
            })
            .value();
    return f.join('.') + "$";
  }),
  // module path
  _.chain(files)
   .map(function(f) {
    return path.resolve(f);
   })
   .value()
);

module.exports = {

  loaders: [
    {
      test: /\.less$/,
      loader: 'style!css!autoprefixer!rework!less'
    },
    // {
    //   test: /\.jsx$/,
    //   loaders: ['react-proxy']
    // },
    {
      test: /\.png|\.jpg|\.jpeg|\.gif|\.svg/,
      loaders: ['url?limit=10000', 'image?optimizationLevel=7&progressive=true&interlaced=false']
    },
    {
      test: /vendor/,
      loaders: ['script']
    },
    {
      test: /\.woff/,
      loaders: ['url?limit=10000']
    },
    {
      test: /\.ttf|\.eot/,
      loaders: ['file']
    },
    {
      test: /\.json/,
      loaders: ['json']
    }
  ],

  resolve: {
    alias: alias,
    root: __dirname + "/../",
    modulesDirectories: ["web_modules", "node_modules", "vendor", "src"],
    extensions: ['', '.js', '.jsx', '.json']
  },

  plugins: [
    new webpack.PrefetchPlugin("react/addons"),
    new webpack.PrefetchPlugin("react/lib/ReactComponentBrowserEnvironment"),
    new webpack.PrefetchPlugin("bluebird"),
    new webpack.optimize.CommonsChunkPlugin('common.js')
  ]

};
