import React, {Component} from 'react';
import {Link as link} from 'react-router-dom';
import {withRouter} from 'react-router';
import {throwing} from 'rescape-ramda';
import {composeViews, eMap, renderChoicepoint, joinComponents, nameLookup, propsFor} from 'helpers/componentHelpers';
import * as R from 'ramda';
import {mergeAndApplyMatchingStyles} from 'selectors/styleSelectors';
import {styleMultiplier} from 'helpers/styleHelpers';
const [Div, Link] = eMap(['div', link]);

export const c = nameLookup({
  header: true,
  headerLinks: true,
  headerText: true,
  link: true,
  linkSeparator: true
});

export const labels = {
  headerText: 'Urbinsight',
  links: {
    new: 'New',
    top: 'Top',
    search: 'Search'
  }
};

export const linkPaths = {
  new: '/',
  top: '/top',
  search: '/search'
};

/**
 * The Header
 */
class Header extends Component {
  render() {
    const props = Header.views(this.props);
    return Div(propsFor(c.header, props.views),
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
      className: 'flex pa1 justify-between nowrap',
      style: mergeAndApplyMatchingStyles(style, {
        position: 'absolute',
        width: styleMultiplier(1),
        height: styleMultiplier(1)
      })
    },

    [c.headerLinks]: {
      className: 'flex pa1 justify-between nowrap',
      style: mergeAndApplyMatchingStyles(style, {})
    },

    [c.headerText]: {
      className: 'fw7 mr1',
      style: mergeAndApplyMatchingStyles(style, {})
    },

    [c.link]: {
      className: 'ml1 no-underline black',
      style: mergeAndApplyMatchingStyles(style, {}),
    },

    [c.linkSeparator]: {
      className: 'ml1 no-underline black',
      style: mergeAndApplyMatchingStyles(style, {})
    }
  };
};

Header.viewProps = () => {
  return {
  };
};

Header.viewActions = () => {
  return {
  };
};

Header.renderData = ({views}) => {
  const props = R.flip(propsFor)(views);
  const mergeLinkProps = R.merge(props(c.link));
  const mergeSeparatorProps = R.merge(props(c.linkSeparator));
  const separator = key => Div(mergeSeparatorProps({key}), '|');
  const linkMaker = (linkPath, name) =>
      key => Link(mergeLinkProps({key, to: linkPath}), labels.links[name]);

  return Div(props(c.headerLinks),
    Div(props(c.headerText), linkMaker.headerText),
    // Puts separator components between link components
    ...joinComponents(
      separator,
      R.values(R.mapObjIndexed(
        linkMaker,
        linkPaths
      ))
    )
  );
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

