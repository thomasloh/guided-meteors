import connect from "./connect";
import Color from "color";

// Constants
const SHOOTING_STAR_LEN = 90;
const NUM_OF_SEGMENTS   = 10;
const OPACITY           = 0.9;
const COLOR             = "rgb(102, 153, 172)";
const SPEED             = 11;
// const MIN_STROKE_LEN = 1;
const MAX_STROKE_LEN    = 4;
const STROKE_LEN_STEP   = 0.5;
const MIN_LIGHTNESS     = 0;
const MAX_LIGHTNESS     = 0.1;

var colorObj = Color(COLOR).alpha(OPACITY);

// state
var shots = [];

// util
var {ceil, round} = Math;

function isCircle(p) {
  return p.toShape() && p.toShape()._type === "circle";
}

function getOffset(p, point) {

  var i = 0;
  while (i < p.length) {

    if (point.isClose(p.getPointAt(i), 1)) {
      break;
    }

    i++;
  }

  return i;

}

function createShootingState({from, to, path, currentRevolution, maxRevolutions, onPoint, onBegin, onEnd, startFrom, isPathCircle, shootingStarLen}) {

  // Call onBegin handler, if any
  if (_.isFunction(onBegin)) {
    onBegin();
  }

  // Create path
  var p, curves = [], isPathCircle;
  if (path) {
    p    = path.clone();
    from = p.firstSegment.point;
    to   = p.lastSegment.point;
    curves = p.curves || [];
    isPathCircle = isPathCircle || isCircle(p);
    if (isPathCircle) {
      if (startFrom) {
        // Rotate
        var offsetOfStartFrom = getOffset(p, startFrom);
        var angle = (offsetOfStartFrom / p.length) * 360;
        p.rotate(angle);
        // showp(p.firstSegment.point)
      }
      to = p.lastSegment.path.firstSegment.point;
    }
  } else {
    p = connect(from, to);
  }
  p.visible = false;

  var g = new Group({
    children: [p]
  });

  shootingStarLen = shootingStarLen || SHOOTING_STAR_LEN;

  return {
    path                   : p,
    from                   : from,
    to                     : to,
    isPathCircle           : Boolean(isPathCircle),
    maxRevolutions         : maxRevolutions,
    currentRevolution      : currentRevolution || 1,
    curves                 : curves,
    group                  : g,
    shootingStarLen        : shootingStarLen,
    distance               : p.length,
    track                  : p.length + SHOOTING_STAR_LEN * 2,
    isCircleShortCircuited : false,

    onPoint                : onPoint,

    onBegin                : onBegin,
    onEnd                  : onEnd,

    hasExecBegin           : _.isFunction(onBegin),
    hasExecEnd             : false
  };

}

function createShootingStar(from, to, through, {enter, exit, shootingStarLen}) {

  // if (!from) {
  //   console.warn("Warning: Need from");
  // }
  // if (!to) {
  //   console.warn("Warning: Need to");
  // }
  // if (!through) {
  //   console.warn("Warning: Need through");
  // }

  // var l = new Path.Arc(from, through, to);

  // l.strokeCap   = 'round';
  // l.strokeWidth = 2
  // l.strokeColor = 'yellow'

  // return l;

  // Line
  var line;
  if (through) {
    line = new Path.Arc(from, through, to);
  } else {
    line = new Path.Line(from, to);
  }
  line.visible = false;
  line.opacity = 0;

  // Find segment length
  var numOfSegments = NUM_OF_SEGMENTS;
  var segmentLen;

  if (round(line.length + 0.5) < shootingStarLen) {
    numOfSegments = round((round(line.length) / shootingStarLen) * NUM_OF_SEGMENTS);
    segmentLen = round(line.length) / numOfSegments;
  } else {
    segmentLen = round(line.length) / numOfSegments;
  }

  // Range
  const STROKE_STEP    = STROKE_LEN_STEP;
  const LIGHTNESS_STEP = (MAX_LIGHTNESS - MIN_LIGHTNESS) / numOfSegments;
  var strokeWidthRange = _.range(MAX_STROKE_LEN - (numOfSegments * STROKE_STEP), MAX_STROKE_LEN, STROKE_STEP);
  var lightnessRange   = _.range(MIN_LIGHTNESS, MAX_LIGHTNESS, LIGHTNESS_STEP);

  // Convert to group
  return _.range(0, numOfSegments).reduce((group, i, x) => {

    var f, t, thru, offset;

    // Initial

    if (!group.children.length) {
      f = line.getPointAt((line.length - segmentLen));
      t = to;
      if (through) {
        thru = line.getPointAt((line.length - (segmentLen / 2)));
      }

    } else {
    // Subsequent
      offset = (line.length - (group.children.length + 1) * segmentLen);
      if (offset < 0) {
        offset = 0;
      }
      f = line.getPointAt(offset);

      t = group.lastChild.firstSegment.point;

      if (through) {
        thru = line.getPointAt(line.length - (group.children.length * segmentLen) - segmentLen/2);
      }

    }

    var l;
    if (through) {
      l = new Path.Arc(f, thru, t);
    } else {
      l = new Path.Line(f, t);
    }
    l.strokeCap   = 'round';
    l.strokeWidth = strokeWidthRange[strokeWidthRange.length - (x + 1)];
    if (exit) {
      l.strokeWidth = strokeWidthRange[strokeWidthRange.length - (NUM_OF_SEGMENTS - numOfSegments) - (x + 1)];
    }
    l.opacity = 0.9;
    l.strokeColor = colorObj
                    .clone()
                    .lighten(lightnessRange[lightnessRange.length - (x + 1)])
                    .rgbString();

    group.addChild(l);
    line.remove();

    return group;
  }, new Group());

}

