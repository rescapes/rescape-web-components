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

import {
  composeViews, eMap, renderChoicepoint, itemizeProps, mergePropsForViews, nameLookup, propsFor,
  propsForSansClass, renderErrorDefault, renderLoadingDefault, keyWith
} from 'helpers/componentHelpers';
import * as R from 'ramda';
import {
  applyMatchingStyles, mergeAndApplyMatchingStyles,
  mergeAndSankeyNodeLegendlyMatchingStyles
} from 'selectors/styleSelectors';
import {Component} from 'react';
import {Flex as flex} from 'rebass';
import {Quarter as quarter, ThreeQuarters as threeQuarters} from 'components/atoms';
import {throwing} from 'rescape-ramda';

const {reqStrPath} = throwing;

const [Div, Quarter, ThreeQuarters, Flex] = eMap(['div', quarter, threeQuarters, flex]);

export const c = nameLookup({
  sankeyNodeLegend: true,
  sankeyNodeLegendBox: true,
  sankeyNodeLegendTitle: true,
  sankeyNodeLegendItems: true,
  sankeyNodeLegendItem: true,
  sankeyNodeLegendIcon: true,
  sankeyNodeLegendText: true,
  sankeyNodeLegendLoading: true,
  sankeyNodeLegendError: true
});

/**
 * The View for a Sankey on a Map
 */
class SankeyNodeLegend extends Component {
  render() {
    const props = SankeyNodeLegend.views(this.props);
    return Div(propsFor(props.views, c.sankeyNodeLegend),
      SankeyNodeLegend.choicepoint(props)
    );
  }
}

SankeyNodeLegend.renderData = ({views}) => {
  /* We additionally give Mapbox the container width and height so the map can track changes to these
   We have to apply the width and height fractions of this container to them.
   */
  const props = propsFor(views);
  const propsSansClass = propsForSansClass(views);
  const {items, ...sankeyNodeLegendItemsProps} = props(c.sankeyNodeLegendItems);
  const sankeyNodeLegendItemProps = itemizeProps(props(c.sankeyNodeLegendItem));
  const sankeyNodeLegendIconProps = itemizeProps(props(c.sankeyNodeLegendIcon));
  const sankeyNodeLegendTextProps = itemizeProps(props(c.sankeyNodeLegendText));
  return Div(props(c.sankeyNodeLegendBox), [
    Div(props(c.sankeyNodeLegendTitle)),
    Flex(sankeyNodeLegendItemsProps,
      R.map(
        d => SankeyNodeLegendItem({
          [c.sankeyNodeLegendItem]: sankeyNodeLegendItemProps(d),
          [c.sankeyNodeLegendIcon]: sankeyNodeLegendIconProps(d),
          [c.sankeyNodeLegendText]: sankeyNodeLegendTextProps(d)
        }),
        items
      )
    )
  ]);
};

const SankeyNodeLegendItem = (views) => {
  const props = R.prop(R.__, views);
  return Flex(props(c.sankeyNodeLegendItem), [
    Div(props(c.sankeyNodeLegendIcon)),
    Div(props(c.sankeyNodeLegendText))
  ]);
};

SankeyNodeLegend.viewStyles = ({style}) => {
  return {
    [c.sankeyNodeLegend]: mergeAndApplyMatchingStyles(style, {
      paddingTop: 4,
      paddingBottom: 4,
      paddingLeft: 16,
      paddingRight: 16
    }),
    [c.sankeyNodeLegendBox]: {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: '5px',
      padding: '2px'
    },
    [c.sankeyNodeLegendTitle]: {
      top: 0,
      height: '20px',
      marginBottom: '5px'
    },
    [c.sankeyNodeLegendItems]: applyMatchingStyles(style, {
      fontSize: '10px',
      fontFamily: 'sans-serif',
      width: '100%',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }),
    [c.sankeyNodeLegendItem]: {
      marginTop: '2px',
      marginBottom: '2px',
      width: '100%',
      height: '20px',
      padding: '2px'
    },
    [c.sankeyNodeLegendIcon]: {
      key: c.sankeyNodeLegendIcon,
      width: '30px',
      minWidth: '30px',
      marginLeft: '2px',
      marginRight: '4px',
      backgroundColor: reqStrPath('color')
    },
    [c.sankeyNodeLegendText]: {
      key: c.sankeyNodeLegendText,
    }
  };
};

SankeyNodeLegend.viewProps = props => {
  return {
    [c.sankeyNodeLegend]: {},
    [c.sankeyNodeLegendTitle]: {
      children: 'Stages',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    [c.sankeyNodeLegendBox]: {},
    [c.sankeyNodeLegendItems]: {
      items: reqStrPath('items', props)
    },
    [c.sankeyNodeLegendItem]: {
      px: 2,
      key: R.always(reqStrPath('key'))
    },
    [c.sankeyNodeLegendIcon]: {
    },
    [c.sankeyNodeLegendText]: {
      children: R.always(reqStrPath('name'))
    }
  };
};

SankeyNodeLegend.viewActions = () => {
  return {};
};


/**
 * Adds to props.views for each component configured in viewActions, viewProps, and viewStyles
 * @param {Object} props this.props or equivalent for testing
 * @returns {Object} modified props
 */
SankeyNodeLegend.views = composeViews(
  SankeyNodeLegend.viewActions(),
  SankeyNodeLegend.viewProps,
  SankeyNodeLegend.viewStyles
);

/**
 * Loading, Error, or Data based on the props
 */
SankeyNodeLegend.choicepoint = renderChoicepoint(
  renderErrorDefault(c.sankeyNodeLegendError),
  renderLoadingDefault(c.sankeyNodeLegendLoading),
  SankeyNodeLegend.renderData
);

export default SankeyNodeLegend;
