/**
 * Created by Andy Likuski on 2017.02.16
 * Copyright (c) 2017 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import reactMapGl from 'react-map-gl';
import {throwing} from 'rescape-ramda';
import {
  composeViews, eMap, renderChoicepoint, nameLookup, propsFor,
  propsForSansClass, renderErrorDefault, renderLoadingDefault, reqStrPath
} from 'helpers/componentHelpers';
import * as R from 'ramda';
import {styleMultiplier} from 'helpers/styleHelpers';
import {applyMatchingStyles, mergeAndApplyMatchingStyles} from 'selectors/styleSelectors';
import {Component} from 'react'
import PropTypes from 'prop-types';

const [Div, ReactMapGl] = eMap(['div', reactMapGl]);
export const c = nameLookup({
  mapbox: true,
  mapboxMapReactGlOuter: true,
  mapboxReactMapGl: true,
  mapboxLoading: true,
  mapboxError: true
});
const {reqPath} = throwing;

/**
 * The View for Mapbox
 */
class Mapbox extends Component {
  render() {
    const props = Mapbox.views(this.props);
    return Div(propsFor(c.mapbox, props.views),
        Mapbox.choicepoint(props)
    );
  }
}

Mapbox.getStyles = ({style}) => {
  return {
    [c.mapbox]: mergeAndApplyMatchingStyles(style, {
      position: 'absolute',
      width: styleMultiplier(1),
      height: styleMultiplier(1)
    }),

    [c.mapboxReactMapGl]: applyMatchingStyles(style, {
      width: styleMultiplier(1),
      height: styleMultiplier(1)
    })
  };
};

Mapbox.viewProps = (props) => {
  return {
    [c.mapboxReactMapGl]: R.mergeAll([
      {
        // Width and height are calculated in getStyles
        width: reqPath(['views', [c.mapboxReactMapGl], 'style', 'width']),
        height: reqPath(['views', [c.mapboxReactMapGl], 'style', 'height'])
      },
      // Pass anything in mapbox
      reqStrPath('data.mapbox', props),
      // Pass anything in viewport
      reqStrPath('data.viewport', props)
    ])
    //osm: 'store.region.geojson.osm'
  };
};

Mapbox.viewActions = () => {
  return {
    [c.mapboxReactMapGl]: ['onViewportChange', 'hoverMarker', 'selectMarker']
  };
};

Mapbox.renderData = ({views}) => {
  /* We additionally give Mapbox the container width and height so the map can track changes to these
   We have to apply the width and height fractions of this container to them.
   */
  const props = R.flip(propsFor)(views);
  const propsSansClass = R.flip(propsForSansClass)(views);

  return Div(props(c.mapboxMapReactGlOuter),
    ReactMapGl(propsSansClass(c.mapboxReactMapGl))
  );
};

/**
 * Adds to props.views for each component configured in viewActions, viewProps, and getStyles
 * @param {Object} props this.props or equivalent for testing
 * @returns {Object} modified props
 */
Mapbox.views = composeViews(
  Mapbox.viewActions(),
  Mapbox.viewProps,
  Mapbox.getStyles
);

/**
 * Loading, Error, or Data based on the props
 */
Mapbox.choicepoint = renderChoicepoint(
  renderErrorDefault(c.mapboxError),
  renderLoadingDefault(c.mapboxLoading),
  Mapbox.renderData
);

Mapbox.propTypes = {
  data: PropTypes.shape().isRequired,
  style: PropTypes.shape().isRequired
};

export default Mapbox;
