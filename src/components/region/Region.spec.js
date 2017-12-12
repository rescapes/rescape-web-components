import React from 'react';
import {shallow} from 'enzyme';

import {propsFromSampleStateAndContainer} from 'helpers/testHelpers';
import region from './Region'
import {eMap} from 'helpers/componentHelpers';
import {mapStateToProps, mapDispatchToProps} from './RegionContainer';
const [Region] = eMap([region]);

describe('Region', () => {
  const props = propsFromSampleStateAndContainer(
    mapStateToProps,
    mapDispatchToProps,
    {
      // style dimensions are normally from the parent
      style: {
        width: 500,
        height: 500
      }
    }
  );

  test('Can mount', () => {
    const wrapper = shallow(
      Region(props)
    );
    expect(wrapper).toMatchSnapshot();
  });
});
