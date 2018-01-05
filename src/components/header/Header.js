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
import {
  Box as box, Flex as flex, Button as button, ButtonOutline as buttonOutline, Group as group, createComponent
} from 'rebass'
import {util} from 'rebass'
import logoImage from 'media/urbinsight_logo_website.png'

const verticalGroup = createComponent({
  name: 'VerticalGroup',
  type: 'Group',
  props: {},
  style: props => {
    const R = util.px(props.R || props.theme.radius || 4)
    return {
      '& > *': {
        borderRadius: 0
      },
      '& > *:first-child': {
        borderRadius: `${R} ${R} 0 0`,
      },
      '& > *:last-child': {
        borderRadius: `0 0 ${R} ${R}`,
        borderTopWidth: 0
      }
    }
  }
})
/*
const verticalGroup = styled(group)`
  & > *:first-child {
    border-radius: ${({R}) => `${R}px ${R}px 0 0`};
  }
  & > *:last-child {
    border-radius: ${({R}) => `0 0 ${R}px ${R}px`};
  }
`
*/

const
  [Div, Link, Grid, Flex, Box, Logo, Button, ButtonOutline, Group, VerticalGroup] = eMap(
  ['div', link, grid, flex, box, logo, button, buttonOutline, group, verticalGroup]
);


const links = [
  {
    children: 'Tour',
    to: '/tour'
  },
  {
    children: 'Features',
    to: '/features'
  },
  {
    children: 'Partner Cities',
    to: '/partnerCities'
  },
  {
    children: 'EcoCompass',
    to: '/ecoCompass'
  },
  {
    children: 'About',
    to: '/about'
  }
];

const accountButtons = [
  {
    children: 'Sign-up',
    value: 'Create an account',
    onClick: () => {return null}//window.location.href='/signup'}
  },
  {
    children: 'Log in',
    value: 'Log into account',
    onClick: () => {return null}//window.location.href='/login'}
  }
]

const styles = {
  headerLinkColor: '#C1C1C1',
  headerLinkFontFamily: 'sans-serif',
  accountButtonColor: '#C1C1C1',
  languageChooserBackgroundColor: '#999999',
  languageChooserColor: 'white',
}

export const c = nameLookup({
  header: true,
  headerLogo: true,
  headerLinkHolder: true,
  headerLink: true,
  headerButtonHolder: true,
  headerLanguageChooser: true,
  headerAccountGroup: true,
  headerAccountButton: true,
  headerLoading: true,
  headerError: true
});

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
    item => Link(linkPropsForItem(item))
  );
  const accountButtonPropsForItem = propsForItem(views, c.headerAccountButton)
  const mapAccountButtons = R.map(
    item => ButtonOutline(accountButtonPropsForItem(item))
  )

  return [
    Logo(props(c.headerLogo)),
    Flex(props(c.headerLinkHolder),
      mapLinks(links)
    ),
    Flex(props(c.headerButtonHolder),
      Button(props(c.headerLanguageChooser)),
      VerticalGroup(props(c.headerAccountGroup),
        mapAccountButtons(accountButtons)
      )
    )
  ];
}

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
    [c.headerLink]: R.curry((_, d) => keyWith('children', d)),

    [c.headerButtonHolder]: {
      key: c.headerButtonHolder
    },

    [c.headerAccountGroup]: {
      // Radius used by Group & Vertical group
      R: 10
    },
    [c.headerAccountButton]: R.curry((_, d) => keyWith('children', d))
  };
};

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
      width: 300,
    },

    [c.headerLinkHolder]: {
      width: '100%',
      alignItems: 'center'
    },

    [c.headerLink]: {
      color: styles.headerLinkColor,
      textDecorationLine: 'none',
      fontFamily: styles.headerLinkFontFamily,
    },

    [c.headerButtonHolder]: {
      flexDirection: 'column',
      justifyContent: 'space-between'
    },

    [c.headerLanguageChooser]: {
      backgroundColor: styles.languageChooserBackgroundColor,
      color: styles.languageChooserBackgroundColor,
    },

    [c.headerAccountButton]: {
      color: styles.accountButtonColor,
      borderColor: styles.accountButtonColor,
      width: '100%'
    }
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

