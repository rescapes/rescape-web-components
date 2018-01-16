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
} from 'helpers/componentHelpers';
import * as R from 'ramda';
import {
  applyMatchingStyles, mergeAndApplyMatchingStyles,
  mergeAndSankeyFiltererlyMatchingStyles
} from 'selectors/styleSelectors';
import {Component} from 'react';
import {Flex as flex, Checkbox as checkbox, Group as group} from 'rebass';
import {throwing} from 'rescape-ramda';
import {Grid as grid} from 'components/atoms';

const {reqStrPath} = throwing;

const [Div, Flex, Checkbox, Group, Grid] = eMap(['div', flex, checkbox, group, grid]);

export const c = nameLookup({
  sankeyFilterer: true,
  sankeyFiltererBox: true,
  sankeyFiltererTitle: true,
  sankeyFiltererItems: true,
  sankeyFiltererItem: true,
  sankeyFiltererCheckbox: true,
  sankeyFiltererText: true,
  sankeyFiltererLoading: true,
  sankeyFiltererError: true
});

/**
 * The View for a Sankey on a Map
 */
class SankeyFilterer extends Component {
  render() {
    const props = SankeyFilterer.views(this.props);
    return Div(propsFor(props.views, c.sankeyFilterer),
      SankeyFilterer.choicepoint(props)
    );
  }
}

SankeyFilterer.renderData = ({views}) => {
  /* We additionally give Mapbox the container width and height so the map can track changes to these
   We have to apply the width and height fractions of this container to them.
   */
  const props = propsFor(views);
  const propsSansClass = propsForSansClass(views);
  const {items, ...sankeyLinkLegendItemsProps} = props(c.sankeyFiltererItems);
  const sankeyLinkLegendItemProps = itemizeProps(props(c.sankeyFiltererItem));
  const sankeyLinkLegendCheckboxProps = itemizeProps(props(c.sankeyFiltererCheckbox));
  const sankeyLinkLegendTextProps = itemizeProps(props(c.sankeyFiltererText));
  return Div(props(c.sankeyFiltererBox), [
    Div(props(c.sankeyFiltererTitle)),
    Flex(sankeyLinkLegendItemsProps,
      R.map(
        d => SankeyFiltererItem({
          [c.sankeyFiltererItem]: sankeyLinkLegendItemProps(d),
          [c.sankeyFiltererCheckbox]: sankeyLinkLegendCheckboxProps(d),
          [c.sankeyFiltererText]: sankeyLinkLegendTextProps(d)
        }),
        items
      )
    )
  ]);
};

const SankeyFiltererItem = (views) => {
  const props = R.prop(R.__, views);
  return Group(props(c.sankeyFiltererItem), [
    Checkbox(props(c.sankeyFiltererCheckbox)),
    Grid(props(c.sankeyFiltererText))
  ]);
};

SankeyFilterer.viewStyles = ({style}) => {
  return {
    [c.sankeyFilterer]: mergeAndApplyMatchingStyles(style, {
      paddingTop: 4,
      paddingBottom: 4,
    }),

    [c.sankeyFiltererBox]: {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: '5px',
      padding: '2px',
      fontFamily: 'sans-serif'
    },

    [c.sankeyFiltererTitle]: {
      top: 0,
      height: '20px',
      marginBottom: '5px'
    },

    [c.sankeyFiltererItems]: applyMatchingStyles(style, {
      fontSize: '10px',
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

    [c.sankeyFiltererCheckbox]: {
      style: {},
      ml: '2px',
      mr: '4px'
    },

    [c.sankeyFiltererText]: {
    }
  };
};

SankeyFilterer.viewProps = props => {
  return {
    [c.sankeyFilterer]: {},
    [c.sankeyFiltererTitle]: {
      children: 'Filter by Material',
      fontSize: '12px',
      fontFamily: 'sans-serif',
      fontWeight: 'bold'
    },
    [c.sankeyFiltererBox]: {},
    [c.sankeyFiltererItems]: {
      items: reqStrPath('items', props)
    },
    [c.sankeyFiltererItem]: {
      px: 2,
      key: R.always(reqStrPath('material'))
    },
    [c.sankeyFiltererCheckbox]: {
      defaultChecked: true,
    },
    [c.sankeyFiltererText]: {
      children: R.always(reqStrPath('material'))
    }
  };
};

SankeyFilterer.viewActions = () => {
  return {
    [c.sankeyFiltererCheckbox]: [
      'filterSankey'
    ]
  };
};


/**
 * Adds to props.views for each component configured in viewActions, viewProps, and viewStyles
 * @param {Object} props this.props or equivalent for testing
 * @returns {Object} modified props
 */
SankeyFilterer.views = composeViews(
  SankeyFilterer.viewActions(),
  SankeyFilterer.viewProps,
  SankeyFilterer.viewStyles
);

/**
 * Loading, Error, or Data based on the props
 */
SankeyFilterer.choicepoint = renderChoicepoint(
  renderErrorDefault(c.sankeyFiltererError),
  renderLoadingDefault(c.sankeyFiltererLoading),
  SankeyFilterer.renderData
);

export default SankeyFilterer;
