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
  composeViews, eMap, renderChoicepoint, itemizeProps, nameLookup, propsFor,
  propsForSansClass, renderErrorDefault, renderLoadingDefault
} from 'rescape-helpers-component';
import * as R from 'ramda';
import {
  applyMatchingStyles, mergeAndApplyMatchingStyles
} from 'rescape-apollo';
import {Component} from 'react';
import {Flex as flex} from 'rebass';
import {reqStrPathThrowing} from 'rescape-ramda';

const [Div, Flex] = eMap(['div', flex]);

export const c = nameLookup({
  sankeyLinkLegend: true,
  sankeyLinkLegendBox: true,
  sankeyLinkLegendTitle: true,
  sankeyLinkLegendItems: true,
  sankeyLinkLegendItem: true,
  sankeyLinkLegendIcon: true,
  sankeyLinkLegendText: true,
  sankeyLinkLegendLoading: true,
  sankeyLinkLegendError: true
});

/**
 * The View for a Sankey on a Map
 */
class SankeyLinkLegend extends Component {
  render() {
    const props = SankeyLinkLegend.views(this.props);
    return Div(propsFor(props.views, c.sankeyLinkLegend),
      SankeyLinkLegend.choicepoint(props)
    );
  }
}

SankeyLinkLegend.renderData = ({views}) => {
  /* We additionally give Mapbox the container width and height so the map can track changes to these
   We have to apply the width and height fractions of this container to them.
   */
  const props = propsFor(views);
  const {items, ...sankeyLinkLegendItemsProps} = props(c.sankeyLinkLegendItems);
  const sankeyLinkLegendItemProps = itemizeProps(props(c.sankeyLinkLegendItem));
  const sankeyLinkLegendIconProps = itemizeProps(props(c.sankeyLinkLegendIcon));
  const sankeyLinkLegendTextProps = itemizeProps(props(c.sankeyLinkLegendText));
  return Div(props(c.sankeyLinkLegendBox), [
    Div(props(c.sankeyLinkLegendTitle)),
    Flex(sankeyLinkLegendItemsProps,
      R.map(
        d => SankeyLinkLegendItem({
          [c.sankeyLinkLegendItem]: sankeyLinkLegendItemProps(d),
          [c.sankeyLinkLegendIcon]: sankeyLinkLegendIconProps(d),
          [c.sankeyLinkLegendText]: sankeyLinkLegendTextProps(d)
        }),
        items
      )
    )
  ]);
};

const SankeyLinkLegendItem = (views) => {
  const props = R.prop(R.__, views);
  return Flex(props(c.sankeyLinkLegendItem), [
    Div(props(c.sankeyLinkLegendIcon)),
    Div(props(c.sankeyLinkLegendText))
  ]);
};

SankeyLinkLegend.viewStyles = ({style}) => {
  return {
    [c.sankeyLinkLegend]: mergeAndApplyMatchingStyles(style, {
      paddingTop: 4,
      paddingBottom: 4,
      paddingLeft: 16,
      paddingRight: 16
    }),
    [c.sankeyLinkLegendBox]: {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: '5px',
      padding: '2px'
    },
    [c.sankeyLinkLegendTitle]: {
      top: 0,
      height: '20px',
      marginBottom: '5px'
    },
    [c.sankeyLinkLegendItems]: applyMatchingStyles(style, {
      fontSize: '10px',
      fontFamily: 'sans-serif',
      width: '100%',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }),
    [c.sankeyLinkLegendItem]: {
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
      backgroundColor: reqStrPathThrowing('color')
    },
    [c.sankeyLinkLegendText]: {
    }
  };
};

SankeyLinkLegend.viewProps = props => {
  return {
    [c.sankeyLinkLegend]: {},
    [c.sankeyLinkLegendTitle]: {
      children: 'Links',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    [c.sankeyLinkLegendBox]: {},
    [c.sankeyLinkLegendItems]: {
      items: reqStrPathThrowing('items', props)
    },
    [c.sankeyLinkLegendItem]: {
      px: 2,
      key: R.always(reqStrPathThrowing('key'))
    },
    [c.sankeyLinkLegendIcon]: {
    },
    [c.sankeyLinkLegendText]: {
      children: R.always(reqStrPathThrowing('name'))
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
  renderErrorDefault(c.sankeyLinkLegendError),
  renderLoadingDefault(c.sankeyLinkLegendLoading),
  SankeyLinkLegend.renderData
);

export default SankeyLinkLegend;
