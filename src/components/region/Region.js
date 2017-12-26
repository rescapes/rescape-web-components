/**
 * Created by Andy Likuski on 2017.02.16
 * Copyright (c) 2017 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import {styleMultiplier} from 'helpers/styleHelpers';
import mapbox from 'components/map/mapbox/MapboxContainer';
import sankey from 'components/map/sankey/SankeyContainer';
import markerList from 'components/map/marker/MarkerListContainer';
import PropTypes from 'prop-types';
import {applyMatchingStyles, mergeAndApplyMatchingStyles} from 'selectors/styleSelectors';
import {
  nameLookup, eMap, propsFor, errorOrLoadingOrData, composeViews,
  propsForSansClass, renderLoadingDefault, renderErrorDefault, strPath
} from 'helpers/componentHelpers';
import {mergeDeep, throwing} from 'rescape-ramda';
import * as R from 'ramda';
import {Component} from 'react/cjs/react.production.min';
const {reqPath} = throwing

const [Mapbox, Sankey, MarkerList, Div] = eMap([mapbox, sankey, markerList, 'div']);
export const c = nameLookup({
  region: true,
  regionMapboxOuter: true,
  regionMapbox: true,
  regionSankey: true,
  regionLocationsOuter: true,
  regionLocations: true,
  regionLoading: true,
  regionError: true
});

/**
 * The View for a Region, such as California. Theoretically we could display multiple regions at once
 * if we had more than one, or we could have a zoomed in region of California like the Bay Area.
 */
export default class Region extends Component {
  render() {
    const props = Region.views(this.props);
    return Div(propsFor(c.region, props.views),
      Region.choicepoint(props)
    );
  }
}

/**
 * Merges parent and state styles into component styles
 * @param style
 */
Region.getStyles = ({style}) => {
  return {
    [c.region]: mergeAndApplyMatchingStyles(style, {
      position: 'absolute',
      width: styleMultiplier(1),
      height: styleMultiplier(1)
    }),

    [c.regionMapbox]: R.merge(
      // Pass width and height to Mapbox component
      // TODO this probably won't stand, but it's more of a proof of concept now
      R.pick(['width', 'height'], style),
      {
        // Other styles to pass to component (unlikely)
      }
    ),

    [c.regionMapboxOuter]: applyMatchingStyles(style, {
      position: 'absolute',
      width: styleMultiplier(.5),
      height: styleMultiplier(1)
    }),

    [c.regionLocationsOuter]: {
      position: 'absolute',
      top: .02,
      left: .55,
      right: .05
    }
  }
};

Region.viewProps = () => {
  // region is expected from the query result
  const region = strPath('data.store.region');
  return {
    [c.region]: {region},
    [c.regionMapbox]: {region},
    [c.regionSankey]: {region}
  };
};

Region.viewActions = () => {
  return {
    [c.regionMapbox]: {}
  };
};

Region.renderData = ({views}) => {
  const props = R.flip(propsFor)(views);
  const propsSansClass = R.flip(propsForSansClass)(views);

  return [
    Div(props(c.regionMapboxOuter),
      Mapbox(
        propsSansClass(c.regionMapbox)
      ),
      Sankey(
        propsSansClass(c.regionSankey)
      )
    ),
    Div(props(c.regionLocationsOuter),
      MarkerList(propsSansClass(c.regionLocations))
    )
  ];
};


/**
 * Adds to props.views for each component configured in viewActions, viewProps, and getStyles
 * @param {Object} props this.props or equivalent for testing
 * @returns {Object} modified props
 */
Region.views = composeViews(
  Region.viewActions(),
  Region.viewProps(),
  Region.getStyles
);

/**
 * Loading, Error, or Data based on the props
 */
Region.choicepoint = errorOrLoadingOrData(
  renderErrorDefault(c.regionError),
  renderLoadingDefault(c.regionLoading),
  Region.renderData
);

Region.propTypes = {
  data: PropTypes.shape().isRequired,
  style: PropTypes.shape().isRequired
};

Region.propTypes = {};
