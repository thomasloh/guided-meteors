"use strict";

// Import modules
var React = require('react/addons');

// Import children components

/**
 * React component class definition
 */
var <%= constructorName %> = React.createClass({

  /**
   * Describe types of properties that can be passed in
   * @type {Object}
   */
  propTypes: {
  },

  /**
   * Describe what the component should look like
   * @return {Object} React virtual DOM object
   */
  render() {

    // JSX
    return (

      <div className="<%= className %>">

      </div>

    );

  }

});

module.exports = <%= constructorName %>;
