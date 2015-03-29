
// Stylesheets
require('./main.less');

// Grab utilities
var sharify = require('expose?sharify!sharify');
var _       = require('../util');
var Color   = require('color');

// Apply es5 shim
require('es5-shim-sham');

// Constants
const MAX_X = 1400;
const MAX_Y = MAX_X;

//////////
// MAIN //
//////////

window.addEventListener('load', () => {
  var canvas = document.createElement('canvas');
  canvas.id = "canvas";
  canvas.height = MAX_Y;
  canvas.width = MAX_X;
  document.body.appendChild(canvas);
  canvas = window.document.getElementById('canvas');
  var ctx = canvas.getContext('2d');

  const COLOR = '#4BDDB3';
  const LINE_WIDTH = 2;

  function drawBase() {
    ctx.lineWidth = LINE_WIDTH;
    ctx.strokeStyle = COLOR;
    ctx.beginPath();
    ctx.arc(100, 300, 10, 0, 2 * Math.PI, false);
    ctx.stroke();
  }
  drawBase();

  const START_RADIUS = 10;
  const END_RADIUS = 25;
  const RADIUS_STEP = 0.25;

  var rippleRadius = START_RADIUS;
  var rippleLineWidth = LINE_WIDTH;
  var rippleOpacity = 1;
  var rippleColorObj = Color(ctx.strokeStyle)
                      .lighten(0.1)
                      .alpha(rippleOpacity);

  var opacityStep = (
    1
    /
    ((END_RADIUS - START_RADIUS) / RADIUS_STEP)
  );

  function ripple() {
    // ctx.globalCompositeOperation = 'destination-over';
    ctx.clearRect(0,0,MAX_X, MAX_Y);
    drawBase();

    rippleColorObj = Color(COLOR).lighten(0.1).alpha(rippleOpacity);

    if (rippleRadius >= END_RADIUS) {
      drawBase();
      rippleLineWidth = LINE_WIDTH;
      rippleRadius = START_RADIUS;
      rippleOpacity = 1;
      rippleColorObj = Color(COLOR).lighten(0.1).alpha(1);
      requestAnimationFrame(ripple);
      return;
    }

    ctx.beginPath();
    ctx.arc(100, 300, rippleRadius, 0, 2 * Math.PI, false);
    ctx.lineWidth = rippleLineWidth;
    ctx.strokeStyle = rippleColorObj
                      .alpha(rippleOpacity)
                      .rgbString();
    ctx.stroke();

    // next
    rippleRadius += RADIUS_STEP;
    rippleOpacity -= opacityStep;
    if (rippleLineWidth === LINE_WIDTH) {
      rippleLineWidth += 1;
      // rippleRadius -= 1;
      rippleColorObj = Color(COLOR).lighten(0.5).alpha(1);
    } else {
      rippleLineWidth -= 0.03;
    }
    requestAnimationFrame(ripple);
  }

  requestAnimationFrame(ripple);



});
