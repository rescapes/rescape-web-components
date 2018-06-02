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

import {styleMultiplier} from 'rescape-helpers-component';
import {
  composeViews, eMap, renderChoicepoint, nameLookup, propsFor,
  propsForSansClass, renderErrorDefault, renderLoadingDefault
} from 'rescape-helpers-component';
import current from 'components/current';
import {Component} from 'react'
import PropTypes from 'prop-types'
import {applyMatchingStyles, mergeAndApplyMatchingStyles} from 'selectors/styleSelectors';
import Mapbox from 'components/map/mapbox/Mapbox';
const [Div, Current] = eMap(['div', current]);

export const c = nameLookup({
  main: true,
  mainCurrent: true,
  mainLoading: true,
  mainError: true
});

class Main extends Component {
  render() {
    const props = Main.views(this.props);
    return Div(propsFor(props.views, c.main),
      Main.choicepoint(props)
    );
  }
}


/*
* Merges parent and state styles into component styles
* @param style
*/
Main.viewStyles = ({style}) => {
  return {
    [c.main]: mergeAndApplyMatchingStyles(style, {
      width: '100%',
      height: '100%'
    }),

    [c.mainCurrent]: applyMatchingStyles(style, {
      // Use pixel-based width and height all the way down to Mapbox
      // TODO This is the padding from App, I need to maintain 100% width put in pixel
      width: styleMultiplier(1),
      // TODO This is the header height and padding
      height: styleMultiplier(1)
    })
  };
};


Main.viewProps = () => {
  return {};
};

Main.viewActions = () => {
  return {};
};

Main.renderData = ({views}) => {
  const propsSansClass = propsForSansClass(views);
  return Current(propsSansClass(c.mainCurrent));
};

Main.renderLoading = ({data}) => {
  return [];
};

Main.renderError = ({data}) => {
  return [];
};

/**
 * Adds to props.views for each component configured in viewActions, viewProps, and viewStyles
 * @param {Object} props this.props or equivalent for testing
 * @returns {Object} modified props
 */
Main.views = composeViews(
  Main.viewActions(),
  Main.viewProps(),
  Main.viewStyles
);

/**
 * Loading, Error, or Data based on the props
 */
Mapbox.choicepoint = renderChoicepoint(
  renderErrorDefault(c.mapboxError),
  renderLoadingDefault(c.mapboxLoading),
  Mapbox.renderData
);

Main.propTypes = {
  data: PropTypes.shape().isRequired,
  style: PropTypes.shape().isRequired
}

export default Main;
