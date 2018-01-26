import React, {Component} from 'react';
import Login from 'components/login';
import Main from 'components/main';
import {Switch as switchy, Route as route} from 'react-router-dom';
import { eMap, renderChoicepoint, nameLookup, propsFor, propsForSansClass, renderErrorDefault, renderLoadingDefault,
  composeViews } from 'rescape-helpers-component';
import header from 'components/header';
import * as R from 'ramda';
import {Provider as provider} from 'rebass';
import {theme} from 'styles/styles';
import {withRouter} from 'react-router';
import {Grid as grid} from 'components/atoms';
import {applyMatchingStyles, mergeAndApplyMatchingStyles} from 'selectors/styleSelectors';

const [Provider, Div, Header, Switch, Route, Grid] = eMap([provider, 'div', header, switchy, route, grid]);

export const c = nameLookup({
  provider: true,
  app: true,
  appHeader: true,
  appBody: true,
  appLoading: true,
  appError: true
});

class App extends Component {
  render() {
    const props = App.views(this.props);
    const propsOf = propsFor(props.views);
    return Provider(propsOf(c.provider),
      Div(propsOf(c.app),
        App.choicepoint(props)
      )
    );
  }
}

App.renderData = ({views}) => {
  const props = propsFor(views);

  return [
    Header(props(c.appHeader)),
    Grid(props(c.appBody),
      Switch({}, [
        Route({key: '/', exact: true, path: '/', component: Main}),
        Route({key: '/login', exact: true, path: '/login', component: Login})
      ])
    )
  ]
}

App.viewStyles = ({style}) => {
  const headerHeight = 100;
  return {
    [c.app]: mergeAndApplyMatchingStyles(style, {
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 16,
      paddingRight: 16
    }),
    [c.appHeader]: mergeAndApplyMatchingStyles(style, {
      // Use the browser width
      width: R.identity,
      height: headerHeight
    }),
    [c.appBody]: applyMatchingStyles(style, {
      width: '100%',
      height: R.flip(R.subtract)(headerHeight)
    })
  };
};

App.viewProps = () => {
  return {
    [c.provider]: {
      theme
    },
    [c.appHeader]: {
      key: c.appHeader
    },
    [c.appBody]: {
      key: c.appBody
    }
  };
};

App.viewActions = () => {
  return {};
};


/**
 * Adds to props.views for each component configured in viewActions, viewProps, and viewStyles
 * @param {Object} props this.props or equivalent for testing
 * @returns {Object} modified props
 */
App.views = composeViews(
  App.viewActions(),
  App.viewProps(),
  App.viewStyles
);

/**
 * Loading, Error, or Data based on the props
 */
App.choicepoint = renderChoicepoint(
  renderErrorDefault(c.appError),
  renderLoadingDefault(c.appLoading),
  App.renderData
);

export default withRouter(App);
