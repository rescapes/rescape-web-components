
import {styleMultiplier, createScaledPropertyGetter, classNamer} from './styleHelpers';
import {getClassAndStyle, getStyleObj} from 'helpers/styleHelpers';

describe('styles', () => {
  test('classNamer', () => {
    expect(classNamer('chicken', 'outsidePen')).toEqual('chicken-outside-pen')
  })
  test('getClassAndStyle', () => {
    expect(getClassAndStyle('chickenOutsidePen', {
      chickenOutsidePen: {
        style: {
          border: 'coop'
        }
      }
    })).toEqual({
      className: 'chicken-outside-pen',
      style: {
        border: 'coop'
      }
    })
  })
  expect(getStyleObj('chickenOutsidePen', {
    chickenOutsidePen: {
      style: {
        border: 'coop'
      }
    }
  })).toEqual({
    style: {
      border: 'coop'
    }
  })
  test('styleMultiplier', () => {
    expect(styleMultiplier(100, 0.25)).toEqual(25);
  });

  test('createScaledPropertyGetter', () => {
    expect(createScaledPropertyGetter([2, 4, 8], 'margin', 2)).toEqual({margin: 8});
    expect(() => createScaledPropertyGetter([2, 4, 8], 'margin', 'mayo')).toThrow();
    expect(() => createScaledPropertyGetter([2, 'tuna fish', 8], 'margin', 1)).toThrow();
  });
});
