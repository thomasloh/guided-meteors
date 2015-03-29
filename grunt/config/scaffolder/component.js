// Grab essentials
var grunt = require('grunt');
var path = require('path');

// Grab imports
var componentJsTemplatePath = __dirname + '/templates/component.tpl.jsx';
var componentLessTemplatePath = __dirname + '/templates/component.tpl.less';

module.exports = function() {

  // Utilities
  /* jshint ignore:start */
  String.prototype.replaceAt=function(index, character) {
     return this.substr(0, index) + character + this.substr(index+character.length);
  };
  /* jshint ignore:end */

  function prepareConstructorName(d) {

    // ensure no suffix
    d = d.replace(/\.js$/, '');

    d = path.basename(d);

    d = trim(d);

    var i;

    while (!!(i = d.match(/\-[a-z]{1}/))) {
      d = d.replaceAt(i.index, i[0].toUpperCase());
      d = d.replace(/\-/, '');
    }

    while (!!(i = d.match(/\.[a-z]{1}/))) {
      d = d.replaceAt(i.index, i[0].toUpperCase());
      d = d.replace(/\./, '');
    }

    if (d[0]) {
      d = d.replaceAt(0, d[0].toUpperCase());
    }

    return d;
  }

  function prepareFileName(s, suffix) {

    var base = path.basename(s);

    base = trim(base);

    function ensureSuffix(d, sufx) {
      if (path.extname(d) !== sufx) {
        d += sufx;
      }
      return d;
    }

    s = s.split('/').map(function(v) {
      return trim(v);
    }).join('/');

    return ensureSuffix(s.replace(/\.js$/, '') + '/' + base, suffix);
  }

  function prepareClassNameInJs(s) {

    // ensure no suffix
    s = s.replace(/\.js$/, '');

    s = path.basename(s);
    s = s.replace(/\./g, '-');
    s = trim(s);

    return s;
  }
  function prepareClassNameInLess(s) {

    // ensure no suffix
    s = s.replace(/\.js$/, '');

    // ensure prefixed
    s = s[0] === '/' ? s : '/' + s;

    // s = path.basename(s);
    s = s.replace(/\./g, '-');
    s = s.replace(/\//g, ' .');
    s = trim(s);
    s = s.replace(/^\s/, '');

    return s;
  }

  function checkFilename(s) {
    s = s.split('/');
    if (s[0] !== 'app' && s[0] !== 'common') {
      grunt.fail.fatal('Directory must start with `app`\ni.e. `grunt scaffold:component --name=' + grunt.log.wordlist(['app'], {separator: '', color: 'cyan'}) + grunt.log.wordlist(['/home/nav-bar`'], {separator: '', color: 'red'}));
    }
  }

  function trim(s) {
    return s.replace(/^(\-|\.)|(\-|\.)$/g, '');
  }

  // Grab options
  var args = process.argv[2].split(":");
  if (args[0] === "scaffold" && !args[1]) {
    grunt.fail.fatal('Must provide a name for the component\ni.e. `grunt scaffold:app/home/my-component`');
  }
  var name = args[1];

  // Precheck
  if (!name) {
    grunt.fail.fatal('Must provide a name for the component\ni.e. `grunt scaffold:component --name=app/home/my-component`');
  }

  // Async op
  var done = this.async();

  // Trim name
  name = trim(name);

  // Prepare Class name
  var constructorName = prepareConstructorName(name);
  console.log(constructorName);

  // Prepare js file name
  var jsFilename = prepareFileName(name, '.jsx');
  console.log(jsFilename);

  // Prepare less file name
  var lessFilename = prepareFileName(name, '.less');
  console.log(lessFilename);

  // Prepare class name in js
  var classNameInJs = prepareClassNameInJs(name);
  console.log(classNameInJs);

  // Prepare class name in less
  var classNameInLess = prepareClassNameInLess(name);
  console.log(classNameInLess);

  // Read js template
  var jsTemplate = grunt.file.read(componentJsTemplatePath);
  var js = grunt.template.process(jsTemplate, {
    data: {
      constructorName : constructorName,
      className       : classNameInJs
    }
  });

  // Validation
  checkFilename(jsFilename);

  // Write js
  grunt.file.write('src/' + jsFilename, js);

  // Read less template
  var lessTemplate = grunt.file.read(componentLessTemplatePath);
  var less = grunt.template.process(lessTemplate, {
    data: {
      className : classNameInLess
    }
  });

  // Write less
  grunt.file.write('src/' + lessFilename, less);

  // Log utilities
  function green(s) {
    return grunt.log.wordlist([s], {separator: '', color: 'green'});
  }

  // Log output
  grunt.log.ok(green('Scaffold success!'));
  grunt.log.ok(green('(created) ') + jsFilename);
  grunt.log.ok(green('(created) ') + lessFilename);

  done();

};
