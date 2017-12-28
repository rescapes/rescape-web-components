/**
 * Created by Andy Likuski on 2016.05.26
 * Copyright (c) 2016 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {styleMultiplier} from 'helpers/styleHelpers';
import React from 'react';
import {
  composeViews, eMap, renderChoicepoint, nameLookup, propsFor,
  propsForSansClass
} from 'helpers/componentHelpers';
import current from 'components/current';
import {throwing} from 'rescape-ramda';
import {Component} from 'react'
import * as R from 'ramda';
import PropTypes from 'prop-types'
const [Div, Current] = eMap(['div', current]);

export const c = nameLookup({
  main: true,
  mainCurrent: true
});

class Main extends Component {
  render() {
    const props = Main.views(this.props);
    return Div(propsFor(c.main, props.views),
      Main.choicepoint(props)
    );
  }
}


/*
* Merges parent and state styles into component styles
* @param style
*/
Main.getStyles = ({style}) => {
  return {
    [c.main]: {
      width: styleMultiplier(1),
      height: styleMultiplier(1)
    },

    [c.mainCurrent]: {}
  };
};


Main.viewProps = () => {
  return {};
};

Main.viewActions = () => {
  return {};
};

Main.renderData = ({views}) => {
  const props = R.flip(propsFor)(views);
  const propsSansClass = R.flip(propsForSansClass)(views);
  return Current(propsSansClass(c.mainCurrent));
};

Main.renderLoading = ({data}) => {
  return [];
};

Main.renderError = ({data}) => {
  return [];
};

/**
 * Adds to props.views for each component configured in viewActions, viewProps, and getStyles
 * @param {Object} props this.props or equivalent for testing
 * @returns {Object} modified props
 */
Main.views = composeViews(
  Main.viewActions(),
  Main.viewProps(),
  Main.getStyles
);

/**
 * Loading, Error, or Data based on the props
 */
Main.choicepoint = renderChoicepoint(
  Main.renderError,
  Main.renderLoading,
  Main.renderData
);

Main.propTypes = {
  data: PropTypes.shape().isRequired,
  style: PropTypes.shape().isRequired
}

export default Main;