function onFrame() {

  // No shootings in progress
  if (!shots.length) {
    return;
  }

  ///////////////////////////
  // Go through each shots //
  ///////////////////////////
  var newShots = [];

  // shots.forEach((s) => {
  shots = shots.map((s) => {

    ///////////////
    // Get state //
    ///////////////
    var {
      path,
      from,
      to,
      maxRevolutions,
      currentRevolution,
      curves,
      group,
      isPathCircle,
      distance,
      shootingStarLen,
      track,
      isCircleShortCircuited,
      onPoint,
      onBegin,
      onEnd,
      hasExecBegin,
      hasExecEnd} = s;

    // var isNull = false;

    /////////////
    // Inspect //
    /////////////

    // Progress
    track -= SPEED;

    // To show that shooting star is moving
    if (group.children.length > 1) {
      group.removeChildren(1);
    }

    // Base
    if (track <= 0) {

      console.log("Arrived!");

      if (_.isFunction(onEnd) && !hasExecEnd) {
        hasExecEnd = true;
        _.defer(onEnd)
      }

      group.remove();
      return null;
    }

    // Proceed

    var origin, dest, through, offset, enter, exit;

    // Case: SHOOTING_STAR_LEN is longer than distance
    if (shootingStarLen > distance) {
      origin = from.position;
      dest   = to.position;
      // track  = 0;
      group.remove();

      return null;
      // isNull = true;

    } else {

      ////////////////////////////
      // For the head to emerge //
      ////////////////////////////
      if (track > (distance + shootingStarLen)) {

        enter = true;

        offset = distance - (track - shootingStarLen * 2);

        origin = from.position || from;
        dest   = path.getPointAt(offset);

        if (curves.length && !curves[0].isLinear()) {
          through = path.getPointAt(offset - (offset / 2));
        }

      } else if (track > shootingStarLen * 2) {
      //////////////
      // Distance //
      //////////////

        origin = path.getPointAt(distance - (track - shootingStarLen * 1));
        dest   = path.getPointAt(distance - (track - shootingStarLen * 2));

        if (curves.length && !curves[0].isLinear()) {
          through = path.getPointAt(distance - (track - shootingStarLen * 1.5));
        }

      } else if (track > shootingStarLen) {
      ///////////////////////////
      // For the tail to go in //
      ///////////////////////////

        exit = true;

        offset = distance - track + shootingStarLen;

        origin = path.getPointAt(offset);
        dest   = to.position || to;

        if (curves.length && !curves[0].isLinear()) {
          through = path.getPointAt(offset + (distance - offset)/2);
        }

        // if (isPathCircle) {
        //   if (track <= (shootingStarLen + shootingStarLen + shootingStarLen)) {

        //     if (_.isNumber(maxRevolutions)) {
        //       if (!isCircleShortCircuited) {
        //         if (currentRevolution <= maxRevolutions) {
        //           currentRevolution++;
        //           newShots.push(createShootingState({
        //             path,
        //             from,
        //             to,
        //             isPathCircle,
        //             maxRevolutions,
        //             currentRevolution,
        //             onPoint,
        //             onBegin,
        //             onEnd
        //           }));
        //         } else {
        //           if (_.isFunction(onEnd) && !hasExecEnd) {
        //             hasExecEnd = true;
        //             _.defer(onEnd.bind(null, dest));
        //           }
        //         }

        //         isCircleShortCircuited = true;
        //       }

        //     } else {
        //       // Infinite
        //       if (!isCircleShortCircuited) {
        //         newShots.push(createShootingState({path}));
        //         isCircleShortCircuited = true;
        //       }
        //     }

        //   }
        // } else {

        //   if (_.isFunction(onEnd) && !hasExecEnd) {
        //     hasExecEnd = true;
        //     _.defer(onEnd.bind(null, dest));
        //   }

        // }

        if (_.isFunction(onEnd) && !hasExecEnd) {
          hasExecEnd = true;
          _.defer(onEnd.bind(null, dest));
        }

      } else {
      // Short circuit

        group.remove();

        return null;
        // isNull = true;

      }

    }

    // Generate shooting star
    group.addChild(createShootingStar(origin, dest, through, {enter, exit, shootingStarLen}));

    // On met point
    // if (currentRevolution === maxRevolutions) {
    if (_.isFunction(onPoint)) {
      if (!onPoint(dest, SPEED)) {
        // let offset = distance - path.getOffsetOf(dest);
        track = shootingStarLen;
      }
    }
    // }

    ///////////////
    // Set state //
    ///////////////
    return {
      path,
      from,
      to,
      maxRevolutions,
      currentRevolution,
      curves,
      group,
      shootingStarLen,
      isPathCircle,
      distance,
      track,
      isCircleShortCircuited,
      onPoint,
      onBegin,
      onEnd,
      hasExecBegin,
      hasExecEnd
    };

  });
  shots.push(...newShots);
  shots = _.compact(shots);

}

// Main
function shoot({from, to, path}) {

  // Precaution
  if ((!from || !to) && !path) {
    console.warn("Need from and to");
    return;
  }

  // Append to shot tasks
  shots.push(createShootingState(...arguments));

}

// Init func
shoot.init = function() {
  // Start animation
  view.on('frame', onFrame);
};

// Export
export default shoot;
