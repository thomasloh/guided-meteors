// Import modules
var React    = require('react/addons');
var ReactART = require('react-art');
var Group = ReactART.Group;
var Shape = ReactART.Shape;
var Surface = ReactART.Surface;
var Transform = ReactART.Transform;
var _ = require('lodash');
var Circle = require('react-art/shapes/circle');
var Color = require('color');

var Halo = require('common.components.halo');
var Core = require('common.components.core');

// Constants
const MAX_X = 1400;
const MAX_Y = MAX_X;

const X_COORDINATES = _.range(0, MAX_X + 1);
const Y_COORDINATES = _.range(0, MAX_Y + 1);

/**
 * React component class definition
 */
var Home = React.createClass({

  /**
   * Describe types of properties that can be passed in
   * @type {Object}
   */
  propTypes: {
  },

  mixins: [
    React.addons.PureRenderMixin
  ],

  getInitialState: function() {

    var coordinates = [
      for(x of X_COORDINATES)
        Y_COORDINATES.map((y) => {
          return {
            x: x,
            y: y
          };
        })
    ];

    // Left
    var leftGroupCoordinates = [
      [100, 300],
      [200, 700],
      [300, 100],
      [320, 220],
      [80, 520],
      [250, 450],
      [370, 330],
      [400, 420],
      [350, 600],
    ].map(([x, y]) => {
      coordinates[x][y].isHaloActive = false;
      return {x, y};
    });

    // Right
    const MIN_X_RIGHT = MAX_X / 2;
    var rightGroupCoordinates = [
      [MIN_X_RIGHT + 600, 300],
      [MIN_X_RIGHT + 200, 400],
      [MIN_X_RIGHT + 450, 100],
      [MIN_X_RIGHT + 440, 600],
      [MIN_X_RIGHT + 200, 300],
      [MIN_X_RIGHT + 300, 400],
      [MIN_X_RIGHT + 550, 500],
      [MIN_X_RIGHT + 440, 300]
    ].map(([x, y]) => {
      coordinates[x][y].isHaloActive = false;
      return {x, y};
    });

    return {
      coordinates           : coordinates,
      leftGroupCoordinates  : leftGroupCoordinates,
      rightGroupCoordinates : rightGroupCoordinates
    };
  },

  onHaloAnimationEnd: function(c) {
    this.setState({
      coordinates: React.addons.update(this.state.coordinates, {
        [c.x]: {
          [c.y]: {
            isHaloActive: {$set: false}
          }
        }
      })
    });
  },

  generateLeftGroup() {

    var halos = this.state.leftGroupCoordinates.map((c) => {
      return (
        <Halo
          x              ={ c.x }
          y              ={ c.y }
          isActive       ={ this.state.coordinates[c.x][c.y].isHaloActive }
          onAnimationEnd ={ this.onHaloAnimationEnd.bind(this, c) }
        />
      );
    });

    return (
      <Group>
        { halos }
      </Group>
    );

  },

  generateRightGroup() {

    var halos = this.state.rightGroupCoordinates.map((c) => {
      return (
        <Halo
          x              ={ c.x }
          y              ={ c.y }
          isActive       ={ this.state.coordinates[c.x][c.y].isHaloActive }
          onAnimationEnd ={ this.onHaloAnimationEnd.bind(this, c) }
        />
      );
    });

    return (
      <Group>
        { halos }
      </Group>
    );
  },

  componentDidUpdate: function() {
    var canvas = this.refs.canvas.getDOMNode();
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
        rippleLineWidth -= 0.02;
      }
      requestAnimationFrame(ripple);
    }

    requestAnimationFrame(ripple);

  },

  /**
   * This is the "main" method for any component. The React API allows you to
   * describe the structure of your UI component at *any* point in time.
   */
  render: function() {
    // return (
    //   <div className="home">
    //     <Surface
    //       width={MAX_X}
    //       height={MAX_Y}
    //       style={{cursor: 'pointer'}}>
    //       { /** Left **/ }
    //       { this.generateLeftGroup() }
    //       { /** Center **/ }
    //       <Core />
    //       { /** Right **/ }
    //       { this.generateRightGroup() }
    //     </Surface>
    //   </div>
    // );
    return (
      <div className="home">
        <canvas
          ref="canvas"
          width={MAX_X}
          height={MAX_Y}
          style={{cursor: 'pointer'}}
        >
        </canvas>
      </div>
    );
  }

});



module.exports = Home;
