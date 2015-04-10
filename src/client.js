// Stylesheets
require('./main.less');

// Grab utilities
var sharify = require('expose?sharify!sharify');
var _       = require('../util');

// Grab groups
var receivers    = require('./groups/receivers');
var transmitters = require('./groups/transmitters');

// Utils
import shoot from './utils/shoot';

// Vendor scripts
require('es5-shim-sham');
require('../vendor/paper/dist/paper-core.min.js');

//////////
// MAIN //
//////////

paper.install(window);
window.onload = function() {

  var canvas = document.getElementById('canvas');

  paper.setup(canvas);

  // State
  var state = {
    // Entities
    transmitters : [],
    receivers    : [],

    // Connections (invisible)
    paths        : []
  };

  // window.s = state;
  // window.shoot = shoot;

  shoot.init();

  var winHeight = window.innerHeight;
  var winWidth = window.innerWidth;

  ///////////
  // Setup //
  ///////////

  // Circle
  function createCircle(r) {
    return new Path.Circle({
      center: [winWidth/2, winHeight/2],
      radius: r,
      strokeColor: '#7875b3',
      strokeWidth: 0.2
      // dashArray: [1,2]
    });
  }

  // States
  const NUM = 20;

  var circles = _.range(1, NUM + 1).map(x => createCircle(x * 20));

  function createState(range) {
    return Math.round(_.random(...range));
  }
  var circleOffsetsForTransmitters = [],
      circleOffsetsForReceivers = [];

  _.each(circles, (c) => {
    circleOffsetsForTransmitters.push(createState([c.length / 15, c.length / 2]));
    circleOffsetsForReceivers.push(createState([c.length / 10, c.length / 2]));
    // circleOffsetsForTransmitters.push(createState([0, c.length]));
    // circleOffsetsForReceivers.push(createState([0, c.length]));
  });

  // var circleOffsetsForTransmitters = createState([0, circleOne.length / 2], NUM);

  // var circleOffsetsForReceivers = createState([circleOne.length / 2, circleOne.length], NUM);

  var transmitterCoors = [];
  var receiverCoors = [];

  var transmitterPaths = [];
  var receiverPaths = [];

  var directions = ['subtract', 'add'];

  // Figure out tangents for transmitters
  _.each(circleOffsetsForTransmitters, (o, i) => {

    var tangent = circles[i].getTangentAt(o);

    tangent.length = _.random(300, 700);

    var p = new Path.Line({
      from: circles[i].getPointAt(o),
      to: circles[i].getPointAt(o)[directions[0]](tangent),
      // strokeColor: 'grey',
      // dashArray: [1,2]
    });

    p.reverse();

    transmitterCoors.push(circles[i].getPointAt(o)[directions[0]](tangent));

    transmitterPaths.push(p);

  });

  directions = directions.reverse();

  // Figure out tangents for receivers
  _.each(circleOffsetsForReceivers, (o, i) => {

    var tangent = circles[i].getTangentAt(o);

    tangent.length = _.random(400, 700);

    var p = new Path.Line({
      from: circles[i].getPointAt(o),
      to: circles[i].getPointAt(o)[directions[0]](tangent),
      // strokeColor: 'grey',
      // dashArray: [1,2]
    });

    receiverCoors.push(circles[i].getPointAt(o)[directions[0]](tangent));
    receiverPaths.push(p);

  });

  // Groups init
  transmitters.init(transmitterCoors, state.transmitters);
  receivers.init(receiverCoors, state.receivers);

  // Start shooting
  function shootFromTransmitterToReceiver(i) {

    shoot({
      path: transmitterPaths[i],
      onBegin: function() {
        state.transmitters[i]._markedForAnimation = true;
      },
      onEnd: function(final) {

        // Next up: circle
        shoot({
          path: circles[i],
          startFrom: final,
          // maxRevolutions: 3,
          onPoint: function(point, speed) {

            if (point.isClose(circles[i].getPointAt(circleOffsetsForReceivers[i]), speed)) {
              // console.log("Circle done");
              // Shoot to tangent
              _.defer(() => {
                shoot({
                  path: receiverPaths[i],
                  onEnd: function() {
                    // console.log("Second tangent done")
                    state.receivers[i]._markedForAnimation = true;
                  }
                });
              });
              return false;
            }
            return true;

          },
          onEnd: function() {
            // console.log("Circle done")
          }
        });

      }
    });

  }

  const DELAY = 1500;

  function play() {

    _.range(0, NUM).forEach((i) => {
      _.delay(() => {
        shootFromTransmitterToReceiver(i);
      }, i * DELAY);
    });

  }

  var isActive;

  window.onfocus = function () {
    isActive = true;
  };

  window.onblur = function () {
    isActive = false;
  };

  setInterval(() => {
    if (!isActive) {
      return;
    }
    requestAnimationFrame(play);
  }, DELAY * NUM - 1)


  play();

  // var start = new Point(0, 30);
  // var end = new Point(winWidth, 30);

  // shoot({
  //   shootingStarLen: 150,
  //   from: start,
  //   to: end
  // });

  // var i = 0;
  // var n = 0;

  // var lastElapsed = Date.now();

  // view.on('frame', () => {

  //   var now = Date.now();

  //   if ((now - lastElapsed) < 5000) {
  //     return;
  //   }
  //   lastElapsed = now;

  //   shoot({
  //     from: s.transmitters[i],
  //     to: s.receivers[n],
  //     // path: window.pathh,
  //     onBegin: function() {
  //       s.transmitters[i]._markedForAnimation = true;
  //     },
  //     onEnd: function() {
  //       s.receivers[n]._markedForAnimation = true;
  //     }
  //   });

  // });


  window.showp = function(p, color) {
    var c = new Path.Circle(new Point(p.x, p.y), 2);
    c.fillColor = color || 'yellow';
  };

  // window.pathh = new Path.Arc({
  //     from: [winWidth / 2 - 200, winHeight / 2],
  //     through: [winWidth/2, (winHeight / 2) + 200],
  //     to: [winWidth / 2 + 200, winHeight / 2],
  //     strokeColor: 'grey',
  //     dashArray: [1,2]
  // });

  // window.circle = new Path.Circle({
  //   center: [winWidth/2, winHeight/4],
  //   radius: 50,
  //   strokeColor: 'grey',
  //   dashArray: [1,2]
  // })

  // var tangent = circle.getTangentAt(10);
  // tangent.length = 100;

  // console.log(tangent)
  // showp(circle.getPointAt(10), 'red')
  // new Path.Line({
  //   from: circle.getPointAt(10),
  //   to: circle.getPointAt(10).add(tangent),
  //   strokeColor: 'orange'
  // })

  // function proceed(i, n) {

  //   if (i === n) {
  //     return;
  //   }

  //   shoot(s.receivers[i], s.receivers[n], {
  //     onBegin: function() {
  //       s.receivers[i]._markedForAnimation = true;
  //     },
  //     onEnd: function() {
  //       s.receivers[n]._markedForAnimation = true;

  //       // Next
  //       i++;
  //       n++;
  //       if (n > s.receivers.length - 1) {
  //         n = 0;
  //       }
  //       if (i > s.receivers.length - 1) {
  //         i = 0;
  //       }
  //       proceed(i, n);

  //     }
  //   });

  // }

  // proceed(i, n);


};

