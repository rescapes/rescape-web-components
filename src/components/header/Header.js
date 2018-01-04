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
import logoImage from 'media/urbinsight_logo_website.png'

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
    to: '/features'
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
    return Flex(propsFor(props.views, c.header),
      Header.choicepoint(props)
    );
  }
}

Header.renderData = ({views}) => {
  const props = propsFor(views);
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
}

/*
* Merges parent and state styles into component styles
* @param style
*/
Header.viewStyles = ({style}) => {
  return {
    [c.header]: {
      style
    },

    [c.headerLogo]: {
      style: {
        width: 200,
      }
    },

    [c.headerLinkHolder]: {
      style: {
        width: 1000,
        height: 100,
        alignItems: 'center',
        justifyContent: 'space-evenly'
      }
    },

    [c.headerLink]: {
      style: {
        color: '#C1C1C1'
      }
    },

  };
};

Header.viewProps = () => {
  return {
    [c.headerLogo]: {
      key: c.headerLogo,
      logoSrc: logoImage
    },
    [c.headerLinkHolder]: {
      key: c.headerLinkHolder
    },
    // Pass the datum properties to make each link and add a key using the text attribute
    [c.headerLink]: R.curry((_, d) => keyWith('text', d))
  };
};

Header.viewActions = () => {
  return {};
};
;

Header.renderLoading = ({data}) => {
  return [];
};

Header.renderError = ({data}) => {
  return [];
};

/**
 * Adds to props.views for each component configured in viewActions, viewProps, and viewStyles
 * @param {Object} props this.props or equivalent for testing
 * @returns {Object} modified props
 */
Header.views = composeViews(
  Header.viewActions(),
  Header.viewProps(),
  Header.viewStyles
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

