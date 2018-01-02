import React, {Component} from 'react';
import {Link as link} from 'react-router-dom';
import {withRouter} from 'react-router';
import {throwing} from 'rescape-ramda';
import {composeViews, eMap, renderChoicepoint, nameLookup, propsFor} from 'helpers/componentHelpers';
import * as R from 'ramda';
import {mergeAndApplyMatchingStyles} from 'selectors/styleSelectors';
import {Grid as grid, Logo as logo} from 'components/atoms';
import {Box as box, Flex as flex} from 'rebass';

const [Div, Link, Grid, Flex, Box, Logo] = eMap(['div', link, grid, flex, box, logo]);

export const c = nameLookup({
  header: true,
  headerLogo: true,
  headerLinkHolder: true,
  headerLink: true,
  headerLanguageChooser: true,
  headerAccoun: true
});

export const labels = {
  links: {
    tour: 'Tour',
    features: 'Features',
    partnerCities: 'Partner Cities',
    ecoCompass: 'EcoCompass',
    about: 'About'
  }
};

export const linkPaths = {
  tour: '/tour',
  features: '/features',
  partnerCities: '/partners',
  ecoCompass: '/ecoCompass',
  about: '/about'
};

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
      style: {
      }
    },

  };
};

Header.viewProps = () => {
  return {};
};

Header.viewActions = () => {
  return {};
};

Header.renderData = ({views}) => {
  const props = R.flip(propsFor)(views);
  const mergeLinkProps = R.merge(props(c.headerLink));
  const linkMaker = (linkPath, name) =>
    key => Box(mergeLinkProps({key, to: linkPath}), labels.links[name]);

  return [
    Logo(props(c.headerLogo)),
    Flex(props(c.headerLinkHolder),
      R.values(R.mapObjIndexed(
        linkMaker,
        linkPaths
      ))
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
  Header.renderError,
  Header.renderLoading,
  Header.renderData
);

export default withRouter(Header);

