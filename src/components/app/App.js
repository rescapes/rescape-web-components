import React, {Component} from 'react';
import Login from 'components/login';
import Main from 'components/main';
import {Switch as switchy, Route as route} from 'react-router-dom';
import {
  eMap, renderChoicepoint, nameLookup, propsFor, propsForSansClass,
  renderErrorDefault, renderLoadingDefault, composeViews
} from 'helpers/componentHelpers';
import header from 'components/header';
import * as R from 'ramda';
import {Provider as provider} from 'rebass';
import {theme} from 'styles/styles';
import {withRouter} from 'react-router';
import {Grid as grid} from 'components/atoms'
import {mergeAndApplyMatchingStyles} from 'selectors/styleSelectors';

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
    return Div(propsFor(c.app, props.views),
      App.choicepoint(props)
    );
  }
}

App.getStyles = ({style}) => {
  const headerHeight = 300
  return {
    [c.appHeader]: mergeAndApplyMatchingStyles(style, {
      width: R.identity,
      height: headerHeight
    }),
    [c.appBody]: mergeAndApplyMatchingStyles(style, {
      width: R.identity,
      height: R.flip(R.subtract)(headerHeight)
    })
  };
};

App.viewProps = () => {
  return {
    [c.provider]: {
      theme
    }
  };
};

App.viewActions = () => {
  return {};
};

App.renderData = ({views}) => {
  const props = R.flip(propsFor)(views);
  const propsSansClass = R.flip(propsForSansClass)(views);

  return Provider(props(c.provider),
    Div(props(c.app),
      Header(props(c.appHeader)),
      Grid(props(c.appBody),
        Switch({}, [
          Route({key: '/', exact: true, path: '/', component: Main}),
          Route({key: '/login', exact: true, path: '/login', component: Login})
        ])
      )
    )
  );
};

/**
 * Adds to props.views for each component configured in viewActions, viewProps, and getStyles
 * @param {Object} props this.props or equivalent for testing
 * @returns {Object} modified props
 */
App.views = composeViews(
  App.viewActions(),
  App.viewProps(),
  App.getStyles
);

/**
 * Loading, Error, or Data based on the props
 */
App.choicepoint = renderChoicepoint(
  renderErrorDefault(c.appError),
  renderLoadingDefault(c.appLoading),
  App.renderData
);

export default withRouter(App)
