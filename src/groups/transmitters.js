var Color = require('color');
var _     = require('lodash')

// Constants
const PADDING      = 10;
const START_RADIUS = 6;
const END_RADIUS   = 25;
const RADIUS_STEP  = 0.25;

const COLOR        = '#8F7DCF';
const STROKE_WIDTH = 2;

const LIMIT        = 1;

var rippleStaticColorObj = Color(COLOR)
                          .lighten(0.1)
                          .alpha(1);

// State
var receiversGroup;

var rippleRadius    = START_RADIUS + STROKE_WIDTH;
var rippleLineWidth = STROKE_WIDTH;
var rippleOpacity   = 1;
var rippleColorObj  = rippleStaticColorObj.clone();

const opacityStep = (
  1
  /
  ((END_RADIUS - START_RADIUS) / RADIUS_STEP)
);

const strokeWidthStep = (
  STROKE_WIDTH
  /
  ((END_RADIUS - START_RADIUS) / RADIUS_STEP)
);

// Utils
var getRadius = function(path) {
  return path.bounds.width / 2 + path.strokeWidth / 2;
  // or return path.strokeBounds.width / 2;
};
var setRadius = function(path, radius) {
  // figure out what the new radius should be without the stroke
  var newRadiusWithoutStroke = radius - path.strokeWidth / 2;
  // figure out what the current radius is without the stroke
  var oldRadiusWithoutStroke = path.bounds.width / 2;
  path.scale(newRadiusWithoutStroke / oldRadiusWithoutStroke);
};

export default {

  init(coordinates, store) {

    if (receiversGroup) {
      return receiversGroup;
    }

    receiversGroup = new Group();

    this.store = store;

    this.animationQueue = [];

    // Create children
    var winHeight = window.innerHeight;
    var winWidth = window.innerWidth;
    _.each(coordinates, (c) => {
      receiversGroup.addChild(this._createChild({
        x: c.x,
        y: c.y
      }));
      // receiversGroup.addChild(this._createChild({
      //   x: _.random(0 + PADDING, winWidth / 2),
      //   y: _.random(0 + PADDING, winHeight / 2)
      // }));
    });
    // receiversGroup.addChild(this._createChild({
    //   x: winWidth / 2 - 200,
    //   y: winHeight / 2
    // }));
    // receiversGroup.addChild(this._createChild({
    //   x: winWidth / 2 + 200,
    //   y: winHeight / 2
    // }));

    this.store.push(...receiversGroup.children);

    // setup animation
    view.on('frame', this.onFrame.bind(this));

    // Return
    return receiversGroup;

  },

  onFrame(e) {

    // Precaution
    if (!receiversGroup) {
      return;
    }

    // Check message queue
    _.each(this.store, (h) => {

      if (h._markedForAnimation) {
        this.animationQueue.push(h);
        delete h._markedForAnimation;
      }

    });

    // Run through animation queue
    this.animationQueue = _.chain(this.animationQueue)
                            .map(h => this._inspectAnimation(h))
                            .compact()
                            .value();

  },

  _createChild({x, y}) {

    var haloInner = new Path.Circle({
      center: [x, y],
      radius: START_RADIUS
    });
    haloInner.set({
      strokeColor: COLOR,
      strokeWidth: 5
    });

    var haloRipple = new Path.Circle({
      center: [x, y],
      radius: START_RADIUS
    });
    haloRipple.set({
      strokeColor: COLOR,
      strokeWidth: STROKE_WIDTH
    });

    return new Group({
      children: [haloInner, haloRipple]
    });

  },

  _inspectAnimation(group) {

    var halo = group.children[1];

    // No animation started yet
    if (!halo._animationState) {
      halo._animationState = this._createAnimationState();
      return group;
    }

    // Get animation state
    var {
      rippleRadius,
      rippleLineWidth,
      rippleOpacity
    } = halo._animationState;

    // Apply
    halo.visible = true;
    setRadius(halo, rippleRadius);
    halo.strokeWidth = rippleLineWidth;
    halo.strokeColor = rippleColorObj
                        .alpha(rippleOpacity)
                        .rgbString();

    if (rippleRadius >= END_RADIUS) {
      halo.strokeWidth = STROKE_WIDTH;
      setRadius(halo, START_RADIUS + 1);
      halo.strokeColor = rippleColorObj
                          .alpha(1)
                          .rgbString();
      halo._animationState = null;
      halo.visible = false;
      return null;
    }

    // Next
    halo._animationState.rippleRadius += RADIUS_STEP;
    halo._animationState.rippleOpacity -= opacityStep;
    if (rippleLineWidth === STROKE_WIDTH) {
      halo._animationState.rippleLineWidth += 0.5;
      // rippleColorObj = Color(COLOR).lighten(0.1).alpha(1);
    } else {
      halo._animationState.rippleLineWidth -= strokeWidthStep;
    }

    return group;
  },

  _createAnimationState() {
    return {
      rippleRadius    : START_RADIUS + STROKE_WIDTH + 1,
      rippleOpacity   : 1,
      rippleLineWidth : STROKE_WIDTH
    };
  },

  // <ShootTo> protocol
  shootingStarArrived() {
    console.log("Shooting star arrived");
  }

};
