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

const [Div, Header, Switch, Route] = eMap(['div', header, switchy, route]);

export const c = nameLookup({
  app: true,
  appHeader: true,
  appBody: true,
  appLoading: true,
  appError: true
});

export default class App extends Component {
  render() {
    const props = App.views(this.props);
    return Div(propsFor(c.app, props.views),
      App.choicepoint(props)
    );
  }
}

App.getStyles = ({style}) => {
  return {};
};

App.viewProps = () => {
  return {};
};

App.viewActions = () => {
  return {
    [c.regionMapbox]: {}
  };
};

App.renderData = ({views}) => {
  const props = R.flip(propsFor)(views);
  const propsSansClass = R.flip(propsForSansClass)(views);

  return Div(props(c.app),
    Header(props(c.appHeader)),
    Div(props(c.appBody),
      Switch({}, [
        Route({key: '/', exact: true, path: '/', component: Main}),
        Route({key: '/login', exact: true, path: '/login', component: Login})
      ])
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
