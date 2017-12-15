import {mapStateToProps} from './HeaderContainer';
import {
  propsFromSampleStateAndContainer, propsWithGraphQlFromSampleStateAndContainer, wrapWithMockGraphqlAndStore
} from 'helpers/testHelpers';
import {testPropsMaker} from 'components/header/HeaderContainer';
import {testPropsMaker as currentPropsMaker} from 'components/current/CurrentContainer'
import {eMap} from 'helpers/componentHelpers';
import HeaderContainer from 'components/header/HeaderContainer';
import * as R from 'ramda'
import {queries} from 'components/header/HeaderContainer';

describe('HeaderContainer', () => {
  const props = propsFromSampleStateAndContainer(testPropsMaker, {})

  test('mapStateToProps', () => {
    expect(props).toMatchSnapshot()
  })

  test('render', () => {
    const [headerContainer] = eMap([HeaderContainer]);
    const wrapper = wrapWithMockGraphqlAndStore(headerContainer({}))
    const current = wrapper.find('Header');
    expect(R.keys(current.props())).toEqual(['data', 'views'])
  })
});
