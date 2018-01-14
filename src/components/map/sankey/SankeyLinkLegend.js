/**
 * Created by Andy Likuski on 2018.01.14
 * Copyright (c) 2018 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import reactMapGl, {SVGOverlay as svgOverlay} from 'react-map-gl';
import {throwing} from 'rescape-ramda';
import {
  composeViews, eMap, renderChoicepoint, itemizeProps, mergePropsForViews, nameLookup, propsFor,
  propsForSansClass, renderErrorDefault, renderLoadingDefault, keyWith
} from 'helpers/componentHelpers';
import * as R from 'ramda';
import {
  applyMatchingStyles, mergeAndApplyMatchingStyles,
  mergeAndSankeyLinkLegendlyMatchingStyles
} from 'selectors/styleSelectors';
import {Component} from 'react';
import {Flex as flex} from 'rebass';
import {Grid as grid} from 'components/atoms';
import {throwing} from 'rescape-ramda'
const {reqStrPath} = throwing

const [Div, Grid, Flex] = eMap(['div', grid, flex]);

export const c = nameLookup({
  sankeyLinkLegend: true,
  sankeyLinkLegendBox: true,
  sankeyLinkLegendItems: true,
  sankeyLinkLegendItem: true,
  sankeyLinkLegendIcon: true,
  sankeyLinkLegendText: true,
  sankeyLoading: true,
  sankeyError: true
});

/**
 * The View for a Sankey on a Map
 */
class SankeyLinkLegend extends Component {
  render() {
    const props = SankeyLinkLegend.views(this.props);
    return Flex(propsFor(props.views, c.sankeyLinkLegend),
      Sankey.choicepoint(props)
    );
  }
}

SankeyLinkLegend.renderData = ({views}) => {
  /* We additionally give Mapbox the container width and height so the map can track changes to these
   We have to apply the width and height fractions of this container to them.
   */
  const props = propsFor(views);
  const propsSansClass = propsForSansClass(views);
  const sankeyLinkLegendItemsProps = itemizeProps(c.sankeyLinkLegendItem)
  const sankeyLinkLegendItemProps = itemizeProps(c.sankeyLinkLegendItem)
  return [
    Flex(props(c.sankeyLinkLegendItems),
      R.map(
        d => SankeyLinkLegendItem(sankeyLinkLegendItemProps(d)),
        sankeyLinkLegendItemsProps
      )
    )
  ];
};

const SankeyLinkLegendItem = (views) => {
  const props = propsFor(views);
  return Div(props(c.sankeyLinkLegendItem), [
    Div(props(c.sankeyLinkLegendIcon)),
    Div(props(c.sankeyLinkLegendText)),
  ])
};

SankeyLinkLegend.viewStyles = ({style}) => {
  return {
    [c.sankeyLinkLegend]: mergeAndApplyMatchingStyles(style, {
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 16,
      paddingRight: 16
    }),
    [c.sankeyLinkLegendBox]: {},
    [c.sankeyLinkLegendItems]: applyMatchingStyles(style, {
      justifyContent: 'space-between'
    }),
    [c.sankeyLinkLegendItem]: {},
    [c.sankeyLinkLegendIcon]: {},
    [c.sankeyLinkLegendText]: {}
  };
};

SankeyLinkLegend.viewProps = props => {
  return {
    [c.sankeyLinkLegend]: {},
    [c.sankeyLinkLegendBox]: {},
    [c.sankeyLinkLegendItems]: {
      items: reqStrPath('items', props)
    },
    [c.sankeyLinkLegendItem]: {},
    [c.sankeyLinkLegendIcon]: {},
    [c.sankeyLinkLegendText]: {}
  };
};

SankeyLinkLegend.viewActions = () => {
  return {};
};


/**
 * Adds to props.views for each component configured in viewActions, viewProps, and viewStyles
 * @param {Object} props this.props or equivalent for testing
 * @returns {Object} modified props
 */
SankeyLinkLegend.views = composeViews(
  SankeyLinkLegend.viewActions(),
  SankeyLinkLegend.viewProps(),
  SankeyLinkLegend.viewStyles
);

/**
 * Loading, Error, or Data based on the props
 */
SankeyLinkLegend.choicepoint = renderChoicepoint(
  renderErrorDefault(c.appError),
  renderLoadingDefault(c.appLoading),
  SankeyLinkLegend.renderData
);

export default SankeyLinkLegend;
