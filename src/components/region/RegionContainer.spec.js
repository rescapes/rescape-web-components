import {mapStateToProps} from './RegionContainer';
import {makeSampleInitialState} from 'helpers/testHelpers';

describe('RegionContainer', () => {
  test('mapStateToProps', () => {
    const props = {
      style: {
        width: 500,
        height: 500
      }
    };

    expect(mapStateToProps(makeSampleInitialState(), props)).toMatchSnapshot();
  });
});
