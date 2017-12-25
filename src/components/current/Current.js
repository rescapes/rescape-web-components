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

import PropTypes from 'prop-types';
import region from 'components/region/RegionContainer';
import React from 'react';
import {composeViews, eMap, errorOrLoadingOrData, nameLookup, propsFor, reqStrPath} from 'helpers/componentHelpers';
import * as R from 'ramda';
import {throwing} from 'rescape-ramda';
import {mergeAndApplyMatchingStyles} from 'selectors/styleSelectors';
import {styleMultiplier} from 'helpers/styleHelpers';

const [Div, Region] =
  eMap(['div', region]);

export const c = nameLookup({
  current: true,
  currentRegion: true
});

/**
 * Displays the Region of the current state and eventually a Region selector.
 * This might also be modified to display all available regions, perhaps on a continental map
 */
class Current extends React.Component {
  render() {
    const props = Current.views(this.props);
    return Div(propsFor(c.current, props.views),
      Current.choicepoint(props)
    );
  }
}

/**
 * Merges parent and state styles into component styles
 * @param style
 * @returns {Object} props with modified styles within views: props.views = {
 *  someComponent: {
 *    style: { ... }
 *  }
 *  ...
 * }
 */
Current.getStyles = ({style}) => {
  return {
    [c.current]: mergeAndApplyMatchingStyles(style, {
      position: 'absolute',
      width: styleMultiplier(1),
      height: styleMultiplier(1)
    }),

    [c.currentRegion]: R.merge(
      // Pass width and height to Region component
      // TODO this probably won't stand, but it's more of a proof of concept now
      R.pick(['width', 'height'], style),
      {
        // Other styles to pass to component (unlikely)
      }
    )
  };
};

Current.viewProps = () => {
  return {
    [c.currentRegion]: {region: reqStrPath('data.region')}
  };
};


Current.viewActions = () => {
  return {
    [c.regionMapbox]: {}
  };
};

Current.renderData = ({views}) => {
  const props = R.flip(propsFor)(views);

  return Region(
    props(c.currentRegion)
  );
};

Current.renderLoading = () => {
  return Div();
};

Current.renderError = (error) => {
  return Div();
};


/**
 * Adds to props.views for each component configured in viewActions, viewProps, and getStyles
 * @param {Object} props this.props or equivalent for testing
 * @returns {Object} modified props
 */
Current.views = composeViews(
  Current.viewActions(),
  Current.viewProps(),
  Current.getStyles
);

/**
 * Loading, Error, or Data based on the props
 */
Current.choicepoint = errorOrLoadingOrData(
  Current.renderError,
  Current.renderLoading,
  Current.renderData
);

Current.propTypes = {};

export default Current;

