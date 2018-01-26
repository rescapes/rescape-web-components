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
} from 'rescape-helpers-component';
import * as R from 'ramda';
import {
  applyMatchingStyles, mergeAndApplyMatchingStyles,
  mergeAndSankeyLinkLegendlyMatchingStyles
} from 'selectors/styleSelectors';
import {Component} from 'react';
import {Flex as flex} from 'rebass';
import {Quarter as quarter, ThreeQuarters as threeQuarters} from 'components/atoms';
import {throwing} from 'rescape-ramda';

const {reqStrPath} = throwing;

const [Div, Quarter, ThreeQuarters, Flex] = eMap(['div', quarter, threeQuarters, flex]);

export const c = nameLookup({
  sankeyFilterer: true,
  sankeyFiltererBox: true,
  sankeyFiltererTitle: true,
  sankeyFiltererItems: true,
  sankeyFiltererItem: true,
  sankeyLinkLegendIcon: true,
  sankeyFiltererText: true,
  sankeyFiltererLoading: true,
  sankeyFiltererError: true
});

/**
 * The View for a Sankey on a Map
 */
class SankeyLinkLegend extends Component {
  render() {
    const props = SankeyLinkLegend.views(this.props);
    return Div(propsFor(props.views, c.sankeyFilterer),
      SankeyLinkLegend.choicepoint(props)
    );
  }
}

SankeyLinkLegend.renderData = ({views}) => {
  /* We additionally give Mapbox the container width and height so the map can track changes to these
   We have to apply the width and height fractions of this container to them.
   */
  const props = propsFor(views);
  const propsSansClass = propsForSansClass(views);
  const {items, ...sankeyLinkLegendItemsProps} = props(c.sankeyFiltererItems);
  const sankeyLinkLegendItemProps = itemizeProps(props(c.sankeyFiltererItem));
  const sankeyLinkLegendIconProps = itemizeProps(props(c.sankeyLinkLegendIcon));
  const sankeyLinkLegendTextProps = itemizeProps(props(c.sankeyFiltererText));
  return Div(props(c.sankeyFiltererBox), [
    Div(props(c.sankeyFiltererTitle)),
    Flex(sankeyLinkLegendItemsProps,
      R.map(
        d => SankeyLinkLegendItem({
          [c.sankeyFiltererItem]: sankeyLinkLegendItemProps(d),
          [c.sankeyLinkLegendIcon]: sankeyLinkLegendIconProps(d),
          [c.sankeyFiltererText]: sankeyLinkLegendTextProps(d)
        }),
        items
      )
    )
  ]);
};

const SankeyLinkLegendItem = (views) => {
  const props = R.prop(R.__, views);
  return Flex(props(c.sankeyFiltererItem), [
    Div(props(c.sankeyLinkLegendIcon)),
    Div(props(c.sankeyFiltererText))
  ]);
};

SankeyLinkLegend.viewStyles = ({style}) => {
  return {
    [c.sankeyFilterer]: mergeAndApplyMatchingStyles(style, {
      paddingTop: 4,
      paddingBottom: 4,
      paddingLeft: 16,
      paddingRight: 16
    }),
    [c.sankeyFiltererBox]: {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: '5px',
      padding: '2px'
    },
    [c.sankeyFiltererTitle]: {
      top: 0,
      height: '20px',
      marginBottom: '5px'
    },
    [c.sankeyFiltererItems]: applyMatchingStyles(style, {
      fontSize: '10px',
      fontFamily: 'sans-serif',
      width: '100%',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }),
    [c.sankeyFiltererItem]: {
      marginTop: '2px',
      marginBottom: '2px',
      width: '100%',
      height: '20px',
      padding: '2px'
    },
    [c.sankeyLinkLegendIcon]: {
      width: '30px',
      minWidth: '30px',
      marginLeft: '2px',
      marginRight: '4px',
      backgroundColor: reqStrPath('color')
    },
    [c.sankeyFiltererText]: {
    }
  };
};

SankeyLinkLegend.viewProps = props => {
  return {
    [c.sankeyFilterer]: {},
    [c.sankeyFiltererTitle]: {
      children: 'Links',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    [c.sankeyFiltererBox]: {},
    [c.sankeyFiltererItems]: {
      items: reqStrPath('items', props)
    },
    [c.sankeyFiltererItem]: {
      px: 2,
      key: R.always(reqStrPath('key'))
    },
    [c.sankeyLinkLegendIcon]: {
    },
    [c.sankeyFiltererText]: {
      children: R.always(reqStrPath('name'))
    }
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
  SankeyLinkLegend.viewProps,
  SankeyLinkLegend.viewStyles
);

/**
 * Loading, Error, or Data based on the props
 */
SankeyLinkLegend.choicepoint = renderChoicepoint(
  renderErrorDefault(c.sankeyFiltererError),
  renderLoadingDefault(c.sankeyFiltererLoading),
  SankeyLinkLegend.renderData
);

export default SankeyLinkLegend;
