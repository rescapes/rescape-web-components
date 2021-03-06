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
import {styleMultiplier} from 'rescape-helpers-component';
import sankey from 'components/map/sankey/SankeyContainer';
import PropTypes from 'prop-types';
import {applyMatchingStyles, mergeAndApplyMatchingStyles} from 'rescape-apollo';
import {
  nameLookup, eMap, propsFor, renderChoicepoint, composeViews,
  propsForSansClass, renderLoadingDefault, renderErrorDefault
} from 'rescape-helpers-component';
import {reqStrPathThrowing, strPath} from 'rescape-ramda';
import {Component} from 'react';

const [Sankey, Div] = eMap([sankey, 'div']);
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
    return Div(propsFor(props.views, c.region),
      Region.choicepoint(props)
    );
  }
}

/**
 * Merges parent and state styles into component styles
 * @param style
 */
Region.viewStyles = ({style}) => {
  return {
    [c.region]: mergeAndApplyMatchingStyles(style, {
      width: '100%',
      height: '100%'
    }),

    [c.regionMapboxOuter]: applyMatchingStyles(style, {
      width: '100%',
      height: '100%'
    }),

    [c.regionMapbox]: applyMatchingStyles(style, {
      width: styleMultiplier(1),
      height: styleMultiplier(1)
    }),

    [c.regionSankey]: applyMatchingStyles(style, {
      width: styleMultiplier(1),
      height: styleMultiplier(1)
    }),

    [c.regionLocationsOuter]: {
      position: 'absolute',
      top: .02,
      left: .55,
      right: .05
    }
  };
};

Region.viewProps = (props) => {
  // region is expected from the query result
  const region = strPath('data.region', props);
  return {
    [c.region]: {region},
    [c.regionMapbox]: {region},
    [c.regionMapboxOuter]: {key: c.regionMapboxOuter},
    [c.regionSankey]: {region},
    [c.regionLocationsOuter]: {key: c.regionLocationsOuter}
  };
};

Region.viewActions = () => {
  return {
    [c.regionMapbox]: {}
  };
};

Region.renderData = ({views}) => {
    const props = propsFor(views);
    const propsSansClass = propsForSansClass(views);

    return [
      Div(props(c.regionMapboxOuter),
        //Mapbox(
        //  propsSansClass(c.regionMapbox)
        //),
        Sankey(
          propsSansClass(c.regionSankey)
        )
      )
      //Div(props(c.regionLocationsOuter),
      //  MarkerList(propsSansClass(c.regionLocations))
      //)
    ];
};


/**
 * Adds to props.views for each component configured in viewActions, viewProps, and viewStyles
 * @param {Object} props this.props or equivalent for testing
 * @returns {Object} modified props
 */
Region.views = composeViews(
  Region.viewActions(),
  Region.viewProps,
  Region.viewStyles
);

/**
 * Loading, Error, or Data based on the props
 */
Region.choicepoint = renderChoicepoint(
  renderErrorDefault(c.regionError),
  renderLoadingDefault(c.regionLoading),
  Region.renderData
);

Region.propTypes = {
  data: PropTypes.shape().isRequired,
  style: PropTypes.shape().isRequired
};

Region.propTypes = {};
