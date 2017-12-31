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

const [Provider, Div, Header, Switch, Route] = eMap([provider, 'div', header, switchy, route]);

export const c = nameLookup({
  provider: true,
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
  return {
    // From the bass docs, edit at will
    // https://github.com/jxnblk/rebass
    theme: {
      breakpoints: [
        // min-width breakpoints in ems
        40, 52, 64
      ],
      space: [
        0, 6, 12, 18, 24, 30, 36
      ],
      fontSizes: [
        12, 16, 18, 24, 36, 48, 72
      ],
      weights: [
        400, 600
      ],
      colors: {
        black: '#111',
        white: '#fff',
        blue: '#07c'
      },
      font: 'Georgia, serif',
      monospace: '"Roboto Mono", Menlo, monospace',
      radius: 2
    }
  };
};

App.viewProps = () => {
  return {
    [c.theme]: {}
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
      Div(props(c.appBody),
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
