import React, {Component} from 'react';
import {Link as link} from 'react-router-dom';
import {withRouter} from 'react-router';
import {throwing} from 'rescape-ramda';
import {
  composeViews, eMap, renderChoicepoint, nameLookup, propsFor,
  renderErrorDefault, renderLoadingDefault, keyWith, propsForItem
} from 'helpers/componentHelpers';
import * as R from 'ramda';
import {Grid as grid, Logo as logo} from 'components/atoms';
import {Box as box, Flex as flex} from 'rebass';

const [Div, Link, Grid, Flex, Box, Logo] = eMap(['div', link, grid, flex, box, logo]);

export const c = nameLookup({
  header: true,
  headerLogo: true,
  headerLinkHolder: true,
  headerLink: true,
  headerLanguageChooser: true,
  headerAccount: true,
  headerLoading: true,
  headerError: true
});

const links = [
  {
    text: 'Tour',
    to: '/tour'
  },
  {
    text: 'Features',
    to: '/tour'
  },
  {
    text: 'Partner Cities',
    to: '/partnerCities'
  },
  {
    text: 'EcoCompass',
    to: '/ecoCompass'
  },
  {
    text: 'About',
    to: '/about'
  }
];

/**
 * The Header
 */
class Header extends Component {
  render() {
    const props = Header.views(this.props);
    return Grid(propsFor(c.header, props.views),
      Header.choicepoint(props)
    );
  }
}

/*
* Merges parent and state styles into component styles
* @param style
*/
Header.getStyles = ({style}) => {
  return {
    [c.header]: {
      style
    },

    [c.headerLinkHolder]: {
      style: {}
    },

    [c.headerLink]: {
      style: {
        color: '#C1C1C1'
      }
    },

    [c.headerLogo]: {
      style: {}
    }

  };
};

Header.viewProps = () => {
  return {
    [c.headerLogo]: {key: c.headerLogo},
    [c.headerLinkHolder]: {key: c.headerLinkHolder},
    // Pass the datum properties to make each link and add a key using the text attribute
    [c.headerLink]: R.curry((_, d) => keyWith('text', d))
  };
};

Header.viewActions = () => {
  return {};
};

Header.renderData = ({views}) => {
  const props = R.flip(propsFor)(views);
  const linkPropsForItem = propsForItem(views, c.headerLink)
  const mapLinks = R.map(
    item => {
      // Extract out the text element
      const {text, ...linkProps} = linkPropsForItem(item)
      return Link(
        linkProps,
        text
      )
    }
  );

  return [
    Logo(props(c.headerLogo)),
    Flex(props(c.headerLinkHolder),
      mapLinks(links)
    )
  ];
};

Header.renderLoading = ({data}) => {
  return [];
};

Header.renderError = ({data}) => {
  return [];
};

/**
 * Adds to props.views for each component configured in viewActions, viewProps, and getStyles
 * @param {Object} props this.props or equivalent for testing
 * @returns {Object} modified props
 */
Header.views = composeViews(
  Header.viewActions(),
  Header.viewProps(),
  Header.getStyles
);

/**
 * Loading, Error, or Data based on the props
 */
Header.choicepoint = renderChoicepoint(
  renderErrorDefault(c.headerError),
  renderLoadingDefault(c.headerLoading),
  Header.renderData
);

export default withRouter(Header);

